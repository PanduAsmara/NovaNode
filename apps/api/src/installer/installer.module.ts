import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { NodesModule } from '../nodes/nodes.module';
import { InstallerController } from './installer.controller';
import { InstallerProcessor } from './installer.processor';
import { InstallerService } from './installer.service';
import { INSTALLER_QUEUE } from './installer.constants';

@Module({
  imports: [BullModule.registerQueue({ name: INSTALLER_QUEUE }), NodesModule],
  controllers: [InstallerController],
  providers: [InstallerService, InstallerProcessor],
})
export class InstallerModule {}
