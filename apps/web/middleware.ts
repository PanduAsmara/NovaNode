import { NextResponse, type NextRequest } from 'next/server';

const ACCESS_COOKIE = 'nn_access';
const REFRESH_COOKIE = 'nn_refresh';

/** Routes that require authentication. */
const PROTECTED_PREFIXES = ['/dashboard'];

export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // A valid refresh cookie is enough to pass; serverApi will mint a new access
  // token on the first 401.
  const hasSession =
    req.cookies.has(ACCESS_COOKIE) || req.cookies.has(REFRESH_COOKIE);

  if (!hasSession) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
