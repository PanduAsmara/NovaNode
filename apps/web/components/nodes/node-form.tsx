'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { NodeStatus, SshAuthType } from '@novanode/shared';
import type { FormState } from '@/app/actions/nodes';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import type { NodeDetail } from '@/lib/types';

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Menyimpan…' : label}
    </Button>
  );
}

interface NodeFormProps {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  node?: NodeDetail;
  submitLabel: string;
}

export function NodeForm({ action, node, submitLabel }: NodeFormProps) {
  const [state, formAction] = useActionState(action, { error: null });
  const isEdit = Boolean(node);

  return (
    <form action={formAction} className="grid max-w-xl gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="name">Nama</Label>
        <Input id="name" name="name" defaultValue={node?.name} placeholder="us-node-1" required minLength={2} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="fqdn">FQDN / Host</Label>
        <Input id="fqdn" name="fqdn" defaultValue={node?.fqdn} placeholder="node1.example.com" required minLength={3} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="location">Lokasi (opsional)</Label>
        <Input id="location" name="location" defaultValue={node?.location ?? ''} placeholder="Singapore" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="token">Token (opsional)</Label>
        <Input id="token" name="token" defaultValue={node?.token ?? ''} placeholder="Wings daemon token" />
      </div>
      {isEdit && (
        <div className="grid gap-1.5">
          <Label htmlFor="status">Status</Label>
          <Select id="status" name="status" defaultValue={node?.status}>
            {Object.values(NodeStatus).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="mt-2 space-y-4 rounded-lg border border-dashed p-4">
        <div>
          <h2 className="text-sm font-semibold">Akses SSH (opsional)</h2>
          <p className="text-xs text-muted-foreground">
            Dibutuhkan oleh Installer, Wings, dan Monitoring. Secret disimpan terenkripsi.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="sshHost">SSH Host / IP</Label>
            <Input id="sshHost" name="sshHost" defaultValue={node?.sshHost ?? ''} placeholder="203.0.113.10" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="sshPort">SSH Port</Label>
            <Input id="sshPort" name="sshPort" type="number" min={1} max={65535} defaultValue={node?.sshPort ?? 22} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="sshUser">SSH User</Label>
            <Input id="sshUser" name="sshUser" defaultValue={node?.sshUser ?? ''} placeholder="root" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="sshAuthType">Metode Auth</Label>
            <Select id="sshAuthType" name="sshAuthType" defaultValue={node?.sshAuthType ?? SshAuthType.PASSWORD}>
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
            defaultValue=""
            placeholder={
              isEdit
                ? '•••••••• (kosongkan untuk mempertahankan yang tersimpan)'
                : 'Password SSH atau isi private key (-----BEGIN ...)'
            }
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div className="flex items-center gap-3">
        <SubmitButton label={submitLabel} />
        <Link href="/nodes" className={buttonVariants({ variant: 'outline' })}>
          Batal
        </Link>
      </div>
    </form>
  );
}
