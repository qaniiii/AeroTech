import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Exclude the login page itself to avoid redirect loops
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // 2. Protect all /admin routes
  if (pathname.startsWith('/admin')) {
    const adminToken = req.cookies.get('aerotech_admin_token')?.value;

    if (!adminToken || adminToken !== 'authenticated_session_active') {
      const loginUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};