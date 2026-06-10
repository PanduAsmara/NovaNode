'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { NodeStatus } from '@novanode/shared';
import { serverApi } from '@/lib/server-api';

export interface FormState {
  error: string | null;
}

function clean(value: FormDataEntryValue | null): string | undefined {
  const s = String(value ?? '').trim();
  return s.length > 0 ? s : undefined;
}

function cleanInt(value: FormDataEntryValue | null): number | undefined {
  const s = clean(value);
  if (s === undefined) return undefined;
  const n = Number.parseInt(s, 10);
  return Number.isNaN(n) ? undefined : n;
}

/** SSH fields shared by create/update payloads. */
function sshFields(formData: FormData) {
  return {
    sshHost: clean(formData.get('sshHost')),
    sshPort: cleanInt(formData.get('sshPort')),
    sshUser: clean(formData.get('sshUser')),
    sshAuthType: clean(formData.get('sshAuthType')),
    sshSecret: clean(formData.get('sshSecret')),
  };
}

export async function createNode(_prev: FormState, formData: FormData): Promise<FormState> {
  const payload = {
    name: clean(formData.get('name')),
    fqdn: clean(formData.get('fqdn')),
    location: clean(formData.get('location')),
    token: clean(formData.get('token')),
    ...sshFields(formData),
  };

  try {
    await serverApi('/nodes', { method: 'POST', body: JSON.stringify(payload) });
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create node' };
  }
  revalidatePath('/nodes');
  revalidatePath('/dashboard');
  redirect('/nodes');
}

export async function updateNode(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const payload = {
    name: clean(formData.get('name')),
    fqdn: clean(formData.get('fqdn')),
    location: clean(formData.get('location')) ?? null,
    token: clean(formData.get('token')) ?? null,
    status: String(formData.get('status') ?? NodeStatus.UNKNOWN) as NodeStatus,
    ...sshFields(formData),
  };

  try {
    await serverApi(`/nodes/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update node' };
  }
  revalidatePath('/nodes');
  revalidatePath('/dashboard');
  redirect('/nodes');
}

export async function deleteNode(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  await serverApi(`/nodes/${id}`, { method: 'DELETE' });
  revalidatePath('/nodes');
  revalidatePath('/dashboard');
}
