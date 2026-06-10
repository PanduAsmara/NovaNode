'use server';

import { revalidatePath } from 'next/cache';
import { serverApi } from '@/lib/server-api';

export interface PtState {
  error: string | null;
  message: string | null;
}

function clean(value: FormDataEntryValue | null): string {
  return String(value ?? '').trim();
}

export async function savePterodactylConfig(_prev: PtState, formData: FormData): Promise<PtState> {
  const payload = { baseUrl: clean(formData.get('baseUrl')), apiKey: clean(formData.get('apiKey')) };
  try {
    await serverApi<{ connected: boolean; baseUrl: string }>('/pterodactyl/config', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Gagal menyimpan konfigurasi', message: null };
  }
  revalidatePath('/integrations');
  return { error: null, message: 'Tersambung & konfigurasi tersimpan.' };
}

export async function syncPterodactylNodes(_prev: PtState, _formData: FormData): Promise<PtState> {
  try {
    const res = await serverApi<{ created: number; updated: number; total: number }>(
      '/pterodactyl/sync/nodes',
      { method: 'POST' },
    );
    revalidatePath('/nodes');
    revalidatePath('/dashboard');
    revalidatePath('/integrations');
    return {
      error: null,
      message: `Sync nodes selesai: ${res.created} dibuat, ${res.updated} diperbarui (total ${res.total}).`,
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Gagal sync nodes', message: null };
  }
}

export async function syncPterodactylAllocations(_prev: PtState, _formData: FormData): Promise<PtState> {
  try {
    const res = await serverApi<{ created: number; nodes: number }>(
      '/pterodactyl/sync/allocations',
      { method: 'POST' },
    );
    revalidatePath('/allocations');
    revalidatePath('/dashboard');
    revalidatePath('/integrations');
    return {
      error: null,
      message: `Sync allocations selesai: ${res.created} baru dari ${res.nodes} node.`,
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Gagal sync allocations', message: null };
  }
}
