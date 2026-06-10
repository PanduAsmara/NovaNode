import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserRole } from '@novanode/shared';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateInstallDto } from './dto/create-install.dto';
import { InstallerService } from './installer.service';

@Controller('installer')
export class InstallerController {
  constructor(private readonly installer: InstallerService) {}

  @Roles(UserRole.ADMIN)
  @Post('panel')
  installPanel(@Body() dto: CreateInstallDto) {
    return this.installer.start('PANEL', dto);
  }

  @Roles(UserRole.ADMIN)
  @Post('wings')
  installWings(@Body() dto: CreateInstallDto) {
    return this.installer.start('WINGS', dto);
  }

  @Roles(UserRole.ADMIN)
  @Post('update')
  update(@Body() dto: CreateInstallDto) {
    return this.installer.start('UPDATE', dto);
  }

  @Roles(UserRole.ADMIN)
  @Post('repair')
  repair(@Body() dto: CreateInstallDto) {
    return this.installer.start('REPAIR', dto);
  }

  // Reads: any authenticated user (consistent with GET /nodes).
  @Get('logs')
  list() {
    return this.installer.list();
  }

  @Get('logs/:id')
  get(@Param('id') id: string) {
    return this.installer.get(id);
  }
}
