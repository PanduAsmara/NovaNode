import { Injectable } from '@nestjs/common';
import { NodeStatus, type DashboardStats } from '@novanode/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async stats(): Promise<DashboardStats> {
    const [totalNodes, totalAllocations, onlineNodes, offlineNodes] = await Promise.all([
      this.prisma.node.count(),
      this.prisma.allocation.count(),
      this.prisma.node.count({ where: { status: NodeStatus.ONLINE } }),
      this.prisma.node.count({ where: { status: NodeStatus.OFFLINE } }),
    ]);

    return {
      totalNodes,
      totalServers: 0, // wired up once Pterodactyl sync lands (Phase 2)
      totalAllocations,
      onlineNodes,
      offlineNodes,
      cpuUsage: 0,
      ramUsage: 0,
      diskUsage: 0,
    };
  }
}
