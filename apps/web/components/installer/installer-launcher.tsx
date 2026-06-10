'use client';

import { Rocket } from 'lucide-react';
import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { InstallationKind, SshAuthType, SUPPORTED_OS } from '@novanode/shared';
import { type InstallerState, startInstall } from '@/app/actions/installer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import type { NodeRow } from '@/lib/types';

const initial: InstallerState = { error: null, message: null, installationId: null };

const KIND_OPTIONS: { value: InstallationKind; label: string }[] = [
  { value: InstallationKind.PANEL, label: 'Install Pterodactyl Panel' },
  { value: InstallationKind.WINGS, label: 'Install Wings' },
  { value: InstallationKind.UPDATE, label: 'Update System' },
  { value: InstallationKind.REPAIR, label: 'Repair Services' },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="gradient" disabled={pending}>
      <Rocket className="h-4 w-4" />
      {pending ? 'Menjalankan…' : 'Jalankan'}
    </Button>
  );
}

export function InstallerLauncher({ nodes }: { nodes: NodeRow[] }) {
  const [state, formAction] = useActionState(startInstall, initial);
  const [mode, setMode] = useState<'node' | 'manual'>(nodes.length > 0 ? 'node' : 'manual');
  const sshNodes = nodes.filter((n) => n.sshHost);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Jalankan Installer</CardTitle>
        <CardDescription>
          One-click provisioning via SSH. Target node tersimpan atau host manual.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="kind">Aksi</Label>
              <Select id="kind" name="kind" defaultValue={InstallationKind.PANEL}>
                {KIND_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="os">OS Target</Label>
              <Select id="os" name="os" defaultValue={SUPPORTED_OS[0]}>
                {SUPPORTED_OS.map((os) => (
                  <option key={os} value={os}>
                    {os}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="mode">Target</Label>
            <Select
              id="mode"
              name="mode"
              value={mode}
              onChange={(e) => setMode(e.target.value as 'node' | 'manual')}
            >
              <option value="node" disabled={sshNodes.length === 0}>
                Node tersimpan{sshNodes.length === 0 ? ' (belum ada node ber-SSH)' : ''}
              </option>
              <option value="manual">Host manual (SSH)</option>
            </Select>
          </div>

          {mode === 'node' ? (
            <div className="grid gap-1.5">
              <Label htmlFor="nodeId">Node</Label>
              <Select id="nodeId" name="nodeId" defaultValue={sshNodes[0]?.id}>
                {sshNodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name} — {n.sshUser}@{n.sshHost}:{n.sshPort}
                  </option>
                ))}
              </Select>
            </div>
          ) : (
            <div className="grid gap-4 rounded-lg border border-dashed p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="sshHost">SSH Host / IP</Label>
                  <Input id="sshHost" name="sshHost" placeholder="203.0.113.10" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="sshPort">SSH Port</Label>
                  <Input id="sshPort" name="sshPort" type="number" min={1} max={65535} defaultValue={22} />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="sshUser">SSH User</Label>
                  <Input id="sshUser" name="sshUser" placeholder="root" defaultValue="root" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="sshAuthType">Metode Auth</Label>
                  <Select id="sshAuthType" name="sshAuthType" defaultValue={SshAuthType.PASSWORD}>
                    {Object.values(SshAuthType).map((t) => (
                      <option key={t} value={t}>
                        {t === SshAuthType.PASSWORD ? 'Password' : 'Private Key'}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="sshSecret">Password / Private Key</Label>
                <textarea
                  id="sshSecret"
                  name="sshSecret"
                  rows={3}
                  placeholder="Password SSH atau private key (-----BEGIN ...)"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>
          )}

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          {state.message && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">{state.message}</p>
          )}

          <div>
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
