import { NovaNodeClient } from '@novanode/sdk';

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

/** Browser-side singleton SDK client. */
export const api = new NovaNodeClient({ baseUrl });

/** Raw fetch helper for endpoints not yet on the SDK. */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    throw new Error(body.error || body.message || `Request failed: ${res.status}`);
  }
  return body.data as T;
}
