'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminLogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      title="Sign Out"
      className="inline-flex items-center gap-1.5 text-xs bg-slate-900 border border-slate-800 hover:border-rose-500/40 hover:text-rose-400 text-slate-400 px-3 py-2.5 rounded-xl transition cursor-pointer"
    >
      <LogOut className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Logout</span>
    </button>
  );
}