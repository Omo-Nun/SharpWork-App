'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchServiceCategories, type ServiceCategory } from '../../lib/marketplace';
import { 
  Wrench, Zap, Sparkles, Hammer, Paintbrush, 
  Wind, BatteryCharging, PenTool, Scissors, Truck, Shield
} from 'lucide-react';

function getCategoryIcon(slug: string, apiIcon?: string) {
  const mapping: Record<string, React.ReactNode> = {
    'plumbing': <Wrench className="w-8 h-8 text-brand-navy" />,
    'electrical': <Zap className="w-8 h-8 text-brand-navy" />,
    'cleaning': <Sparkles className="w-8 h-8 text-brand-navy" />,
    'carpentry': <Hammer className="w-8 h-8 text-brand-navy" />,
    'painting': <Paintbrush className="w-8 h-8 text-brand-navy" />,
    'ac-repair': <Wind className="w-8 h-8 text-brand-navy" />,
    'generator-repair': <BatteryCharging className="w-8 h-8 text-brand-navy" />,
    'moving': <Truck className="w-8 h-8 text-brand-navy" />,
    'beauty': <Scissors className="w-8 h-8 text-brand-navy" />,
    'security': <Shield className="w-8 h-8 text-brand-navy" />
  };
  return mapping[slug] || <PenTool className="w-8 h-8 text-brand-navy" />;
}

function ServicesContent() {
  const router = useRouter();

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchServiceCategories,
  });

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

      <div className="max-w-7xl mx-auto p-6 md:p-8 -mt-10 relative z-20">
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
              {Object.entries(
                categories.reduce((acc, cat) => {
                  const groupName = cat.group?.name || 'Other Services';
                  if (!acc[groupName]) acc[groupName] = [];
                  acc[groupName].push(cat);
                  return acc;
                }, {} as Record<string, ServiceCategory[]>)
              ).map(([groupName, groupCategories]) => (
                <div key={groupName} className="mb-12">
                  <h2 className="text-2xl font-black text-brand-navy mb-6 pb-2 border-b-2 border-gray-100">{groupName}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupCategories.map((cat: ServiceCategory) => {
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => router.push(`/search?categories=${cat.slug}`)}
                          className="text-left p-6 rounded-2xl border-2 transition-all duration-300 transform hover:-translate-y-1 border-gray-100 bg-white hover:border-gray-300 hover:shadow-md"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <span className="p-3 rounded-2xl bg-gray-50 flex items-center justify-center">
                              {getCategoryIcon(cat.slug, cat.icon)}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-brand-green/5 text-brand-green flex items-center justify-center transition-colors">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                              </svg>
                            </div>
                          </div>
                          <h3 className="font-bold text-xl text-brand-navy mb-1">{cat.name}</h3>
                          <p className="text-sm text-gray-500 leading-relaxed">{cat.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
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
