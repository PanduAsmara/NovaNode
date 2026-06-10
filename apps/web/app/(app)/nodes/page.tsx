import { Pencil, Plus } from 'lucide-react';
import Link from 'next/link';
import { NodeStatus } from '@novanode/shared';
import { deleteNode } from '@/app/actions/nodes';
import { DeleteButton } from '@/components/delete-button';
import { Badge } from '@/components/ui/badge';
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
import type { NodeRow } from '@/lib/types';

export const dynamic = 'force-dynamic';

function statusVariant(status: NodeStatus): 'success' | 'destructive' | 'muted' {
  if (status === NodeStatus.ONLINE) return 'success';
  if (status === NodeStatus.OFFLINE) return 'destructive';
  return 'muted';
}

export default async function NodesPage() {
  const [nodes, profile] = await Promise.all([serverApi<NodeRow[]>('/nodes'), getProfile()]);
  const writable = canWrite(profile.role);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Nodes</h1>
          <p className="text-sm text-muted-foreground">Kelola node infrastruktur.</p>
        </div>
        {writable && (
          <Link href="/nodes/new" className={buttonVariants({ variant: 'gradient' })}>
            <Plus className="h-4 w-4" />
            Tambah Node
          </Link>
        )}
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>FQDN</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Allocations</TableHead>
              {writable && <TableHead className="text-right">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {nodes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={writable ? 6 : 5} className="py-10 text-center text-muted-foreground">
                  Belum ada node.
                </TableCell>
              </TableRow>
            ) : (
              nodes.map((node) => (
                <TableRow key={node.id}>
                  <TableCell className="font-medium">{node.name}</TableCell>
                  <TableCell className="text-muted-foreground">{node.fqdn}</TableCell>
                  <TableCell className="text-muted-foreground">{node.location ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(node.status)}>{node.status}</Badge>
                  </TableCell>
                  <TableCell>{node._count.allocations}</TableCell>
                  {writable && (
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/nodes/${node.id}`}
                          className={buttonVariants({ variant: 'outline', size: 'sm' })}
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Link>
                        <DeleteButton
                          action={deleteNode}
                          id={node.id}
                          confirmMessage={`Hapus node "${node.name}"? Semua allocation-nya ikut terhapus.`}
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
