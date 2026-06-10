import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserRole } from '@novanode/shared';
import { Roles } from '../auth/decorators/roles.decorator';
import { SetConfigDto } from './dto/set-config.dto';
import { PterodactylService } from './pterodactyl.service';

@Roles(UserRole.ADMIN)
@Controller('pterodactyl')
export class PterodactylController {
  constructor(private readonly pterodactyl: PterodactylService) {}

  @Get('status')
  status() {
    return this.pterodactyl.status();
  }

  @Get('config')
  config() {
    return this.pterodactyl.status();
  }

  @Post('config')
  saveConfig(@Body() dto: SetConfigDto) {
    return this.pterodactyl.saveConfig(dto);
  }

  @Post('sync/nodes')
  syncNodes() {
    return this.pterodactyl.syncNodes();
  }

  @Post('sync/allocations')
  syncAllocations() {
    return this.pterodactyl.syncAllocations();
  }
}
