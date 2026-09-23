import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { DollarSign, ShoppingCart, TrendingUp, AlertTriangle, Package, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import AdminOrderRow from '@/components/AdminOrderRow';
import AddProductModal from '@/components/AddProductModal';
import AdminLogoutButton from '@/components/AdminLogoutButton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPage() {
  // 1. Strict Server-side Cookie Verification
  const cookieStore = await cookies();
  const token = cookieStore.get('aerotech_admin_token')?.value;

  if (!token || token !== 'authenticated_session_active') {
    redirect('/admin/login');
  }

  // 2. Fetch live data
  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*, products(title))')
    .order('created_at', { ascending: false });

  const { data: products } = await supabase
    .from('products')
    .select('id, title, price, stock_quantity, slug')
    .order('stock_quantity', { ascending: true });

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name', { ascending: true });

  // 3. Compute KPI Metrics
  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount || 0), 0) || 0;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const lowStockCount = products?.filter((p) => p.stock_quantity < 10).length || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">
            Admin Console
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Store Performance & Operations</h1>
        </div>
        <div className="flex items-center gap-3">
          <AddProductModal categories={categories || []} />
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl transition"
          >
            <span>Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <AdminLogoutButton />
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Revenue</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-white">${totalRevenue.toFixed(2)}</div>
          <span className="text-[11px] text-emerald-400 mt-1 block">Live settled orders</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Orders Placed</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-white">{totalOrders}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Lifetime volume</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Average Order Value</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-white">${averageOrderValue.toFixed(2)}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Per customer checkout</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Inventory Alert</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-white">{lowStockCount} Items</div>
          <span className="text-[11px] text-amber-400/80 mt-1 block">&lt; 10 units in stock</span>
        </div>
      </div>

      {/* Orders Table */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-emerald-400" />
            Recent Orders
          </h2>
          <span className="text-xs text-slate-500 font-mono">{orders?.length || 0} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">Order ID</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {orders?.map((order) => (
                <AdminOrderRow key={order.id} order={order} />
              ))}

              {(!orders || orders.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    No orders recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Inventory Status Table */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-400" />
            Inventory & Stock Health
          </h2>
          <span className="text-xs text-slate-500 font-mono">{products?.length || 0} products</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Remaining Stock</th>
                <th className="px-5 py-3">Stock Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {products?.map((prod) => {
                const isLow = prod.stock_quantity < 10;
                return (
                  <tr key={prod.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-5 py-3.5 font-medium text-white">
                      <Link href={`/products/${prod.slug}`} className="hover:text-emerald-400 transition">
                        {prod.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-slate-300 font-mono">
                      ${Number(prod.price).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-200">
                      {prod.stock_quantity} units
                    </td>
                    <td className="px-5 py-3.5">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded text-[10px] font-semibold border border-amber-500/20">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-semibold border border-emerald-500/20">
                          Optimal
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}