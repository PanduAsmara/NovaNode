import { redirect } from 'next/navigation';
import { InstallationList } from '@/components/installer/installation-list';
import { InstallerLauncher } from '@/components/installer/installer-launcher';
import { serverApi } from '@/lib/server-api';
import { canWrite, getProfile } from '@/lib/session';
import type { InstallationRow, NodeRow } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function InstallerPage() {
  const profile = await getProfile();
  if (!canWrite(profile.role)) redirect('/dashboard');

  const [nodes, installations] = await Promise.all([
    serverApi<NodeRow[]>('/nodes'),
    serverApi<InstallationRow[]>('/installer/logs'),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Installer</h1>
        <p className="text-sm text-muted-foreground">
          One-click deploy Panel / Wings dan maintenance host via SSH.
        </p>
      </div>

      <InstallerLauncher nodes={nodes} />

      <div className="space-y-3">
        <h2 className="text-lg font-medium">Riwayat Job</h2>
        <InstallationList installations={installations} />
      </div>
    </div>
  );
}
