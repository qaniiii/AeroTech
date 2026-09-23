'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useState, useTransition } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  categories: Category[];
}

export default function CatalogControls({ categories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';

  const [searchTerm, setSearchTerm] = useState(currentSearch);

  // Helper to push updated query parameters
  const updateQuery = (categoryVal: string, searchVal: string) => {
    const params = new URLSearchParams();

    if (categoryVal) params.set('category', categoryVal);
    if (searchVal.trim()) params.set('search', searchVal.trim());

    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `/?${qs}` : '/');
    });
  };

  const handleCategoryClick = (categorySlug: string) => {
    // Toggle off if already selected
    const nextCategory = currentCategory === categorySlug ? '' : categorySlug;
    updateQuery(nextCategory, searchTerm);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQuery(currentCategory, searchTerm);
  };

  const clearSearch = () => {
    setSearchTerm('');
    updateQuery(currentCategory, '');
  };

  return (
    <div className="space-y-4 mb-8">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          <button
            onClick={() => handleCategoryClick('')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
              !currentCategory
                ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-sm shadow-emerald-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            All Gear
          </button>

          {categories.map((cat) => {
            const isActive = currentCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.slug)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-sm shadow-emerald-500/20'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative sm:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search gear or specs..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {isPending && (
        <div className="h-0.5 w-full bg-emerald-500/20 overflow-hidden rounded-full">
          <div className="h-full bg-emerald-400 animate-pulse w-1/3" />
        </div>
      )}
    </div>
  );
}