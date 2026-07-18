'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
<<<<<<< HEAD
import { GoogleMap } from '../../components/GoogleMap';
import { fetchServiceCategories, searchArtisans } from '../../lib/marketplace';
=======
import { OpenStreetMap } from '../../components/OpenStreetMap';
import { fetchServiceCategories, searchArtisans, type SearchArtisan } from '../../lib/marketplace';
>>>>>>> 692263da91a95f3adee72c4f0ae332c9e935c06d

const DEFAULT_LAT = 6.5244;
const DEFAULT_LNG = 3.3792;

/* ── Skeleton card ─────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-14 h-14 rounded-full bg-gray-200" />
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-3/5 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-2/5" />
        </div>
        <div className="w-16 h-6 bg-gray-200 rounded-full" />
      </div>
      <div className="flex gap-2 mb-4">
        <div className="h-6 bg-gray-100 rounded-full w-20" />
        <div className="h-6 bg-gray-100 rounded-full w-24" />
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-10 bg-gray-200 rounded-xl" />
        <div className="flex-1 h-10 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

/* ── Artisan card ──────────────────────────────────────────────── */
function ArtisanCard({ artisan, selectedCategories }: { artisan: SearchArtisan; selectedCategories: string[] }) {
  const displayName = `${artisan.firstName} ${artisan.lastName}`;
  const starsFull = Math.floor(artisan.averageRating || 0);

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-xl hover:border-brand-green/20 hover:-translate-y-1 transition-all duration-300">
      {/* Header row */}
      <div className="flex items-start gap-3 mb-4">
        <div className="relative flex-shrink-0">
          <Image
            className="h-14 w-14 rounded-full object-cover border-2 border-white shadow-md"
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D2B5E&color=fff&size=112`}
            alt={displayName}
            width={56}
            height={56}
            unoptimized
          />
          {artisan.isOnline && (
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-brand-navy truncate flex items-center gap-1.5">
            {displayName}
            {artisan.isVerified && (
              <svg className="w-4.5 h-4.5 text-brand-green flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            )}
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-yellow-500">
              {'★'.repeat(starsFull)}{'☆'.repeat(5 - starsFull)}
            </span>
            <span className="text-gray-400">
              {artisan.averageRating ? artisan.averageRating.toFixed(1) : 'New'} ({artisan.reviewCount})
            </span>
          </div>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
          artisan.isOnline
            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
            : 'bg-gray-50 text-gray-500 ring-1 ring-gray-200'
        }`}>
          {artisan.isOnline ? '● Online' : 'Offline'}
        </span>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {artisan.categories.slice(0, 3).map((cat) => (
          <span key={cat.id} className="text-xs bg-brand-navy/5 text-brand-navy px-2.5 py-1 rounded-full font-medium">
            {cat.icon ? `${cat.icon} ` : ''}{cat.name}
          </span>
        ))}
        {artisan.categories.length > 3 && (
          <span className="text-xs text-gray-400 px-2 py-1">+{artisan.categories.length - 3} more</span>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 border-t border-gray-50 pt-3">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
          {artisan.distanceKm} km away
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
          {artisan.completedJobsCount} jobs
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Link
          href={`/artisan/${artisan.userId}/profile`}
          className="flex-1 text-center py-2.5 rounded-xl border border-gray-200 font-bold text-sm text-brand-navy hover:bg-gray-50 transition-colors"
        >
          View Profile
        </Link>
        <Link
          href={`/artisan/${artisan.userId}/profile`}
          className="flex-1 text-center bg-brand-green text-white py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors shadow-sm hover:shadow-md"
        >
          Request Service
        </Link>
      </div>
    </div>
  );
}

