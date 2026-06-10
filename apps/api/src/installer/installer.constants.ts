/** BullMQ queue name for installer / provisioning jobs. */
export const INSTALLER_QUEUE = 'installer';

import type { InstallKind } from '@novanode/installer';
import type { SupportedOS } from '@novanode/shared';

/** Payload carried by every installer job (secrets are encrypted). */
export interface InstallerJobData {
  installationId: string;
  /** EncryptionService.encrypt(JSON.stringify(SshConnection)) — no plaintext in Redis. */
  encConnection: string;
  os: SupportedOS;
  kind: InstallKind;
  nodeId: string | null;
}
