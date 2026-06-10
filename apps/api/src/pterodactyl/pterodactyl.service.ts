import { BadRequestException, Injectable } from '@nestjs/common';
import axios, { type AxiosInstance } from 'axios';
import { NodeStatus } from '@novanode/shared';
import { EncryptionService } from '../common/encryption.service';
import { PrismaService } from '../prisma/prisma.service';
import type { SetConfigDto } from './dto/set-config.dto';

const SETTING_KEY = 'pterodactyl';

interface PterodactylConfig {
  baseUrl: string;
  apiKey: string;
}

/** Subset of a Pterodactyl Application API node resource we care about. */
interface PanelNode {
  attributes: {
    id: number;
    name: string;
    fqdn: string;
    location_id: number;
    relationships?: {
      location?: { attributes?: { short?: string; long?: string } };
    };
  };
}

interface PanelAllocation {
  attributes: { id: number; ip: string; port: number; alias: string | null };
}

interface PanelList<T> {
  data: T[];
  meta?: { pagination?: { total_pages?: number } };
}

@Injectable()
export class PterodactylService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
  ) {}

  /** Stored config with the API key decrypted, or null if not configured. */
  private async getConfig(): Promise<PterodactylConfig | null> {
    const row = await this.prisma.setting.findUnique({ where: { key: SETTING_KEY } });
    if (!row) return null;
    const value = row.value as { baseUrl: string; apiKey: string };
    return { baseUrl: value.baseUrl, apiKey: this.encryption.decrypt(value.apiKey) };
  }

  private client(config: PterodactylConfig): AxiosInstance {
    return axios.create({
      baseURL: `${config.baseUrl.replace(/\/$/, '')}/api/application`,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      timeout: 15_000,
    });
  }

  private toFriendlyError(err: unknown): never {
    if (axios.isAxiosError(err)) {
      if (err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          throw new BadRequestException('Pterodactyl menolak API key (401/403). Periksa kembali key.');
        }
        throw new BadRequestException(`Pterodactyl merespons ${err.response.status}.`);
      }
      throw new BadRequestException(`Tidak dapat menghubungi panel: ${err.code ?? err.message}.`);
    }
    throw new BadRequestException('Gagal memanggil Pterodactyl.');
  }

  /** Masked config + live connection status for the UI. */
  async status(): Promise<{ configured: boolean; baseUrl: string | null; connected: boolean; nodeCount: number }> {
    const config = await this.getConfig();
    if (!config) return { configured: false, baseUrl: null, connected: false, nodeCount: 0 };

    try {
      const res = await this.client(config).get<PanelList<PanelNode>>('/nodes', {
        params: { per_page: 1 },
      });
      const total = res.data.meta?.pagination?.total_pages;
      // total_pages with per_page=1 ≈ node count.
      return {
        configured: true,
        baseUrl: config.baseUrl,
        connected: true,
        nodeCount: typeof total === 'number' ? total : res.data.data.length,
      };
    } catch {
      return { configured: true, baseUrl: config.baseUrl, connected: false, nodeCount: 0 };
    }
  }

  /** Validate credentials then persist (API key encrypted). */
  async saveConfig(dto: SetConfigDto): Promise<{ connected: boolean; baseUrl: string }> {
    const config: PterodactylConfig = { baseUrl: dto.baseUrl, apiKey: dto.apiKey };
    try {
      await this.client(config).get('/nodes', { params: { per_page: 1 } });
    } catch (err) {
      this.toFriendlyError(err);
    }

    await this.prisma.setting.upsert({
      where: { key: SETTING_KEY },
      update: { value: { baseUrl: config.baseUrl, apiKey: this.encryption.encrypt(config.apiKey) } },
      create: {
        key: SETTING_KEY,
        value: { baseUrl: config.baseUrl, apiKey: this.encryption.encrypt(config.apiKey) },
      },
    });
    return { connected: true, baseUrl: config.baseUrl };
  }

  private async requireConfig(): Promise<PterodactylConfig> {
    const config = await this.getConfig();
    if (!config) throw new BadRequestException('Pterodactyl belum dikonfigurasi.');
    return config;
  }

  private async fetchAll<T>(client: AxiosInstance, path: string, params: Record<string, unknown> = {}): Promise<T[]> {
    const out: T[] = [];
    let page = 1;
    let totalPages = 1;
    do {
      const res = await client.get<PanelList<T>>(path, { params: { ...params, page, per_page: 100 } });
      out.push(...res.data.data);
      totalPages = res.data.meta?.pagination?.total_pages ?? 1;
      page += 1;
    } while (page <= totalPages);
    return out;
  }

  /** Import / update nodes from the panel into the local `nodes` table. */
  async syncNodes(): Promise<{ created: number; updated: number; total: number }> {
    const config = await this.requireConfig();
    const client = this.client(config);

    let nodes: PanelNode[];
    try {
      nodes = await this.fetchAll<PanelNode>(client, '/nodes', { include: 'location' });
    } catch (err) {
      this.toFriendlyError(err);
    }

    let created = 0;
    let updated = 0;
    for (const node of nodes) {
      const a = node.attributes;
      const location = a.relationships?.location?.attributes;
      const data = {
        name: a.name,
        fqdn: a.fqdn,
        location: location?.long ?? location?.short ?? null,
        status: NodeStatus.UNKNOWN,
      };
      const existing = await this.prisma.node.findUnique({ where: { pterodactylId: a.id } });
      if (existing) {
        await this.prisma.node.update({ where: { pterodactylId: a.id }, data });
        updated += 1;
      } else {
        await this.prisma.node.create({ data: { ...data, pterodactylId: a.id } });
        created += 1;
      }
    }
    return { created, updated, total: nodes.length };
  }

  /** Import allocations for every panel-linked node. */
  async syncAllocations(): Promise<{ created: number; nodes: number }> {
    const config = await this.requireConfig();
    const client = this.client(config);
    const localNodes = await this.prisma.node.findMany({
      where: { pterodactylId: { not: null } },
      select: { id: true, pterodactylId: true },
    });

    let created = 0;
    for (const node of localNodes) {
      let allocations: PanelAllocation[];
      try {
        allocations = await this.fetchAll<PanelAllocation>(
          client,
          `/nodes/${node.pterodactylId}/allocations`,
        );
      } catch (err) {
        this.toFriendlyError(err);
      }
      if (allocations.length === 0) continue;
      const res = await this.prisma.allocation.createMany({
        data: allocations.map((al) => ({
          nodeId: node.id,
          ip: al.attributes.ip,
          port: al.attributes.port,
          alias: al.attributes.alias,
        })),
        skipDuplicates: true,
      });
      created += res.count;
    }
    return { created, nodes: localNodes.length };
  }
}
