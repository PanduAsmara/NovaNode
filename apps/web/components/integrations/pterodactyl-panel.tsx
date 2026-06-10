'use client';

import { Network, RefreshCw, Server } from 'lucide-react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  type PtState,
  savePterodactylConfig,
  syncPterodactylAllocations,
  syncPterodactylNodes,
} from '@/app/actions/pterodactyl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initial: PtState = { error: null, message: null };

interface PanelStatus {
  configured: boolean;
  baseUrl: string | null;
  connected: boolean;
  nodeCount: number;
}

function SubmitButton({
  label,
  icon,
  variant = 'default',
}: {
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'gradient' | 'outline';
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} disabled={pending}>
      {icon}
      {pending ? 'Memproses…' : label}
    </Button>
  );
}

function Result({ state }: { state: PtState }) {
  if (state.error) return <p className="text-sm text-destructive">{state.error}</p>;
  if (state.message) return <p className="text-sm text-emerald-600 dark:text-emerald-400">{state.message}</p>;
  return null;
}

export function PterodactylPanel({ status }: { status: PanelStatus }) {
  const [configState, configAction] = useActionState(savePterodactylConfig, initial);
  const [nodesState, nodesAction] = useActionState(syncPterodactylNodes, initial);
  const [allocState, allocAction] = useActionState(syncPterodactylAllocations, initial);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Koneksi Panel</CardTitle>
            {status.configured ? (
              <Badge variant={status.connected ? 'success' : 'destructive'}>
                {status.connected ? 'Terhubung' : 'Terputus'}
              </Badge>
            ) : (
              <Badge variant="muted">Belum dikonfigurasi</Badge>
            )}
          </div>
          <CardDescription>
            Hubungkan panel Pterodactyl via Application API Key untuk sinkronisasi data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={configAction} className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="baseUrl">Panel URL</Label>
              <Input
                id="baseUrl"
                name="baseUrl"
                placeholder="https://panel.example.com"
                defaultValue={status.baseUrl ?? ''}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="apiKey">Application API Key</Label>
              <Input
                id="apiKey"
                name="apiKey"
                type="password"
                placeholder={status.configured ? '•••••••• (isi untuk mengganti)' : 'ptla_...'}
                required
              />
            </div>
            <Result state={configState} />
            <div>
              <SubmitButton label="Simpan & Tes Koneksi" variant="gradient" />
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sinkronisasi</CardTitle>
          <CardDescription>
            Tarik data dari panel ke NovaNode. {status.connected ? `~${status.nodeCount} node terdeteksi.` : 'Hubungkan panel terlebih dahulu.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <form action={nodesAction} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Server className="h-4 w-4 text-muted-foreground" />
              Sync Nodes
            </div>
            <SubmitButton label="Sync" icon={<RefreshCw className="h-4 w-4" />} variant="outline" />
          </form>
          <Result state={nodesState} />

          <form action={allocAction} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Network className="h-4 w-4 text-muted-foreground" />
              Sync Allocations
            </div>
            <SubmitButton label="Sync" icon={<RefreshCw className="h-4 w-4" />} variant="outline" />
          </form>
          <Result state={allocState} />
        </CardContent>
      </Card>
    </div>
  );
}
