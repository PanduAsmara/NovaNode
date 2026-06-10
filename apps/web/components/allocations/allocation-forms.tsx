'use client';

import { Plus, Upload } from 'lucide-react';
import { type ReactNode, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { bulkAllocation, createAllocation } from '@/app/actions/allocations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

interface NodeOption {
  id: string;
  name: string;
}

function SubmitButton({ label, icon }: { label: string; icon: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {icon}
      {pending ? 'Menyimpan…' : label}
    </Button>
  );
}

function NodeSelect({ nodes, defaultValue }: { nodes: NodeOption[]; defaultValue?: string }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor="nodeId">Node</Label>
      <Select id="nodeId" name="nodeId" defaultValue={defaultValue} required>
        <option value="" disabled>
          Pilih node…
        </option>
        {nodes.map((n) => (
          <option key={n.id} value={n.id}>
            {n.name}
          </option>
        ))}
      </Select>
    </div>
  );
}

export function AllocationForms({
  nodes,
  defaultNodeId,
}: {
  nodes: NodeOption[];
  defaultNodeId?: string;
}) {
  const [singleState, singleAction] = useActionState(createAllocation, { error: null });
  const [bulkState, bulkAction] = useActionState(bulkAllocation, { error: null });

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tambah Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={singleAction} className="grid gap-3">
            <NodeSelect nodes={nodes} defaultValue={defaultNodeId} />
            <div className="grid gap-1.5">
              <Label htmlFor="ip">IP Address</Label>
              <Input id="ip" name="ip" placeholder="0.0.0.0" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="port">Port</Label>
                <Input id="port" name="port" type="number" min={1} max={65535} required />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="alias">Alias (opsional)</Label>
                <Input id="alias" name="alias" placeholder="game-1" />
              </div>
            </div>
            {singleState.error && <p className="text-sm text-destructive">{singleState.error}</p>}
            <div>
              <SubmitButton label="Tambah" icon={<Plus className="h-4 w-4" />} />
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bulk Import (Range Port)</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={bulkAction} className="grid gap-3">
            <NodeSelect nodes={nodes} defaultValue={defaultNodeId} />
            <div className="grid gap-1.5">
              <Label htmlFor="bulk-ip">IP Address</Label>
              <Input id="bulk-ip" name="ip" placeholder="0.0.0.0" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="portStart">Port Awal</Label>
                <Input id="portStart" name="portStart" type="number" min={1} max={65535} required />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="portEnd">Port Akhir</Label>
                <Input id="portEnd" name="portEnd" type="number" min={1} max={65535} required />
              </div>
            </div>
            {bulkState.error && <p className="text-sm text-destructive">{bulkState.error}</p>}
            <div>
              <SubmitButton label="Import Range" icon={<Upload className="h-4 w-4" />} />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
