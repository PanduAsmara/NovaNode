import { Global, Module } from '@nestjs/common';
import { EncryptionService } from './encryption.service';
import { SshService } from './ssh.service';

/** Cross-cutting providers (encryption, SSH) shared by feature modules. */
@Global()
@Module({
  providers: [EncryptionService, SshService],
  exports: [EncryptionService, SshService],
})
export class CommonModule {}
