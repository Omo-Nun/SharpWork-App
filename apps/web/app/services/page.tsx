'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchServiceCategories, type ServiceCategory } from '../../lib/marketplace';
import { Logo } from '../../components/Logo';
import {
  Wrench, Zap, Sparkles, Hammer, Paintbrush,
  Wind, BatteryCharging, PenTool, Scissors, Truck, Shield
} from 'lucide-react';

const CATEGORY_COLORS: Record<string, { bg: string; text: string; glow: string }> = {
  'plumbing':          { bg: 'bg-blue-50',    text: 'text-blue-600',   glow: 'shadow-blue-100' },
  'electrical':        { bg: 'bg-yellow-50',  text: 'text-yellow-600', glow: 'shadow-yellow-100' },
  'cleaning':          { bg: 'bg-teal-50',    text: 'text-teal-600',   glow: 'shadow-teal-100' },
  'carpentry':         { bg: 'bg-amber-50',   text: 'text-amber-700',  glow: 'shadow-amber-100' },
  'painting':          { bg: 'bg-purple-50',  text: 'text-purple-600', glow: 'shadow-purple-100' },
  'ac-repair':         { bg: 'bg-cyan-50',    text: 'text-cyan-600',   glow: 'shadow-cyan-100' },
  'generator-repair':  { bg: 'bg-orange-50',  text: 'text-orange-600', glow: 'shadow-orange-100' },
  'moving':            { bg: 'bg-indigo-50',  text: 'text-indigo-600', glow: 'shadow-indigo-100' },
  'beauty':            { bg: 'bg-pink-50',    text: 'text-pink-600',   glow: 'shadow-pink-100' },
  'security':          { bg: 'bg-red-50',     text: 'text-red-600',    glow: 'shadow-red-100' },
};

function getCategoryIcon(slug: string) {
  const icons: Record<string, React.ReactNode> = {
    'plumbing':         <Wrench className="w-7 h-7" />,
    'electrical':       <Zap className="w-7 h-7" />,
    'cleaning':         <Sparkles className="w-7 h-7" />,
    'carpentry':        <Hammer className="w-7 h-7" />,
    'painting':         <Paintbrush className="w-7 h-7" />,
    'ac-repair':        <Wind className="w-7 h-7" />,
    'generator-repair': <BatteryCharging className="w-7 h-7" />,
    'moving':           <Truck className="w-7 h-7" />,
    'beauty':           <Scissors className="w-7 h-7" />,
    'security':         <Shield className="w-7 h-7" />,
  };
  return icons[slug] || <PenTool className="w-7 h-7" />;
}

