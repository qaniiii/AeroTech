import { supabase } from '@/lib/supabase';
import AddToCartButton from '@/components/AddToCartButton';
import CatalogControls from '@/components/CatalogControls';
import Link from 'next/link';

export const revalidate = 0;

interface Props {
  searchParams: Promise<{ category?: string; search?: string }>;
}

export default async function HomePage({ searchParams }: Props) {
  const { category, search } = await searchParams;

  // 1. Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name', { ascending: true });

  // 2. Fetch products with optional categories
  let query = supabase
    .from('products')
    .select('*, categories(name, slug)')
    .order('created_at', { ascending: false });

  // Filter by category slug if selected
  if (category) {
    const selectedCat = categories?.find((c) => c.slug === category);
    if (selectedCat) {
      query = query.eq('category_id', selectedCat.id);
    }
  }

  // Filter by search keyword
  if (search && search.trim()) {
    query = query.or(`title.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`);
  }

  const { data: products, error } = await query;

  if (error) {
    console.error('Error fetching catalog:', error);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero Banner */}
      <div className="mb-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/80 to-emerald-950/40 border border-slate-800 p-8 sm:p-12 relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <span className="text-xs uppercase tracking-widest font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Engineered For Pure Performance
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white mt-4 tracking-tight leading-tight">
            Next-Gen Tech For Modern Setups.
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed">
            Ultra-low latency wireless mice, studio-grade planar drivers, and ergonomic mechanical peripherals.
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <CatalogControls categories={categories || []} />

      {/* Catalog Grid */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const thumbnail =
              product.images?.[0] ||
              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e';

            return (
              <div
                key={product.id}
                className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5"
              >
                <div>
                  <Link href={`/products/${product.slug}`} className="block">
                    <div className="rounded-xl overflow-hidden aspect-square bg-slate-950 border border-slate-800/80 mb-4 group-hover:scale-[1.02] transition duration-300">
                      <img
                        src={thumbnail}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>

                  {product.categories?.name && (
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                      {product.categories.name}
                    </span>
                  )}

                  <Link href={`/products/${product.slug}`}>
                    <h2 className="text-base font-bold text-white mt-1 hover:text-emerald-400 transition line-clamp-1">
                      {product.title}
                    </h2>
                  </Link>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-slate-500 block leading-none">Price</span>
                    <span className="text-lg font-black text-emerald-400">
                      ${Number(product.price).toFixed(2)}
                    </span>
                  </div>

                  <div className="w-32">
                    <AddToCartButton
                      product={{
                        id: product.id,
                        title: product.title,
                        price: Number(product.price),
                        image: thumbnail,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/40 border border-slate-800/60 rounded-2xl">
          <p className="text-slate-400 text-sm">No hardware matches your current search or filter.</p>
          <Link
            href="/"
            className="inline-block mt-4 text-xs font-semibold text-emerald-400 hover:underline"
          >
            Clear all filters
          </Link>
        </div>
      )}
    </div>
  );
}