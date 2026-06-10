'use server';

import { redirect } from 'next/navigation';
import type { AuthTokens } from '@novanode/sdk';
import { clearTokens, getAccessToken, setTokens } from '@/lib/auth';
import { API_URL, serverApi } from '@/lib/server-api';

export interface AuthFormState {
  error: string | null;
}

async function postTokens(path: string, payload: unknown): Promise<AuthTokens> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  const body = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    data?: AuthTokens;
    message?: string;
    error?: string;
  };
  if (!res.ok || body.success === false || !body.data) {
    throw new Error(body.error || body.message || `Request failed (${res.status})`);
  }
  return body.data;
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  try {
    const tokens = await postTokens('/auth/login', { email, password });
    await setTokens(tokens.accessToken, tokens.refreshToken);
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Login failed' };
  }
  redirect('/dashboard');
}

export async function setupAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = String(formData.get('name') ?? '');
  const username = String(formData.get('username') ?? '');
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  if (password !== confirm) {
    return { error: 'Password confirmation does not match' };
  }

  try {
    const tokens = await postTokens('/auth/setup', { name, username, email, password });
    await setTokens(tokens.accessToken, tokens.refreshToken);
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Setup failed' };
  }
  redirect('/dashboard');
}

export async function logoutAction(): Promise<void> {
  // Best-effort server-side revocation; ignore network/auth errors.
  try {
    if (await getAccessToken()) {
      await serverApi('/auth/logout', { method: 'POST' });
    }
  } catch {
    // ignore
  }
  await clearTokens();
  redirect('/login');
}
