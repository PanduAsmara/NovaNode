import { InjectQueue } from '@nestjs/bullmq';
import { BadRequestException, Injectable } from '@nestjs/common';
import { type InstallKind } from '@novanode/installer';
import { InstallationKind, InstallationStatus } from '@novanode/shared';
import { Queue } from 'bullmq';
import { EncryptionService } from '../common/encryption.service';
import type { SshConnection } from '../common/ssh.service';
import { NodesService } from '../nodes/nodes.service';
import { PrismaService } from '../prisma/prisma.service';
import { type CreateInstallDto } from './dto/create-install.dto';
import { INSTALLER_QUEUE, type InstallerJobData } from './installer.constants';

const KIND_LABEL: Record<InstallKind, string> = {
  PANEL: 'Pterodactyl Panel stack',
  WINGS: 'Pterodactyl Wings daemon',
  UPDATE: 'System update',
  REPAIR: 'Service repair',
  SERVICE: 'Service install',
};

@Injectable()
export class InstallerService {
  constructor(
    @InjectQueue(INSTALLER_QUEUE) private readonly queue: Queue<InstallerJobData>,
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
    private readonly nodes: NodesService,
  ) {}

  /** Resolve the SSH target from either a registered node or ad-hoc creds. */
  private async resolveTarget(
    dto: CreateInstallDto,
  ): Promise<{ connection: SshConnection; targetIp: string; nodeId: string | null }> {
    if (dto.nodeId) {
      const { connection } = await this.nodes.getSshConnection(dto.nodeId);
      return { connection, targetIp: connection.host, nodeId: dto.nodeId };
    }
    if (dto.ssh) {
      const connection: SshConnection = {
        host: dto.ssh.host,
        port: dto.ssh.port ?? 22,
        username: dto.ssh.user,
        authType: dto.ssh.authType,
        secret: dto.ssh.secret,
      };
      return { connection, targetIp: dto.ip ?? dto.ssh.host, nodeId: null };
    }
    throw new BadRequestException('Sertakan nodeId atau kredensial SSH (ssh).');
  }

  /** Create an Installation record and enqueue the provisioning job. */
  async start(kind: InstallKind, dto: CreateInstallDto) {
    const { connection, targetIp, nodeId } = await this.resolveTarget(dto);

    const installation = await this.prisma.installation.create({
      data: {
        targetIp,
        nodeId,
        kind: InstallationKind[kind],
        service: KIND_LABEL[kind],
        os: dto.os,
        status: InstallationStatus.PENDING,
        log: '',
      },
    });

    const encConnection = this.encryption.encrypt(JSON.stringify(connection));
    await this.queue.add(
      kind,
      { installationId: installation.id, encConnection, os: dto.os, kind, nodeId },
      { removeOnComplete: 50, removeOnFail: 50, attempts: 1 },
    );

    return installation;
  }

  list() {
    return this.prisma.installation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        targetIp: true,
        nodeId: true,
        kind: true,
        service: true,
        os: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async get(id: string) {
    const row = await this.prisma.installation.findUnique({ where: { id } });
    if (!row) throw new BadRequestException('Installation not found');
    return row;
  }
}
