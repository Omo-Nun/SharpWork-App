'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GoogleMap } from '../../components/GoogleMap';
import { fetchServiceCategories, searchArtisans } from '../../lib/marketplace';

const DEFAULT_LAT = 6.5244;
const DEFAULT_LNG = 3.3792;

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategories = searchParams.get('categories')?.split(',').filter(Boolean) || [];

  const [radiusKm, setRadiusKm] = useState(10);
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
  const [coords, setCoords] = useState({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchServiceCategories,
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => undefined
      );
    }
  }, []);

  useEffect(() => {
    setSelectedCategories(initialCategories);
  }, [searchParams]);

  const { data: artisans = [], isLoading, error } = useQuery({
    queryKey: ['search', coords.lat, coords.lng, radiusKm, selectedCategories.join(','), query],
    queryFn: () =>
      searchArtisans({
        ...coords,
        radiusKm,
        categories: selectedCategories.length ? selectedCategories : undefined,
        q: query || undefined,
      }),
    enabled: selectedCategories.length > 0,
  });

  function toggleCategory(slug: string) {
    setSelectedCategories((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      if (next.length) router.replace(`/search?categories=${next.join(',')}`);
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black mb-2">Artisans Near You</h1>
            <p className="text-gray-500">Verified professionals for your selected services</p>
          </div>
          <Link href="/services" className="text-brand-green font-bold hover:underline">← Change services</Link>
        </div>

        {selectedCategories.length === 0 && (
          <div className="bg-white p-8 rounded-2xl border text-center mb-8">
            <p className="text-gray-600 mb-4">Select at least one service category to see artisans.</p>
            <Link href="/services" className="text-brand-green font-bold">Browse services</Link>
          </div>
        )}

        {selectedCategories.length > 0 && (
          <>
            <div className="flex flex-wrap gap-2 mb-6">
              {categories
                .filter((c) => selectedCategories.includes(c.slug))
                .map((c) => (
                  <span key={c.id} className="px-3 py-1 bg-brand-green/10 text-brand-green rounded-full text-sm font-bold">
                    {c.icon} {c.name}
                  </span>
                ))}
            </div>

            <div className="mb-8">
              <GoogleMap lat={coords.lat} lng={coords.lng} className="h-56 w-full rounded-2xl shadow-sm" label="Your location" />
            </div>

            <div className="bg-white p-4 rounded-2xl border shadow-sm mb-8 grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Search by artisan name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-green md:col-span-2"
              />
              <select
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="px-4 py-3 rounded-xl border border-gray-200 bg-white"
              >
                {[5, 10, 20, 50].map((r) => (
                  <option key={r} value={r}>{r} km radius</option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCategory(c.slug)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
                    selectedCategories.includes(c.slug)
                      ? 'bg-brand-navy text-white border-brand-navy'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {isLoading && <p className="text-gray-500">Searching nearby artisans...</p>}
            {error && <p className="text-red-600 mb-4">Search failed. Please try again.</p>}

            {!isLoading && !error && artisans.length === 0 && (
              <div className="bg-white p-8 rounded-2xl border text-center text-gray-500">
                No verified artisans found for these services in this area. Try increasing the radius.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artisans.map((artisan) => (
                <div key={artisan.id} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-xl">{artisan.firstName} {artisan.lastName}</h3>
                      <p className="text-yellow-500 text-sm mt-1">
                        ★ {artisan.averageRating || 'New'} ({artisan.reviewCount} reviews)
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${artisan.isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {artisan.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {artisan.categories.map((cat) => (
                      <span key={cat.id} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{cat.name}</span>
                    ))}
                  </div>
                  <p className="text-gray-500 mb-4">📍 {artisan.distanceKm} km away</p>
                  <div className="flex gap-2">
                    <Link href={`/artisan/${artisan.userId}/profile`} className="flex-1 text-center py-2 rounded-full border font-bold text-sm">Profile</Link>
                    <Link
                      href={`/book/${artisan.userId}${selectedCategories.length ? `?categories=${selectedCategories.join(',')}` : ''}`}
                      className="flex-1 text-center bg-brand-black text-white py-2 rounded-full font-bold text-sm"
                    >
                      Book
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-gray-500">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
