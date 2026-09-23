'use client';

import Link from 'next/link';
import { useCartStore } from '@/lib/cart-store';
import { ShoppingCart, Cpu } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { toggleCart, totalCount } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const count = mounted ? totalCount() : 0;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-wider text-emerald-400 hover:opacity-90">
          <Cpu className="w-6 h-6 text-emerald-400" />
          <span>AEROTECH</span>
        </Link>

        {/* Navigation Links & Cart Trigger */}
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm text-slate-300 hover:text-emerald-400 transition">
            Store
          </Link>

          {/* Admin Link Added Here */}
          <Link href="/admin" className="text-sm text-slate-300 hover:text-emerald-400 transition">
            Admin
          </Link>
          
          <button
            onClick={toggleCart}
            className="relative p-2 text-slate-300 hover:text-emerald-400 rounded-lg transition"
            aria-label="Open Cart"
          >
            <ShoppingCart className="w-6 h-6" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 text-xs font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}