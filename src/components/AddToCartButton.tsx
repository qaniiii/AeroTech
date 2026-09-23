'use client';

import { useCartStore } from '@/lib/cart-store';
import { ShoppingCart } from 'lucide-react';

interface Props {
  product: {
    id: string;
    title: string;
    price: number;
    image: string;
  };
}

export default function AddToCartButton({ product }: Props) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        addItem(product);
      }}
      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs px-3.5 py-2 rounded-lg transition"
    >
      <ShoppingCart className="w-3.5 h-3.5" />
      <span>Add</span>
    </button>
  );
}