import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { UserRole } from '@novanode/shared';
import { Roles } from '../auth/decorators/roles.decorator';
import { AllocationsService } from './allocations.service';
import { BulkAllocationDto } from './dto/bulk-allocation.dto';
import { CreateAllocationDto } from './dto/create-allocation.dto';

@Controller('allocations')
export class AllocationsController {
  constructor(private readonly allocations: AllocationsService) {}

  @Get()
  findAll(@Query('nodeId') nodeId?: string) {
    return this.allocations.findAll(nodeId);
  }

  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateAllocationDto) {
    return this.allocations.create(dto);
  }

  @Roles(UserRole.ADMIN)
  @Post('bulk')
  bulk(@Body() dto: BulkAllocationDto) {
    return this.allocations.bulkCreate(dto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.allocations.remove(id);
  }
}
