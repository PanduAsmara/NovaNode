import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { buildPlan } from '@novanode/installer';
import { InstallationStatus } from '@novanode/shared';
import { type Job } from 'bullmq';
import { EncryptionService } from '../common/encryption.service';
import { type SshConnection, SshService } from '../common/ssh.service';
import { PrismaService } from '../prisma/prisma.service';
import { INSTALLER_QUEUE, type InstallerJobData } from './installer.constants';

/**
 * Executes installer jobs: streams each provisioning step over SSH, appending
 * output to `Installation.log` (flushed ~1s) and transitioning the status
 * PENDING → RUNNING → SUCCESS / FAILED.
 */
@Processor(INSTALLER_QUEUE)
export class InstallerProcessor extends WorkerHost {
  private readonly logger = new Logger(InstallerProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ssh: SshService,
    private readonly encryption: EncryptionService,
  ) {
    super();
  }

  async process(job: Job<InstallerJobData>): Promise<void> {
    const { installationId, encConnection, os, kind, nodeId } = job.data;
    const connection = JSON.parse(this.encryption.decrypt(encConnection)) as SshConnection;

    let log = '';
    let dirty = false;
    const append = (text: string): void => {
      log += text;
      dirty = true;
    };
    const flush = async (): Promise<void> => {
      if (!dirty) return;
      dirty = false;
      await this.prisma.installation.update({ where: { id: installationId }, data: { log } }).catch(() => undefined);
    };
    const timer = setInterval(() => void flush(), 1000);

    try {
      await this.prisma.installation.update({
        where: { id: installationId },
        data: { status: InstallationStatus.RUNNING },
      });
      append(`NovaNode installer — ${kind} on ${os} (${connection.host})\n`);

      const steps = buildPlan({ os, kind });
      for (const step of steps) {
        append(`\n=== ${step.description} ===\n`);
        await flush();
        const { code } = await this.ssh.runScript(connection, step.script, append);
        if (code !== 0) {
          append(`\n[FAILED] "${step.description}" exited with code ${code}\n`);
          throw new Error(`Step failed: ${step.description} (exit ${code})`);
        }
        append(`\n[OK] ${step.description}\n`);
      }

      append('\n✔ Semua langkah selesai.\n');
      clearInterval(timer);
      await this.prisma.installation.update({
        where: { id: installationId },
        data: { status: InstallationStatus.SUCCESS, log },
      });

      if (kind === 'WINGS' && nodeId) {
        await this.prisma.node.update({ where: { id: nodeId }, data: { wingsInstalled: true } }).catch(() => undefined);
      }
    } catch (err) {
      clearInterval(timer);
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Installation ${installationId} failed: ${message}`);
      append(`\n✖ Gagal: ${message}\n`);
      await this.prisma.installation.update({
        where: { id: installationId },
        data: { status: InstallationStatus.FAILED, log },
      });
      // Swallow — status/log already reflect the failure; no BullMQ retry storm.
    }
  }
}
