import { NextRequest, NextResponse } from 'next/server';
import { getSafeReturnPath, parseCookieExpiryMs } from './lib/auth';

const isProtectedPath = (pathname: string) => pathname.startsWith('/admin');

const isLoginPath = (pathname: string) => pathname === '/login';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('adminToken')?.value;
  const expiryCookie = request.cookies.get('adminTokenExpiry')?.value;
  const expiryMs = parseCookieExpiryMs(expiryCookie, token);
  const isValid = Boolean(token && expiryMs && expiryMs > Date.now());

  if (isLoginPath(request.nextUrl.pathname)) {
    if (isValid) {
      const nextPath = getSafeReturnPath(
        request.nextUrl.searchParams.get('next'),
      );

      return NextResponse.redirect(new URL(nextPath, request.url));
    }

    return NextResponse.next();
  }

  if (isProtectedPath(request.nextUrl.pathname) && !isValid) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set(
      'next',
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