/* ── Main search content ───────────────────────────────────────── */
function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategoriesKey = searchParams.get('categories') ?? '';
  const initialCategories = initialCategoriesKey.split(',').filter(Boolean);
  const initialQuery = searchParams.get('q') ?? '';

  const [radiusKm, setRadiusKm] = useState(10);
  const [query, setQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'jobs_completed'>('distance');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
  const [coords, setCoords] = useState({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'pending' | 'granted' | 'denied'>('pending');

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchServiceCategories,
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocationStatus('granted'); },
        () => setLocationStatus('denied')
      );
    }
  }, []);

  useEffect(() => {
    setSelectedCategories(initialCategoriesKey.split(',').filter(Boolean));
  }, [initialCategoriesKey]);

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
  }, [searchParams]);

  const { data: artisans = [], isLoading, error } = useQuery({
    queryKey: ['search', coords.lat, coords.lng, radiusKm, selectedCategories.join(','), query, sortBy],
    queryFn: () =>
      searchArtisans({
        ...coords,
        radiusKm,
        categories: selectedCategories.length ? selectedCategories : undefined,
        q: query || undefined,
        sortBy,
      }),
    enabled: selectedCategories.length > 0 || query.length > 0,
  });

  const toggleCategory = useCallback((slug: string) => {
    setSelectedCategories(prev => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      if (next.length) {
        router.replace(`/search?categories=${next.join(',')}`);
      } else {
        router.replace('/search');
      }
      return next;
    });
  }, [router]);

  const selectedCategoryObjects = useMemo(
    () => categories.filter((c) => selectedCategories.includes(c.slug)),
    [categories, selectedCategories]
  );

  /* ── Sidebar filters (shared between mobile & desktop) ──── */
  function FiltersPanel() {
    return (
      <div className="space-y-6">
        {/* Location */}
        <div>
          <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider mb-3">Location</h3>
          <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <OpenStreetMap lat={coords.lat} lng={coords.lng} className="h-36 w-full" label="Your location" />
          </div>
          {locationStatus === 'denied' && (
            <p className="text-xs text-amber-600 mt-2">📍 Location access denied. Showing Lagos default.</p>
          )}
        </div>

        {/* Radius */}
        <div>
          <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider mb-3">Search Radius</h3>
          <div className="grid grid-cols-2 gap-2">
            {[5, 10, 20, 50].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRadiusKm(r)}
                className={`py-2 rounded-xl text-sm font-bold transition-all ${
                  radiusKm === r
                    ? 'bg-brand-green text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div>
          <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider mb-3">Sort By</h3>
          <div className="space-y-2">
            {([
              { value: 'distance' as const, label: 'Nearest First', icon: '📍' },
              { value: 'rating' as const, label: 'Highest Rated', icon: '⭐' },
              { value: 'jobs_completed' as const, label: 'Most Experienced', icon: '🔨' },
            ]).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSortBy(opt.value)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  sortBy === opt.value
                    ? 'bg-brand-navy/5 text-brand-navy ring-1 ring-brand-navy/10'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{opt.icon}</span> {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider mb-3">Categories</h3>
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCategory(c.slug)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${
                  selectedCategories.includes(c.slug)
                    ? 'bg-brand-green/10 text-brand-green'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{c.icon ? `${c.icon} ` : ''}{c.name}</span>
                {selectedCategories.includes(c.slug) && (
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* ── Sticky header ──────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
          <Link href="/" className="text-xl font-black text-brand-navy flex items-center gap-1.5 flex-shrink-0">
            <span className="bg-brand-green text-white w-7 h-7 rounded-lg flex items-center justify-center text-sm shadow shadow-brand-green/30">S</span>
            Sharp<span className="text-brand-green">Work</span>
          </Link>

          {/* Search bar */}
          <div className="flex-1 max-w-xl relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            <input
              type="text"
              placeholder="Search artisans by name or skill..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100/80 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:bg-white transition-all"
            />
          </div>

          {/* Mobile filter toggle */}
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 text-sm font-bold text-gray-700"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
            Filters
          </button>

          <div className="hidden sm:flex items-center gap-3">
            <Link href="/services" className="text-sm font-medium text-gray-500 hover:text-brand-green transition-colors">
              Browse Services
            </Link>
            <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-brand-green transition-colors">Log In</Link>
            <Link href="/auth/register" className="bg-brand-navy text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors shadow-sm">Sign Up</Link>
          </div>
        </div>
      </header>

      {/* ── Mobile filters overlay ─────────────────────────── */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-brand-navy">Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="text-gray-400 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <FiltersPanel />
          </div>
        </div>
      )}

      {/* ── Main layout ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {selectedCategories.length === 0 && query.length === 0 ? (
          /* Empty state: no categories or query */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-brand-green/10 rounded-3xl flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-brand-green" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            </div>
<<<<<<< HEAD

            <div className="mb-8">
              <GoogleMap lat={coords.lat} lng={coords.lng} className="h-56 w-full rounded-2xl shadow-sm" label="Your location" />
            </div>

            <div className="bg-white p-4 rounded-2xl border shadow-sm mb-8 grid grid-cols-1 md:grid-cols-4 gap-3">
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
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'distance' | 'rating' | 'jobs_completed')}
                className="px-4 py-3 rounded-xl border border-gray-200 bg-white"
              >
                <option value="distance">Nearest</option>
                <option value="rating">Highest Rated</option>
                <option value="jobs_completed">Most Jobs Done</option>
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

            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm animate-pulse h-48 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="w-1/2 h-6 bg-gray-200 rounded mb-2" />
                      <div className="w-16 h-5 bg-gray-200 rounded-full" />
                    </div>
                    <div className="w-1/3 h-4 bg-gray-200 rounded mb-4" />
                    <div className="flex gap-2">
                      <div className="flex-1 h-10 bg-gray-200 rounded-full" />
                      <div className="flex-1 h-10 bg-gray-200 rounded-full" />
                    </div>
                  </div>
                ))}
=======
            <h2 className="text-2xl font-bold text-brand-navy mb-3">What service are you looking for?</h2>
            <p className="text-gray-500 mb-8 max-w-md">Select a service category to discover verified, professional artisans near you.</p>
            <Link href="/services" className="bg-brand-green text-white px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-emerald-600 transition-all shadow-lg hover:shadow-brand-green/30 hover:-translate-y-0.5">
              Browse All Services →
            </Link>
          </div>
        ) : (
          <div className="flex gap-8">
            {/* ── Desktop sidebar ──────────────────────── */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <FiltersPanel />
>>>>>>> 692263da91a95f3adee72c4f0ae332c9e935c06d
              </div>
            </aside>

            {/* ── Results ──────────────────────────────── */}
            <main className="flex-1 min-w-0">
              {/* Active filters summary */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-black text-brand-navy">
                    {isLoading ? 'Searching...' : `${artisans.length} Artisan${artisans.length !== 1 ? 's' : ''} Found`}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {selectedCategoryObjects.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCategory(c.slug)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-green/10 text-brand-green rounded-full text-xs font-bold hover:bg-brand-green/20 transition-colors group"
                      >
                        {c.icon} {c.name}
                        <svg className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    ))}
                    <span className="text-xs text-gray-400">within {radiusKm} km</span>
                  </div>
                </div>
                <Link href="/services" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-brand-green hover:underline">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                  Change services
                </Link>
              </div>

              {/* Loading */}
              {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-50 p-10 rounded-2xl border border-red-100 text-center">
                  <div className="text-4xl mb-4">⚠️</div>
                  <h3 className="font-bold text-lg text-red-800 mb-2">Search Failed</h3>
                  <p className="text-red-600 text-sm">We couldn&apos;t retrieve artisans at this moment. Please check your connection and try again.</p>
                </div>
              )}

              {/* No results */}
              {!isLoading && !error && artisans.length === 0 && (
                <div className="bg-white p-16 rounded-2xl border border-gray-100 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                  </div>
                  <h3 className="font-bold text-xl text-brand-navy mb-2">No artisans found</h3>
                  <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">We couldn&apos;t find any verified professionals for these services in this area. Try increasing the search radius or changing your selected services.</p>
                  <button type="button" onClick={() => setRadiusKm(50)} className="text-brand-green font-bold text-sm hover:underline">Expand to 50 km radius →</button>
                </div>
              )}

              {/* Results grid */}
              {!isLoading && !error && artisans.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {artisans.map((artisan) => (
                    <ArtisanCard key={artisan.id} artisan={artisan} selectedCategories={selectedCategories} />
                  ))}
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <SearchContent />
    </Suspense>
  );
}
