'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { serverApi } from '@/lib/server-api';
import type { FormState } from './nodes';

function clean(value: FormDataEntryValue | null): string | undefined {
  const s = String(value ?? '').trim();
  return s.length > 0 ? s : undefined;
}

function revalidateAll(): void {
  revalidatePath('/allocations');
  revalidatePath('/nodes');
  revalidatePath('/dashboard');
}

export async function createAllocation(_prev: FormState, formData: FormData): Promise<FormState> {
  const payload = {
    nodeId: clean(formData.get('nodeId')),
    ip: clean(formData.get('ip')),
    port: Number(formData.get('port')),
    alias: clean(formData.get('alias')),
  };

  try {
    await serverApi('/allocations', { method: 'POST', body: JSON.stringify(payload) });
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create allocation' };
  }
  revalidateAll();
  redirect(`/allocations?nodeId=${payload.nodeId}`);
}

export async function bulkAllocation(_prev: FormState, formData: FormData): Promise<FormState> {
  const nodeId = clean(formData.get('nodeId'));
  const ip = clean(formData.get('ip'));
  const start = Number(formData.get('portStart'));
  const end = Number(formData.get('portEnd'));

  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end > 65535 || start > end) {
    return { error: 'Port range tidak valid (1–65535, awal ≤ akhir).' };
  }
  if (end - start + 1 > 5000) {
    return { error: 'Rentang terlalu besar (maksimal 5000 port sekali jalan).' };
  }

  const ports: number[] = [];
  for (let p = start; p <= end; p++) ports.push(p);

  try {
    await serverApi('/allocations/bulk', {
      method: 'POST',
      body: JSON.stringify({ nodeId, ip, ports }),
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to bulk-create allocations' };
  }
  revalidateAll();
  redirect(`/allocations?nodeId=${nodeId}`);
}

export async function deleteAllocation(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  await serverApi(`/allocations/${id}`, { method: 'DELETE' });
  revalidateAll();
}
