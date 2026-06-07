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

  const { data: categories = [], isLoading, error } = useQuery({
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
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex items-center justify-between transition-all shadow-sm">
        <Link href="/" className="text-2xl font-black text-brand-navy flex items-center gap-2">
          <span className="bg-brand-green text-white w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-brand-green/30">S</span>
          Sharp<span className="text-brand-green">Work</span>
        </Link>
        <div className="flex gap-4 items-center">
          <Link href="/auth/login" className="font-medium text-gray-600 hover:text-brand-green transition-colors hidden sm:block">Log In</Link>
          <Link href="/auth/register" className="bg-brand-navy text-white px-5 py-2 rounded-full font-bold hover:bg-gray-800 transition-transform transform hover:-translate-y-0.5 shadow-md">Sign Up</Link>
        </div>
      </header>

      {/* Decorative header background */}
      <div className="bg-brand-navy text-white pt-20 pb-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4">What do you need <span className="text-brand-green">help with?</span></h1>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto">
            Select one or more service categories below to find verified, professional artisans ready to work in your area.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 md:p-8 -mt-10 relative z-20">
        <div className="bg-white rounded-[2rem] shadow-xl p-8 md:p-12 border border-gray-100">
          
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-6 h-48 animate-pulse border border-gray-100 flex flex-col justify-between">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div>
                    <div className="w-3/4 h-5 bg-gray-200 rounded mb-2" />
                    <div className="w-1/2 h-4 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-brand-navy mb-2">Oops! Couldn't load services.</h3>
              <p className="text-gray-500 mb-6">Please check your connection and try again.</p>
              <button onClick={() => window.location.reload()} className="px-6 py-2 bg-brand-green text-white rounded-full font-bold hover:bg-emerald-500 transition-colors">
                Retry
              </button>
            </div>
          )}

          {!isLoading && !error && categories.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4 opacity-50">🛠️</div>
              <h3 className="text-xl font-bold text-brand-navy mb-2">No categories available yet</h3>
              <p className="text-gray-500">Check back later for updates.</p>
            </div>
          )}

          {!isLoading && !error && categories.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                {categories.map((cat: ServiceCategory) => {
                  const active = selected.includes(cat.slug);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleSlug(cat.slug)}
                      className={`text-left p-6 rounded-2xl border-2 transition-all duration-300 transform hover:-translate-y-1 ${
                        active
                          ? 'border-brand-green bg-brand-green/5 shadow-lg shadow-brand-green/10'
                          : 'border-gray-100 bg-white hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className={`text-4xl p-3 rounded-2xl ${active ? 'bg-white shadow-sm' : 'bg-gray-50'}`}>{cat.icon || '🔧'}</span>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${active ? 'bg-brand-green border-brand-green text-white' : 'border-gray-200'}`}>
                          {active && <span className="text-xs font-bold">✓</span>}
                        </div>
                      </div>
                      <h3 className="font-bold text-xl text-brand-navy mb-1">{cat.name}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{cat.description}</p>
                    </button>
                  );
                })}
              </div>

              {selected.length > 0 && (
                <div className="bg-brand-navy/5 p-6 rounded-2xl border border-brand-navy/10 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-6 z-30 backdrop-blur-md">
                  <div>
                    <h4 className="font-bold text-brand-navy text-lg">{selected.length} service{selected.length !== 1 ? 's' : ''} selected</h4>
                    <p className="text-sm text-gray-500 hidden sm:block">Ready to find the best artisans for the job.</p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button type="button" onClick={() => setSelected([])} className="text-gray-500 font-medium hover:text-gray-900 transition-colors px-4 py-3">
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={findArtisans}
                      className="w-full sm:w-auto bg-brand-green text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-500 transition-all shadow-lg hover:shadow-brand-green/30 transform hover:-translate-y-0.5"
                    >
                      Find Artisans →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 pt-32 text-center text-brand-green font-bold text-xl animate-pulse">
        Loading SharpWork...
      </div>
    }>
      <ServicesContent />
    </Suspense>
  );
}
