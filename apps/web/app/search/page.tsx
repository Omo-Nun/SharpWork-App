'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { OpenStreetMap } from '../../components/OpenStreetMap';
import { Logo } from '../../components/Logo';
import { fetchServiceCategories, searchArtisans, type SearchArtisan } from '../../lib/marketplace';

const DEFAULT_LAT = 6.5244;
const DEFAULT_LNG = 3.3792;

/* ── Skeleton card ─────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 overflow-hidden relative">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_linear_infinite] bg-gradient-to-r from-transparent via-gray-100/80 to-transparent" />
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-2xl bg-gray-100" />
        <div className="flex-1">
          <div className="h-5 bg-gray-100 rounded-lg w-3/5 mb-2.5" />
          <div className="h-3.5 bg-gray-100 rounded-lg w-2/5" />
        </div>
        <div className="w-16 h-6 bg-gray-100 rounded-full" />
      </div>
      <div className="flex gap-2 mb-5">
        <div className="h-6 bg-gray-100 rounded-full w-20" />
        <div className="h-6 bg-gray-100 rounded-full w-24" />
      </div>
      <div className="h-px bg-gray-100 mb-4" />
      <div className="flex gap-3">
        <div className="flex-1 h-10 bg-gray-100 rounded-xl" />
        <div className="flex-1 h-10 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

/* ── Artisan card ──────────────────────────────────────────────── */
function ArtisanCard({ artisan, selectedCategories, index }: { artisan: SearchArtisan; selectedCategories: string[]; index: number }) {
  const displayName = `${artisan.firstName} ${artisan.lastName}`;
  const starsFull = Math.floor(artisan.averageRating || 0);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group bg-white rounded-3xl border border-gray-100 p-6 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] hover:border-[#1ECE25]/20 transition-all duration-500 animate-fade-in-up relative overflow-hidden cursor-pointer"
      style={{ animationDelay: `${index * 80}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Hover glow accent */}
      <div className={`absolute inset-0 bg-gradient-to-br from-[#1ECE25]/5 to-transparent transition-opacity duration-500 ${hovered ? 'opacity-100' : 'opacity-0'} pointer-events-none`} />
      
      {/* Header row */}
      <div className="flex items-start gap-4 mb-4 relative">
        <div className="relative flex-shrink-0">
          <Image
            className="h-14 w-14 rounded-2xl object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-300"
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D2B5E&color=fff&size=112`}
            alt={displayName}
            width={56}
            height={56}
            unoptimized
          />
          {artisan.isOnline && (
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#1ECE25] border-2 border-white rounded-full shadow-[0_0_8px_rgba(30,206,37,0.6)]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-base text-brand-navy truncate flex items-center gap-1.5 tracking-tight">
            {displayName}
            {artisan.isVerified && (
              <svg className="w-4 h-4 text-[#1ECE25] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            )}
          </h3>
          <div className="flex items-center gap-2 text-sm mt-0.5">
            <span className="text-yellow-400 tracking-tighter">
              {'★'.repeat(starsFull)}{'☆'.repeat(5 - starsFull)}
            </span>
            <span className="text-gray-500 font-medium text-xs">
              {artisan.averageRating ? artisan.averageRating.toFixed(1) : 'New'} <span className="text-gray-300">·</span> {artisan.reviewCount} reviews
            </span>
          </div>
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${
          artisan.isOnline
            ? 'bg-[#1ECE25]/10 text-emerald-700'
            : 'bg-gray-100 text-gray-400'
        }`}>
          {artisan.isOnline ? '● Online' : 'Offline'}
        </span>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {artisan.categories.slice(0, 3).map((cat) => (
          <span key={cat.id} className="text-xs bg-brand-navy/5 text-brand-navy px-3 py-1 rounded-full font-semibold">
            {cat.icon ? `${cat.icon} ` : ''}{cat.name}
          </span>
        ))}
        {artisan.categories.length > 3 && (
          <span className="text-xs text-gray-400 px-2 py-1 font-medium">+{artisan.categories.length - 3} more</span>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs text-gray-400 font-medium mb-5 pt-4 border-t border-gray-50">
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-[#1ECE25]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
          {artisan.distanceKm} km away
        </span>
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-brand-navy/40" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
          {artisan.completedJobsCount} jobs done
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2.5">
        <Link
          href={`/artisan/${artisan.userId}/profile`}
          className="flex-1 text-center py-2.5 rounded-2xl border border-gray-200 font-bold text-sm text-brand-navy hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
        >
          View Profile
        </Link>
        <Link
          href={`/artisan/${artisan.userId}/profile`}
          className="flex-1 text-center bg-[#1ECE25] text-white py-2.5 rounded-2xl font-bold text-sm hover:bg-[#1bb822] transition-all duration-200 shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5"
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
    const prev = selectedCategories;
    const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
    setSelectedCategories(next);
    if (next.length) {
      router.replace(`/search?categories=${next.join(',')}`);
    } else {
      router.replace('/search');
    }
  }, [router, selectedCategories]);

  const selectedCategoryObjects = useMemo(
    () => categories.filter((c) => selectedCategories.includes(c.slug)),
    [categories, selectedCategories]
  );

  /* ── Sidebar filters ────────────────────────────────────────── */
  function FiltersPanel() {
    return (
      <div className="space-y-6">
        {/* Location */}
        <div>
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Your Location</h3>
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <OpenStreetMap lat={coords.lat} lng={coords.lng} className="h-36 w-full" label="Your location" />
          </div>
          {locationStatus === 'denied' && (
            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
              <span>📍</span> Location denied. Showing Lagos.
            </p>
          )}
        </div>

        {/* Radius */}
        <div>
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Search Radius</h3>
          <div className="grid grid-cols-2 gap-2">
            {[5, 10, 20, 50].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRadiusKm(r)}
                className={`py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  radiusKm === r
                    ? 'bg-[#1ECE25] text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div>
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Sort By</h3>
          <div className="space-y-1.5">
            {([
              { value: 'distance' as const, label: 'Nearest First', icon: '📍' },
              { value: 'rating' as const, label: 'Highest Rated', icon: '⭐' },
              { value: 'jobs_completed' as const, label: 'Most Experienced', icon: '🔨' },
            ]).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSortBy(opt.value)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2.5 ${
                  sortBy === opt.value
                    ? 'bg-brand-navy text-white'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <span>{opt.icon}</span> {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Categories</h3>
          <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCategory(c.slug)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-between group ${
                  selectedCategories.includes(c.slug)
                    ? 'bg-[#1ECE25]/10 text-[#1ECE25]'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span>{c.icon ? `${c.icon} ` : ''}{c.name}</span>
                {selectedCategories.includes(c.slug) && (
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
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
      {/* ── Sticky header ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-[0_1px_20px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
          <Link href="/" className="flex-shrink-0">
            <Logo height={28} />
          </Link>

          {/* Search bar */}
          <div className="flex-1 max-w-xl relative group">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1ECE25] transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            <input
              type="text"
              placeholder="Search artisans by name or skill..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1ECE25]/30 focus:border-[#1ECE25]/40 focus:bg-white transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Mobile filter toggle */}
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="lg:hidden flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-brand-navy text-white text-sm font-bold shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
            Filters
          </button>

          <div className="hidden sm:flex items-center gap-3">
            <Link href="/services" className="text-sm font-semibold text-gray-500 hover:text-[#1ECE25] transition-colors">Services</Link>
            <Link href="/auth/login" className="text-sm font-semibold text-gray-500 hover:text-brand-navy transition-colors">Log In</Link>
            <Link href="/auth/register" className="bg-brand-navy text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-brand-navy/90 transition-all shadow-sm hover:shadow-md">Sign Up</Link>
          </div>
        </div>
      </header>

      {/* ── Mobile filters slide-in ─────────────────────────────── */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl p-6 overflow-y-auto animate-slide-in-right">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-brand-navy tracking-tight">Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <FiltersPanel />
          </div>
        </div>
      )}

      {/* ── Main layout ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedCategories.length === 0 && query.length === 0 ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-br from-[#1ECE25]/20 to-brand-navy/10 rounded-[2rem] flex items-center justify-center mb-8 animate-float shadow-[0_20px_40px_-10px_rgba(30,206,37,0.2)]">
              <svg className="w-12 h-12 text-[#1ECE25]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            </div>
            <h2 className="text-3xl font-black text-brand-navy tracking-tight mb-3">Find the right artisan</h2>
            <p className="text-gray-500 mb-10 max-w-md text-lg font-medium leading-relaxed">
              Select a service category or type a skill to discover verified professionals near you.
            </p>

            {/* Quick category shortcuts */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-3 justify-center max-w-lg">
                {categories.slice(0, 6).map((cat, i) => (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.slug)}
                    className="bg-white border border-gray-100 hover:border-[#1ECE25]/40 hover:bg-[#1ECE25]/5 px-5 py-2.5 rounded-2xl text-sm font-bold text-gray-600 hover:text-[#1ECE25] transition-all duration-200 shadow-sm hover:shadow-md animate-fade-in-up"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    {cat.icon && <span className="mr-1.5">{cat.icon}</span>}{cat.name}
                  </button>
                ))}
              </div>
            )}

            <Link
              href="/services"
              className="mt-8 inline-flex items-center gap-2 bg-[#1ECE25] text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-[#1bb822] transition-all shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:-translate-y-0.5"
            >
              Browse All Services <span className="text-base">→</span>
            </Link>
          </div>
        ) : (
          <div className="flex gap-8">
            {/* ── Desktop sidebar ─────────────────────────────── */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-20 bg-white rounded-3xl border border-gray-100 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                <FiltersPanel />
              </div>
            </aside>

            {/* ── Results ─────────────────────────────────────── */}
            <main className="flex-1 min-w-0">
              {/* Results header */}
              <div className="flex items-center justify-between mb-6 animate-fade-in">
                <div>
                  <h1 className="text-2xl font-black text-brand-navy tracking-tight">
                    {isLoading ? (
                      <span className="text-gray-400">Searching nearby...</span>
                    ) : (
                      <>
                        <span className="text-[#1ECE25]">{artisans.length}</span> Artisan{artisans.length !== 1 ? 's' : ''} Found
                      </>
                    )}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {selectedCategoryObjects.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCategory(c.slug)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1ECE25]/10 text-[#1ECE25] rounded-full text-xs font-bold hover:bg-[#1ECE25]/20 transition-colors group"
                      >
                        {c.icon} {c.name}
                        <svg className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    ))}
                    <span className="text-xs text-gray-400 font-medium">within {radiusKm} km</span>
                  </div>
                </div>
                <Link href="/services" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#1ECE25] hover:text-[#1bb822] transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                  Change services
                </Link>
              </div>

              {/* Loading */}
              {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-white rounded-3xl border border-red-100 p-12 text-center animate-scale-in shadow-sm">
                  <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <span className="text-3xl">⚠️</span>
                  </div>
                  <h3 className="font-black text-xl text-red-800 mb-2 tracking-tight">Search Failed</h3>
                  <p className="text-gray-500 text-sm max-w-sm mx-auto">Couldn&apos;t retrieve artisans right now. Check your connection and try again.</p>
                </div>
              )}

              {/* No results */}
              {!isLoading && !error && artisans.length === 0 && (
                <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center animate-scale-in shadow-sm">
                  <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                  </div>
                  <h3 className="font-black text-2xl text-brand-navy tracking-tight mb-3">No artisans found nearby</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">Try expanding your search radius or selecting a different service category.</p>
                  <button
                    type="button"
                    onClick={() => setRadiusKm(50)}
                    className="bg-[#1ECE25] text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-[#1bb822] transition-all shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-0.5"
                  >
                    Expand to 50 km →
                  </button>
                </div>
              )}

              {/* Results grid */}
              {!isLoading && !error && artisans.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {artisans.map((artisan, i) => (
                    <ArtisanCard key={artisan.id} artisan={artisan} selectedCategories={selectedCategories} index={i} />
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
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#1ECE25]/20 border-t-[#1ECE25] rounded-full animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
