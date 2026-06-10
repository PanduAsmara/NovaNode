import Link from 'next/link';
import { deleteAllocation } from '@/app/actions/allocations';
import { AllocationForms } from '@/components/allocations/allocation-forms';
import { NodeFilter } from '@/components/allocations/node-filter';
import { DeleteButton } from '@/components/delete-button';
import { buttonVariants } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { serverApi } from '@/lib/server-api';
import { canWrite, getProfile } from '@/lib/session';
import type { Allocation, NodeRow } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AllocationsPage({
  searchParams,
}: {
  searchParams: Promise<{ nodeId?: string }>;
}) {
  const { nodeId } = await searchParams;
  const allocPath = nodeId ? `/allocations?nodeId=${nodeId}` : '/allocations';

  const [nodes, allocations, profile] = await Promise.all([
    serverApi<NodeRow[]>('/nodes'),
    serverApi<Allocation[]>(allocPath),
    getProfile(),
  ]);
  const writable = canWrite(profile.role);
  const nodeName = new Map(nodes.map((n) => [n.id, n.name]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Allocations</h1>
          <p className="text-sm text-muted-foreground">Kelola alokasi IP & port per node.</p>
        </div>
        <NodeFilter nodes={nodes} value={nodeId} />
      </div>

      {writable &&
        (nodes.length === 0 ? (
          <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            Buat <Link href="/nodes/new" className="text-primary underline-offset-4 hover:underline">node</Link>{' '}
            terlebih dahulu sebelum menambah allocation.
          </p>
        ) : (
          <AllocationForms nodes={nodes} defaultNodeId={nodeId} />
        ))}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Node</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>Port</TableHead>
              <TableHead>Alias</TableHead>
              {writable && <TableHead className="text-right">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {allocations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={writable ? 5 : 4} className="py-10 text-center text-muted-foreground">
                  Belum ada allocation.
                </TableCell>
              </TableRow>
            ) : (
              allocations.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{nodeName.get(a.nodeId) ?? a.nodeId}</TableCell>
                  <TableCell className="text-muted-foreground">{a.ip}</TableCell>
                  <TableCell>{a.port}</TableCell>
                  <TableCell className="text-muted-foreground">{a.alias ?? '—'}</TableCell>
                  {writable && (
                    <TableCell>
                      <div className="flex justify-end">
                        <DeleteButton
                          action={deleteAllocation}
                          id={a.id}
                          confirmMessage={`Hapus allocation ${a.ip}:${a.port}?`}
                        />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
