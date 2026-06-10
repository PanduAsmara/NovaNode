import type { ApiResponse, JwtPayload } from '@novanode/shared';

export interface NovaNodeClientOptions {
  /** Base URL of the NovaNode API, e.g. http://localhost:4000/api/v1 */
  baseUrl: string;
  /** Optional bearer access token. */
  accessToken?: string;
  /** Custom fetch implementation (defaults to global fetch). */
  fetch?: typeof fetch;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Minimal typed client for the NovaNode API.
 * Endpoints are filled in per phase; this is the Phase 1 surface.
 */
export class NovaNodeClient {
  private readonly baseUrl: string;
  private accessToken?: string;
  private readonly fetchFn: typeof fetch;

  constructor(opts: NovaNodeClientOptions) {
    this.baseUrl = opts.baseUrl.replace(/\/$/, '');
    this.accessToken = opts.accessToken;
    this.fetchFn = opts.fetch ?? globalThis.fetch;
  }

  setAccessToken(token: string | undefined): void {
    this.accessToken = token;
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set('Content-Type', 'application/json');
    if (this.accessToken) headers.set('Authorization', `Bearer ${this.accessToken}`);

    const res = await this.fetchFn(`${this.baseUrl}${path}`, { ...init, headers });
    const body = (await res.json().catch(() => ({}))) as ApiResponse<T>;

    if (!res.ok || body.success === false) {
      throw new Error(body.error || body.message || `Request failed: ${res.status}`);
    }
    return body.data as T;
  }

  // --- Auth ---
  login(input: LoginInput): Promise<AuthTokens> {
    return this.request<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  profile(): Promise<JwtPayload> {
    return this.request<JwtPayload>('/auth/profile');
  }

  logout(): Promise<void> {
    return this.request<void>('/auth/logout', { method: 'POST' });
  }
}
