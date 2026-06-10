import Link from 'next/link';
import { createNode } from '@/app/actions/nodes';
import { NodeForm } from '@/components/nodes/node-form';

export const dynamic = 'force-dynamic';

export default function NewNodePage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/nodes" className="text-sm text-muted-foreground hover:underline">
          ← Kembali ke Nodes
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Tambah Node</h1>
      </div>
      <NodeForm action={createNode} submitLabel="Buat Node" />
    </div>
  );
}
