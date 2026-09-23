import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const revalidate = 0;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderSuccessPage({ params }: Props) {
  const { id } = await params;

  const { data: order, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(title, images))')
    .eq('id', id)
    .single();

  if (error || !order) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">
          Order Confirmed
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-2">Thank you for your order!</h1>
        <p className="text-slate-400 text-sm mt-2">
          Confirmation sent to <strong className="text-slate-200">{order.customer_email}</strong>
        </p>

        <div className="my-6 p-4 bg-slate-950 border border-slate-800 rounded-xl text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Order ID</span>
            <span className="font-mono text-slate-300">{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Recipient</span>
            <span className="text-slate-300">{order.customer_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Shipping To</span>
            <span className="text-slate-300">{order.shipping_address}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Payment Status</span>
            <span className="text-emerald-400 uppercase font-semibold">{order.payment_status}</span>
          </div>
          <div className="flex justify-between border-t border-slate-800 pt-2 text-sm">
            <span className="text-white font-semibold">Amount Paid</span>
            <span className="text-emerald-400 font-bold">${Number(order.total_amount).toFixed(2)}</span>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition text-sm"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}