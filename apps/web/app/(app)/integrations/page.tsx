import { redirect } from 'next/navigation';
import { PterodactylPanel } from '@/components/integrations/pterodactyl-panel';
import { serverApi } from '@/lib/server-api';
import { canWrite, getProfile } from '@/lib/session';

export const dynamic = 'force-dynamic';

interface PterodactylStatus {
  configured: boolean;
  baseUrl: string | null;
  connected: boolean;
  nodeCount: number;
}

export default async function IntegrationsPage() {
  const profile = await getProfile();
  if (!canWrite(profile.role)) redirect('/dashboard');

  const status = await serverApi<PterodactylStatus>('/pterodactyl/status');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
        <p className="text-sm text-muted-foreground">
          Hubungkan & sinkronkan NovaNode dengan panel Pterodactyl.
        </p>
      </div>
      <PterodactylPanel status={status} />
    </div>
  );
}
