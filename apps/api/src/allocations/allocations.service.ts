import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@novanode/database';
import { PrismaService } from '../prisma/prisma.service';
import type { BulkAllocationDto } from './dto/bulk-allocation.dto';
import type { CreateAllocationDto } from './dto/create-allocation.dto';

@Injectable()
export class AllocationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(nodeId?: string) {
    return this.prisma.allocation.findMany({
      where: nodeId ? { nodeId } : undefined,
      orderBy: [{ ip: 'asc' }, { port: 'asc' }],
    });
  }

  create(dto: CreateAllocationDto) {
    return this.prisma.allocation.create({ data: dto });
  }

  /** Bulk import: skips duplicates thanks to the (nodeId, ip, port) unique index. */
  async bulkCreate(dto: BulkAllocationDto) {
    const data: Prisma.AllocationCreateManyInput[] = dto.ports.map((port, i) => ({
      nodeId: dto.nodeId,
      ip: dto.ip,
      port,
      alias: dto.aliases?.[i],
    }));
    const result = await this.prisma.allocation.createMany({ data, skipDuplicates: true });
    return { created: result.count };
  }

  async remove(id: string) {
    const existing = await this.prisma.allocation.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Allocation not found');
    await this.prisma.allocation.delete({ where: { id } });
    return { id };
  }
}
