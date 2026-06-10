import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UserRole } from '@novanode/shared';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';
import { NodesService } from './nodes.service';

@Controller('nodes')
export class NodesController {
  constructor(private readonly nodes: NodesService) {}

  @Get()
  findAll() {
    return this.nodes.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nodes.findOne(id);
  }

  @Get(':id/health')
  health(@Param('id') id: string) {
    return this.nodes.healthCheck(id);
  }

  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateNodeDto) {
    return this.nodes.create(dto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateNodeDto) {
    return this.nodes.update(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nodes.remove(id);
  }
}