function CategoryCard({ cat, index, onSelect }: { cat: ServiceCategory; index: number; onSelect: () => void }) {
  const colors = CATEGORY_COLORS[cat.slug] || { bg: 'bg-gray-50', text: 'text-gray-600', glow: 'shadow-gray-100' };
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group text-left p-7 rounded-[1.75rem] border border-gray-100 bg-white hover:border-[#1ECE25]/30 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] transition-all duration-500 animate-fade-in-up relative overflow-hidden"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {/* Hover glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br from-[#1ECE25]/5 to-transparent transition-opacity duration-500 ${hovered ? 'opacity-100' : 'opacity-0'} pointer-events-none`} />

      {/* Icon */}
      <div className={`inline-flex p-4 rounded-2xl ${colors.bg} ${colors.text} mb-5 group-hover:scale-110 group-hover:shadow-lg ${colors.glow} transition-all duration-300`}>
        {getCategoryIcon(cat.slug)}
      </div>

      {/* Arrow */}
      <div className="absolute top-6 right-6 w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#1ECE25] transition-colors duration-300">
        <svg className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>

      <h3 className="font-black text-xl text-brand-navy tracking-tight mb-2">{cat.name}</h3>
      <p className="text-sm text-gray-500 leading-relaxed font-medium">{cat.description}</p>

      {/* Bottom "Find artisans" cta that appears on hover */}
      <div className={`mt-4 text-xs font-bold text-[#1ECE25] flex items-center gap-1 transition-all duration-300 ${hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
        Find artisans nearby <span>→</span>
      </div>
    </button>
  );
}

function ServicesContent() {
  const router = useRouter();

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchServiceCategories,
  });

  const grouped = categories.reduce((acc, cat) => {
    const groupName = cat.group?.name || 'Other Services';
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(cat);
    return acc;
  }, {} as Record<string, ServiceCategory[]>);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Sticky Header ──────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-[0_1px_20px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link href="/"><Logo height={28} /></Link>
          <div className="flex gap-4 items-center">
            <Link href="/search" className="text-sm font-semibold text-gray-500 hover:text-brand-navy transition-colors hidden sm:block">Find Artisans</Link>
            <Link href="/auth/login" className="font-semibold text-sm text-gray-500 hover:text-brand-navy transition-colors hidden sm:block">Log In</Link>
            <Link href="/auth/register" className="bg-brand-navy text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-navy/90 transition-all shadow-sm hover:shadow-md">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section with Animated Background ────────────── */}
      <section className="relative bg-brand-navy text-white pt-24 pb-32 px-6 overflow-hidden">
        {/* Animated blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/20 blur-[100px] animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-[100px] animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
          {/* Subtle dot grid */}
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        </div>

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-sm font-bold text-white/80 mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-[#1ECE25] rounded-full animate-pulse" />
            Verified Professionals Near You
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6 animate-fade-in-up stagger-1">
            What do you need
            <br />
            <span className="text-blue-300">help with?</span>
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed font-medium animate-fade-in-up stagger-2">
            Browse categories and find verified, background-checked professionals ready to work in your area.
          </p>

          {/* Floating stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-12 animate-fade-in-up stagger-3">
            {[
              { number: '500+', label: 'Verified Artisans' },
              { number: '10K+', label: 'Jobs Completed' },
              { number: '4.8★', label: 'Avg. Rating' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-black text-white tracking-tight">{stat.number}</div>
                <div className="text-sm text-white/50 font-semibold mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories (floats over hero) ─────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20 pb-24">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12)] border border-white/60 p-8 md:p-12">

          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-50 rounded-[1.75rem] p-7 h-52 relative overflow-hidden border border-gray-100">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_linear_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                  <div className="w-14 h-14 rounded-2xl bg-gray-200 mb-5" />
                  <div className="h-5 bg-gray-200 rounded-lg w-3/5 mb-3" />
                  <div className="h-3.5 bg-gray-200 rounded-lg w-4/5" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
                <span className="text-4xl">⚠️</span>
              </div>
              <h3 className="text-xl font-black text-brand-navy mb-2 tracking-tight">Couldn&apos;t load services</h3>
              <p className="text-gray-500 mb-6 font-medium">Check your connection and try again.</p>
              <button onClick={() => window.location.reload()} className="px-6 py-3 bg-[#1ECE25] text-white rounded-2xl font-bold text-sm hover:bg-[#1bb822] transition-all shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                Retry
              </button>
            </div>
          )}

          {!isLoading && !error && categories.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-5 opacity-30">🛠️</div>
              <h3 className="text-xl font-black text-brand-navy mb-2 tracking-tight">No categories yet</h3>
              <p className="text-gray-500 font-medium">New services are being added. Check back soon!</p>
            </div>
          )}

          {!isLoading && !error && categories.length > 0 && (
            <div className="space-y-14">
              {Object.entries(grouped).map(([groupName, groupCategories]) => (
                <div key={groupName}>
                  <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-2xl font-black text-brand-navy tracking-tight">{groupName}</h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
                    <span className="text-sm font-bold text-gray-400">{groupCategories.length} services</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {groupCategories.map((cat, i) => (
                      <CategoryCard
                        key={cat.id}
                        cat={cat}
                        index={i}
                        onSelect={() => router.push(`/search?categories=${cat.slug}`)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        {!isLoading && !error && categories.length > 0 && (
          <div className="mt-16 bg-gradient-to-br from-brand-navy to-brand-navy/90 rounded-[2rem] p-12 text-center relative overflow-hidden animate-fade-in-up">
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '25px 25px' }} />
            <div className="absolute top-0 right-0 w-[40%] h-[100%] bg-blue-500/20 blur-[80px]" />
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
                Can&apos;t find what you&apos;re looking for?
              </h3>
              <p className="text-white/60 mb-8 font-medium max-w-md mx-auto">
                Search directly for any artisan by name, skill, or specific service.
              </p>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 bg-[#1ECE25] text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-[#1bb822] transition-all shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5"
              >
                Search All Artisans <span className="text-base">→</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#1ECE25]/20 border-t-[#1ECE25] rounded-full animate-spin" />
      </div>
    }>
      <ServicesContent />
    </Suspense>
  );
}
