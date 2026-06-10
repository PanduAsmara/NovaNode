import 'server-only';
import { cookies } from 'next/headers';

const ACCESS_COOKIE = 'nn_access';
const REFRESH_COOKIE = 'nn_refresh';

const baseCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  secure: process.env.NODE_ENV === 'production',
};

/** Persist the auth tokens as httpOnly cookies. */
export async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  const store = await cookies();
  // Access token mirrors its ~15m lifetime; refresh token ~7d.
  store.set(ACCESS_COOKIE, accessToken, { ...baseCookieOptions, maxAge: 15 * 60 });
  store.set(REFRESH_COOKIE, refreshToken, { ...baseCookieOptions, maxAge: 7 * 24 * 60 * 60 });
}

/** Remove both auth cookies. */
export async function clearTokens(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export async function getAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(ACCESS_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  return (await cookies()).get(REFRESH_COOKIE)?.value;
}

export { ACCESS_COOKIE, REFRESH_COOKIE };
