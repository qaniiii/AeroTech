'use client';

import { useCartStore } from '@/lib/cart-store';
import { X, Trash2, Plus, Minus, ShoppingBag, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [validating, setValidating] = useState(false);
  const router = useRouter();

  // Avoid hydration mismatch when reading localStorage
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  const handleProceedToCheckout = async () => {
    setValidating(true);

    try {
      // Pre-flight validation against current stock levels
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customer_name: 'Pre-flight Validation',
          customer_email: 'validation@aerotech.local',
          total_amount: totalPrice(),
          validate_only: true, // Marker for stock checks without finalizing orders
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'One or more items exceed available stock.');
        setValidating(false);
        return;
      }

      closeCart();
      router.push('/checkout');
    } catch {
      // Direct navigation fallback on network blip
      closeCart();
      router.push('/checkout');
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 h-full flex flex-col z-10 shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-semibold">Your Cart ({items.length})</h2>
          </div>
          <button 
            onClick={closeCart}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3">
              <ShoppingBag className="w-12 h-12 stroke-1" />
              <p>Your cart is empty.</p>
            </div>
          ) : (
            items.map((item) => (
              <div 
                key={item.id} 
                className="flex gap-4 p-3 bg-slate-950 border border-slate-800 rounded-xl items-center"
              >
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-16 h-16 object-cover rounded-lg bg-slate-800"
                />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-white line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-emerald-400 font-semibold mt-1">${item.price}</p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs px-2">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => removeItem(item.id)}
                  className="text-slate-500 hover:text-red-400 p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-800 space-y-4 bg-slate-950/40">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Total</span>
              <span className="text-xl font-bold text-emerald-400">
                ${totalPrice().toFixed(2)}
              </span>
            </div>
            <button 
              onClick={handleProceedToCheckout}
              disabled={validating}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              {validating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying Stock...
                </>
              ) : (
                'Proceed to Checkout'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}