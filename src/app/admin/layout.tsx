import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('aerotech_admin_token')?.value;

  if (token !== 'authenticated_session_active') {
    redirect('/login');
  }

  return <>{children}</>;
}