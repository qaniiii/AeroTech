'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface Props {
  order: any;
}

export default function AdminOrderRow({ order }: Props) {
  const [status, setStatus] = useState(order.status || 'pending');
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
      } else {
        alert('Failed to update status');
      }
    } catch {
      alert('Error updating order');
    } finally {
      setUpdating(false);
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    shipped: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  return (
    <tr className="hover:bg-slate-800/30 transition">
      <td className="px-5 py-4 font-mono text-slate-400">
        {order.id.slice(0, 8)}...
      </td>
      <td className="px-5 py-4">
        <p className="font-semibold text-white">{order.customer_name || 'Anonymous'}</p>
        <p className="text-slate-500 text-[11px]">{order.customer_email}</p>
      </td>
      <td className="px-5 py-4">
        <p className="line-clamp-1 text-slate-400">
          {order.order_items?.map((item: any) => item.products?.title).filter(Boolean).join(', ') || 'Item'}
        </p>
      </td>
      <td className="px-5 py-4 font-bold text-emerald-400">
        ${Number(order.total_amount).toFixed(2)}
      </td>
      <td className="px-5 py-4">
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {order.payment_status}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <select
            value={status}
            disabled={updating}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize border bg-slate-950 focus:outline-none cursor-pointer ${
              statusColors[status] || 'text-slate-300 border-slate-700'
            }`}
          >
            <option value="pending" className="bg-slate-900 text-white">Pending</option>
            <option value="processing" className="bg-slate-900 text-white">Processing</option>
            <option value="shipped" className="bg-slate-900 text-white">Shipped</option>
            <option value="delivered" className="bg-slate-900 text-white">Delivered</option>
            <option value="cancelled" className="bg-slate-900 text-white">Cancelled</option>
          </select>
          {updating && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />}
        </div>
      </td>
    </tr>
  );
}