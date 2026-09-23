'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/cart-store';
import { useRouter } from 'next/navigation';
import { ShieldCheck, CreditCard, Truck, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
  });

  const total = totalPrice();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.name,
          customerEmail: formData.email,
          shippingAddress: `${formData.address}, ${formData.city} ${formData.postalCode}`,
          items,
          totalAmount: total,
        }),
      });

      const data = await res.json();

      if (data.success && data.orderId) {
        clearCart();
        router.push(`/order-success/${data.orderId}`);
      } else {
        alert(data.error || 'Failed to process order.');
      }
    } catch {
      alert('Network error while processing checkout.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-white mb-3">Your cart is empty</h1>
        <p className="text-slate-400 text-sm mb-6">Add high-performance hardware to your cart before proceeding.</p>
        <Link href="/" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl transition">
          Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold text-white mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping & Payment Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-400" />
              Shipping Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="Alex Mercer"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="alex@aerotech.dev"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Street Address</label>
              <input
                required
                type="text"
                placeholder="42 Silicon Way"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">City</label>
                <input
                  required
                  type="text"
                  placeholder="San Francisco"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Postal Code</label>
                <input
                  required
                  type="text"
                  placeholder="94105"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-3">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              Payment Method
            </h2>
            <div className="bg-slate-950 border border-emerald-500/30 p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-200">Sandbox / Simulated Mode</p>
                <p className="text-xs text-slate-400 mt-0.5">Instant test transaction for prototype</p>
              </div>
              <span className="text-xs uppercase bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded font-semibold">
                Test Ready
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing Order...
              </>
            ) : (
              `Complete Order • $${total.toFixed(2)}`
            )}
          </button>
        </form>

        {/* Order Summary Sidebar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit space-y-4">
          <h2 className="text-base font-semibold text-white">Order Summary</h2>
          <div className="divide-y divide-slate-800 max-h-80 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                <div className="flex gap-3 items-center">
                  <img src={item.image} alt={item.title} className="w-10 h-10 object-cover rounded bg-slate-950" />
                  <div>
                    <p className="text-white font-medium text-xs line-clamp-1">{item.title}</p>
                    <p className="text-slate-400 text-xs mt-0.5">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="text-emerald-400 font-semibold text-xs">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Standard Shipping</span>
              <span className="text-emerald-400 uppercase font-semibold">Free</span>
            </div>
            <div className="flex justify-between text-white text-base font-bold pt-2 border-t border-slate-800">
              <span>Total</span>
              <span className="text-emerald-400">${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>256-bit encrypted simulated transaction</span>
          </div>
        </div>
      </div>
    </div>
  );
}