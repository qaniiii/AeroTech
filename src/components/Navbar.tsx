'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cpu, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/login');
  const { items, openCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItemCount = items.reduce((acc, item) => acc + (item.quantity || 1), 0);

  // Admin Header: Clean and focused
  if (isAdminRoute) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-white font-black tracking-wider hover:opacity-90 transition">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <span>AEROTECH <span className="text-xs uppercase text-emerald-400 font-mono tracking-widest ml-1">Admin</span></span>
        </Link>
        <div className="text-xs font-mono text-slate-500 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Console Active
        </div>
      </header>
    );
  }

  // Storefront Header: Cart button opens CartDrawer sidebar
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 text-white font-black tracking-wider">
        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Cpu className="w-5 h-5" />
        </div>
        <span>AEROTECH</span>
      </Link>

      <div className="flex items-center gap-4">
        <Link
          href="/admin"
          className="text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-900 transition"
        >
          Admin
        </Link>

        <button
          onClick={openCart}
          className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl transition"
          aria-label="Open Cart"
        >
          <ShoppingBag className="w-5 h-5" />
          {mounted && totalItemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow">
              {totalItemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}