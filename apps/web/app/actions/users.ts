'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { UserRole } from '@novanode/shared';
import { serverApi } from '@/lib/server-api';
import type { FormState } from './nodes';

function clean(value: FormDataEntryValue | null): string | undefined {
  const s = String(value ?? '').trim();
  return s.length > 0 ? s : undefined;
}

export async function createUser(_prev: FormState, formData: FormData): Promise<FormState> {
  const payload = {
    name: clean(formData.get('name')),
    username: clean(formData.get('username')),
    email: clean(formData.get('email')),
    password: clean(formData.get('password')),
    role: String(formData.get('role') ?? UserRole.VIEWER) as UserRole,
    isActive: formData.get('isActive') === 'on',
  };

  try {
    await serverApi('/users', { method: 'POST', body: JSON.stringify(payload) });
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create user' };
  }
  revalidatePath('/users');
  redirect('/users');
}

export async function updateUser(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  // Only send the password when the admin actually typed a new one.
  const password = clean(formData.get('password'));
  const payload: Record<string, unknown> = {
    name: clean(formData.get('name')),
    username: clean(formData.get('username')),
    email: clean(formData.get('email')),
    role: String(formData.get('role') ?? UserRole.VIEWER) as UserRole,
    isActive: formData.get('isActive') === 'on',
  };
  if (password) payload.password = password;

  try {
    await serverApi(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update user' };
  }
  revalidatePath('/users');
  redirect('/users');
}

export async function deleteUser(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  await serverApi(`/users/${id}`, { method: 'DELETE' });
  revalidatePath('/users');
}
