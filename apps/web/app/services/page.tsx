'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchServiceCategories, type ServiceCategory } from '../../lib/marketplace';

function ServicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedKey = searchParams.get('categories') ?? '';
  const preselected = preselectedKey.split(',').filter(Boolean);

  const [selected, setSelected] = useState<string[]>(preselected);

  useEffect(() => {
    if (preselected.length) setSelected(preselected);
  }, [preselectedKey, preselected]);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchServiceCategories,
  });

  function toggleSlug(slug: string) {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  function findArtisans() {
    if (selected.length === 0) return;
    router.push(`/search?categories=${selected.join(',')}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black text-brand-green">SharpWork</Link>
        <div className="flex gap-4">
          <Link href="/auth/login" className="font-medium hover:text-brand-green">Log In</Link>
          <Link href="/auth/register" className="bg-brand-black text-white px-4 py-2 rounded-full font-medium">Sign Up</Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6 md:p-12">
        <h1 className="text-4xl font-black text-brand-navy mb-2">Browse Services</h1>
        <p className="text-gray-600 mb-8">
          Select one or more service categories, then find verified artisans near you. No account needed to browse.
        </p>

        {isLoading && <p className="text-gray-500">Loading services...</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {categories.map((cat: ServiceCategory) => {
            const active = selected.includes(cat.slug);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleSlug(cat.slug)}
                className={`text-left p-6 rounded-2xl border-2 transition-all ${
                  active
                    ? 'border-brand-green bg-brand-green/5 shadow-md'
                    : 'border-gray-100 bg-white hover:border-brand-green/40'
                }`}
              >
                <span className="text-3xl mb-3 block">{cat.icon || '🔧'}</span>
                <h3 className="font-bold text-lg text-brand-navy">{cat.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{cat.description}</p>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <button
            type="button"
            disabled={selected.length === 0}
            onClick={findArtisans}
            className="w-full sm:w-auto bg-brand-green text-white px-8 py-4 rounded-full font-bold disabled:opacity-40"
          >
            Find artisans ({selected.length} selected)
          </button>
          {selected.length > 0 && (
            <button type="button" onClick={() => setSelected([])} className="text-gray-500 font-medium">
              Clear selection
            </button>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Share this page: <code className="bg-gray-100 px-2 py-1 rounded">{`/services?categories=${selected.join(',') || 'plumbing'}`}</code>
        </p>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-gray-500">Loading services...</div>}>
      <ServicesContent />
    </Suspense>
  );
}
