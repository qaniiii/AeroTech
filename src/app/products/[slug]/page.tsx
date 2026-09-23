import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import AddToCartButton from '@/components/AddToCartButton';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const { data: product, error } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('slug', slug)
    .single();

  if (error || !product) {
    notFound();
  }

  const thumbnail =
    product.images?.[0] ||
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e';

  // Format tech specs key names: "battery_hours" -> "Battery Hours"
  const specsEntries = Object.entries(product.specs || {});

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-8 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Media Column */}
        <div>
          <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 aspect-square">
            <img
              src={thumbnail}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Product Info Column */}
        <div className="flex flex-col">
          {product.categories?.name && (
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400 mb-2">
              {product.categories.name}
            </span>
          )}

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {product.title}
          </h1>

          <div className="mt-4 flex items-baseline gap-4">
            <span className="text-3xl font-black text-emerald-400">
              ${Number(product.price).toFixed(2)}
            </span>
            <span className="text-sm text-slate-400">
              In Stock: <strong className="text-slate-200">{product.stock_quantity} units</strong>
            </span>
          </div>

          <p className="mt-6 text-slate-300 leading-relaxed text-sm sm:text-base border-t border-slate-800/80 pt-6">
            {product.description}
          </p>

          {/* Action Row */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex-1">
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

          {/* Value Props */}
          <div className="mt-8 grid grid-cols-2 gap-3 border-t border-slate-800/80 pt-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Official Manufacturer Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Express 24h Order Dispatch</span>
            </div>
          </div>

          {/* Dynamic Tech Specs Matrix */}
          {specsEntries.length > 0 && (
            <div className="mt-8 border border-slate-800 bg-slate-900/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                Technical Specifications
              </h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                {specsEntries.map(([key, value]) => (
                  <div key={key} className="border-b border-slate-800 pb-2">
                    <dt className="text-xs text-slate-500 capitalize">
                      {key.replace(/_/g, ' ')}
                    </dt>
                    <dd className="font-mono text-slate-200 mt-0.5">
                      {String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}