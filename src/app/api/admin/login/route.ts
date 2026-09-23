import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const expectedUser = process.env.ADMIN_USER || 'admin';
    const expectedPass = process.env.ADMIN_PASSWORD || 'aerotech_secure_pass_2026!';

    if (username !== expectedUser || password !== expectedPass) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Set secure auth cookie
    const cookieStore = await cookies();
    cookieStore.set('aerotech_admin_token', 'authenticated_session_active', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}