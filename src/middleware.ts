import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Allow the login page itself and API routes to proceed without checks
  if (pathname.startsWith('/admin/login') || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // 2. Intercept /admin dashboard routes
  if (pathname.startsWith('/admin')) {
    const adminCookie = req.cookies.get('aerotech_admin_token');

    // If no valid session cookie, redirect to /admin/login
    if (!adminCookie || adminCookie.value !== 'authenticated_session_active') {
      const loginUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Ensure static files, images, and Next.js internal assets are never intercepted
export const config = {
  matcher: ['/admin/:path*'],
};