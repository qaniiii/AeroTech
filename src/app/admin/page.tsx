import { supabase } from '@/lib/supabase';
import { DollarSign, ShoppingCart, TrendingUp, AlertTriangle, Package } from 'lucide-react';
import Link from 'next/link';
import AdminOrderRow from '@/components/AdminOrderRow';
import AddProductModal from '@/components/AddProductModal';
import EditProductModal from '@/components/EditProductModal';
import DeleteProductButton from '@/components/DeleteProductButton';
import AdminLogoutButton from '@/components/AdminLogoutButton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPage() {
  // 1. Fetch live orders
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*, order_items(*, products(title))')
    .order('created_at', { ascending: false });

  // 2. Fetch all products with wildcard to prevent missing column errors
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*');

  // 3. Fetch categories for modal dropdowns
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name', { ascending: true });

  // If Supabase encounters a query error, display it directly on the screen
  if (productsError) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-6 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-2xl font-mono text-xs space-y-3">
        <h2 className="text-base font-bold text-rose-400">Database Query Failed: products</h2>
        <pre className="bg-slate-950 p-4 rounded-xl overflow-x-auto text-[11px] text-rose-300 border border-rose-900/50">
          {JSON.stringify(productsError, null, 2)}
        </pre>
        <p className="text-slate-400">
          Tip: Check if RLS (Row Level Security) is blocking read access or if the table name differs.
        </p>
      </div>
    );
  }

  // 4. Compute KPI Metrics
  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount || 0), 0) || 0;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const lowStockCount = products?.filter((p) => Number(p.stock_quantity ?? p.stock ?? 0) < 10).length || 0;

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
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {products?.map((prod) => {
                const stock = Number(prod.stock_quantity ?? prod.stock ?? 0);
                const isLow = stock < 10;
                return (
                  <tr key={prod.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-5 py-3.5 font-medium text-white">
                      <Link href={`/products/${prod.slug || prod.id}`} className="hover:text-emerald-400 transition">
                        {prod.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-slate-300 font-mono">
                      ${Number(prod.price || 0).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-200">
                      {stock} units
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
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <EditProductModal product={prod} categories={categories || []} />
                        <DeleteProductButton productId={prod.id} productTitle={prod.title} />
                      </div>
                    </td>
                  </tr>
                );
              })}

              {(!products || products.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                    No products found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}