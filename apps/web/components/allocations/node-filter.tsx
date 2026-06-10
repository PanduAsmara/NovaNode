'use client';

import { useRouter } from 'next/navigation';
import { Select } from '@/components/ui/select';

interface NodeOption {
  id: string;
  name: string;
}

export function NodeFilter({ nodes, value }: { nodes: NodeOption[]; value?: string }) {
  const router = useRouter();
  return (
    <Select
      className="max-w-xs"
      value={value ?? ''}
      onChange={(e) => {
        const v = e.target.value;
        router.push(v ? `/allocations?nodeId=${v}` : '/allocations');
      }}
    >
      <option value="">Semua node</option>
      {nodes.map((n) => (
        <option key={n.id} value={n.id}>
          {n.name}
        </option>
      ))}
    </Select>
  );
}
