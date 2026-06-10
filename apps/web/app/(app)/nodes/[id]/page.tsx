import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { updateNode } from '@/app/actions/nodes';
import { NodeForm } from '@/components/nodes/node-form';
import { ApiError, serverApi } from '@/lib/server-api';
import { canWrite, getProfile } from '@/lib/session';
import type { NodeDetail } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function EditNodePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const profile = await getProfile();
  if (!canWrite(profile.role)) redirect('/nodes');

  let node: NodeDetail;
  try {
    node = await serverApi<NodeDetail>(`/nodes/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const action = updateNode.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/nodes" className="text-sm text-muted-foreground hover:underline">
          ← Kembali ke Nodes
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Edit Node</h1>
        <p className="text-sm text-muted-foreground">{node.fqdn}</p>
      </div>
      <NodeForm action={action} node={node} submitLabel="Simpan Perubahan" />
    </div>
  );
}
