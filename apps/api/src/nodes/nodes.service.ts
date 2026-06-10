import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { NodeStatus } from '@novanode/shared';
import { EncryptionService } from '../common/encryption.service';
import type { SshConnection } from '../common/ssh.service';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateNodeDto } from './dto/create-node.dto';
import type { UpdateNodeDto } from './dto/update-node.dto';

/** Never return the encrypted SSH secret to API clients. */
const PUBLIC_OMIT = { sshSecret: true } as const;

@Injectable()
export class NodesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
  ) {}

  findAll() {
    return this.prisma.node.findMany({
      orderBy: { createdAt: 'asc' },
      omit: PUBLIC_OMIT,
      include: { _count: { select: { allocations: true } } },
    });
  }

  async findOne(id: string) {
    const node = await this.prisma.node.findUnique({
      where: { id },
      omit: PUBLIC_OMIT,
      include: { allocations: true },
    });
    if (!node) throw new NotFoundException('Node not found');
    return node;
  }

  /** Encrypt the SSH secret (if present) before persisting. */
  private encryptSecret<T extends { sshSecret?: string }>(dto: T): T {
    if (dto.sshSecret) {
      return { ...dto, sshSecret: this.encryption.encrypt(dto.sshSecret) };
    }
    return dto;
  }

  create(dto: CreateNodeDto) {
    return this.prisma.node.create({
      data: { ...this.encryptSecret(dto), status: NodeStatus.UNKNOWN },
      omit: PUBLIC_OMIT,
    });
  }

  async update(id: string, dto: UpdateNodeDto) {
    await this.findOne(id);
    // Empty sshSecret means "leave unchanged"; encryptSecret skips it.
    return this.prisma.node.update({
      where: { id },
      data: this.encryptSecret(dto),
      omit: PUBLIC_OMIT,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.node.delete({ where: { id } });
    return { id };
  }

  /**
   * Connection / health check (Phase 2 will perform a real Wings ping).
   * For now this records and returns the last known status.
   */
  async healthCheck(id: string) {
    const node = await this.findOne(id);
    return { id: node.id, status: node.status };
  }

  /**
   * Resolve a node's SSH connection with the secret decrypted, for the
   * installer / wings / monitoring workers. Throws if SSH isn't configured.
   */
  async getSshConnection(id: string): Promise<{ connection: SshConnection; node: { id: string; fqdn: string } }> {
    const node = await this.prisma.node.findUnique({
      where: { id },
      select: {
        id: true,
        fqdn: true,
        sshHost: true,
        sshPort: true,
        sshUser: true,
        sshAuthType: true,
        sshSecret: true,
      },
    });
    if (!node) throw new NotFoundException('Node not found');
    if (!node.sshHost || !node.sshUser || !node.sshAuthType || !node.sshSecret) {
      throw new BadRequestException('Node belum dikonfigurasi SSH (host/user/auth/secret).');
    }
    return {
      node: { id: node.id, fqdn: node.fqdn },
      connection: {
        host: node.sshHost,
        port: node.sshPort,
        username: node.sshUser,
        authType: node.sshAuthType,
        secret: this.encryption.decrypt(node.sshSecret),
      },
    };
  }
}
