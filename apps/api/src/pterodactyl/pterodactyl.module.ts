import { Module } from '@nestjs/common';
import { PterodactylController } from './pterodactyl.controller';
import { PterodactylService } from './pterodactyl.service';

@Module({
  controllers: [PterodactylController],
  providers: [PterodactylService],
  exports: [PterodactylService],
})
export class PterodactylModule {}
