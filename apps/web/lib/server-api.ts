import 'server-only';
import type { AuthTokens } from '@novanode/sdk';
import { getAccessToken, getRefreshToken, setTokens } from './auth';

/**
 * Base URL for server-to-server calls into the NovaNode API.
 * Runs on the Next.js server, so this never hits browser CORS.
 */
const API_URL =
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:4000/api/v1';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function rawFetch(path: string, init: RequestInit, token?: string): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(`${API_URL}${path}`, { ...init, headers, cache: 'no-store' });
}

/**
 * Attempts to refresh the access token using the stored refresh token.
 * Returns the new access token, or undefined if refresh failed.
 *
 * NOTE: persisting cookies is only allowed in Server Actions / Route Handlers.
 * When called during a Server Component render the cookie write throws, so we
 * swallow that error and still use the fresh token for the current request.
 */
async function tryRefresh(): Promise<string | undefined> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return undefined;

  const res = await rawFetch('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return undefined;

  const body = (await res.json().catch(() => ({}))) as { data?: AuthTokens };
  const tokens = body.data;
  if (!tokens?.accessToken) return undefined;

  try {
    await setTokens(tokens.accessToken, tokens.refreshToken);
  } catch {
    // Render context — cookies are read-only here. Token is still usable below.
  }
  return tokens.accessToken;
}

/**
 * Authenticated fetch into the API. Transparently refreshes the access token
 * once on a 401 and retries. Throws {@link ApiError} on failure.
 */
export async function serverApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  let token = await getAccessToken();
  let res = await rawFetch(path, init, token);

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      token = refreshed;
      res = await rawFetch(path, init, token);
    }
  }

  const body = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    data?: T;
    message?: string;
    error?: string;
  };

  if (!res.ok || body.success === false) {
    throw new ApiError(body.error || body.message || `Request failed (${res.status})`, res.status);
  }
  return body.data as T;
}

export { API_URL };
