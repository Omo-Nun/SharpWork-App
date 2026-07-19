'use client';

import Image from 'next/image';
import Link from 'next/link';
import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { blockUser, fetchPublicArtisanProfile, reportUser } from '../../../../lib/marketplace';
import { Logo } from '../../../../components/Logo';

/* ── Star rating ──────────────────────────────────────────── */
function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' }) {
  const stars = [];
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  const sz = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';

  for (let i = 0; i < full; i++) stars.push(<svg key={`f${i}`} className={`${sz} text-yellow-400`} viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>);
  if (half) stars.push(<svg key="h" className={`${sz} text-yellow-400`} viewBox="0 0 20 20" fill="currentColor"><defs><linearGradient id="halfGrad"><stop offset="50%" stopColor="currentColor" /><stop offset="50%" stopColor="#E5E7EB" /></linearGradient></defs><path fill="url(#halfGrad)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>);
  for (let i = 0; i < empty; i++) stars.push(<svg key={`e${i}`} className={`${sz} text-gray-200`} viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>);
  return <div className="flex items-center gap-0.5">{stars}</div>;
}

/* ── Gallery lightbox ─────────────────────────────────────── */
function GalleryLightbox({ images, initial, onClose }: { images: string[]; initial: number; onClose: () => void }) {
  const [idx, setIdx] = useState(initial);
  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center animate-fade-in" onClick={onClose}>
      <button onClick={onClose} className="absolute top-5 right-5 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
      <div className="max-w-5xl max-h-[88vh] relative animate-scale-in" onClick={e => e.stopPropagation()}>
        <Image src={images[idx] || ''} alt={`Portfolio ${idx + 1}`} width={1200} height={800} unoptimized className="max-h-[88vh] object-contain rounded-2xl" />
        {images.length > 1 && (
          <>
            <button onClick={() => setIdx((idx - 1 + images.length) % images.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/15 hover:bg-white/30 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-all hover:scale-110">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>
            <button onClick={() => setIdx((idx + 1) % images.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/15 hover:bg-white/30 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-all hover:scale-110">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === idx ? 'bg-white w-5' : 'bg-white/40'}`} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────── */
export default function ArtisanProfilePage({ params }: { params: Promise<{ artisanId: string }> }) {
  const { artisanId } = use(params);
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [actionError, setActionError] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['artisan', 'public', artisanId],
    queryFn: () => fetchPublicArtisanProfile(artisanId),
  });

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    try {
      await reportUser(artisanId, reportReason);
      setReportSubmitted(true);
      setTimeout(() => { setIsReporting(false); setReportSubmitted(false); }, 2000);
    } catch { setActionError('Failed to submit report. Please sign in and try again.'); }
  };

  const handleBlock = async () => {
    setActionError('');
    try {
      await blockUser(artisanId, reportReason || 'Blocked from profile page');
      setReportSubmitted(true);
    } catch { setActionError('Failed to block user. Please sign in and try again.'); }
  };

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="h-56 bg-brand-navy animate-pulse" />
        <div className="max-w-5xl mx-auto px-4 -mt-20">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 animate-pulse">
            <div className="flex items-end gap-6">
              <div className="w-32 h-32 rounded-2xl bg-gray-200 flex-shrink-0" />
              <div className="flex-1 pb-2">
                <div className="h-7 bg-gray-200 rounded-lg w-48 mb-3" />
                <div className="h-4 bg-gray-200 rounded-lg w-64 mb-3" />
                <div className="h-4 bg-gray-200 rounded-lg w-36" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Error / Not found ── */
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center animate-scale-in">
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg">
            <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
          </div>
          <h2 className="text-2xl font-black text-brand-navy tracking-tight mb-2">Artisan Not Found</h2>
          <p className="text-gray-500 font-medium mb-6">This profile doesn&apos;t exist or is not yet verified.</p>
          <Link href="/search" className="inline-flex items-center gap-2 text-[#1ECE25] font-bold hover:underline">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            Back to search
          </Link>
        </div>
      </div>
    );
  }

  const displayName = `${profile.firstName} ${profile.lastName}`;

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Lightbox */}
      {lightboxIndex !== null && (
        <GalleryLightbox images={profile.portfolioUrls} initial={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}

      {/* ── Sticky header ──────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-[0_1px_20px_rgba(0,0,0,0.04)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/"><Logo height={26} /></Link>
          <div className="flex items-center gap-3">
            <Link href="/search" className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-brand-navy transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
              Back to search
            </Link>
            <Link
              href={`/book/${artisanId}${profile.categories?.length ? `?categories=${profile.categories.map(c => c.slug).join(',')}` : ''}`}
              className="bg-[#1ECE25] text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-[#1bb822] transition-all shadow-[0_2px_10px_rgba(30,206,37,0.3)] hover:shadow-[0_4px_15px_rgba(30,206,37,0.35)]"
            >
              Request Service
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero banner ──────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-brand-navy via-[#0D2B5E] to-[#1a3a72] h-52 overflow-hidden">
        {/* Animated mesh overlay */}
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top_right,_#1ECE25_0%,_transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '25px 25px' }} />
        {/* Animated floating orbs */}
        <div className="absolute top-[10%] right-[15%] w-32 h-32 rounded-full bg-[#1ECE25]/20 blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute bottom-[10%] left-[10%] w-24 h-24 rounded-full bg-white/5 blur-3xl animate-pulse" style={{ animationDuration: '7s', animationDelay: '1s' }} />
      </div>

      {/* ── Profile card ─────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-24 relative z-10 mb-8 animate-fade-in-up">
        <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] border border-gray-100 p-7 sm:p-9">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0 -mt-20 sm:-mt-24 self-center sm:self-auto">
              <div className="relative">
                <Image
                  className="h-32 w-32 sm:h-36 sm:w-36 rounded-[1.5rem] border-4 border-white shadow-[0_10px_30px_-5px_rgba(0,0,0,0.2)] object-cover"
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D2B5E&color=fff&size=256&rounded=true`}
                  alt={displayName}
                  width={144}
                  height={144}
                  unoptimized
                />
                {profile.isVerified && (
                  <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-[#1ECE25] rounded-full flex items-center justify-center border-3 border-white shadow-md">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left pt-2">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-brand-navy tracking-tight">{displayName}</h1>
                  <p className="text-gray-500 font-semibold mt-1 text-base">{profile.categories?.map(c => c.name).join(' · ') || profile.skills.join(' · ') || 'Professional Artisan'}</p>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2.5 mt-3 justify-center sm:justify-start">
                    <StarRating rating={profile.averageRating} />
                    <span className="font-black text-brand-navy tracking-tight">{profile.averageRating.toFixed(1)}</span>
                    <span className="text-sm text-gray-400 font-medium">({profile.reviewCount} review{profile.reviewCount !== 1 ? 's' : ''})</span>
                    {profile.isOnline && (
                      <span className="inline-flex items-center gap-1.5 bg-[#1ECE25]/10 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full ml-1">
                        <span className="w-1.5 h-1.5 bg-[#1ECE25] rounded-full animate-pulse" />
                        Online
                      </span>
                    )}
                  </div>

                  {/* Trust badges */}
                  <div className="flex items-center gap-2 flex-wrap mt-4 justify-center sm:justify-start">
                    {['identity', 'skills', 'background', 'references'].map(badge => {
                      const hasBadge = profile.verificationBadges?.includes(badge);
                      return (
                        <span key={badge} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                          hasBadge ? 'bg-[#1ECE25]/10 text-emerald-700' : 'bg-gray-50 text-gray-300'
                        }`}>
                          {hasBadge ? (
                            <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                          ) : '–'}
                          {badge.charAt(0).toUpperCase() + badge.slice(1)}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2.5 flex-shrink-0">
                  <Link
                    href={`/book/${artisanId}${profile.categories?.length ? `?categories=${profile.categories.map(c => c.slug).join(',')}` : ''}`}
                    className="inline-flex items-center justify-center gap-2 bg-[#1ECE25] text-white px-7 py-3.5 rounded-2xl font-bold text-sm hover:bg-[#1bb822] transition-all shadow-[0_4px_20px_rgba(30,206,37,0.3)] hover:shadow-[0_8px_30px_rgba(30,206,37,0.4)] hover:-translate-y-0.5"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                    Request Service
                  </Link>
                  <button
                    onClick={() => setIsReporting(true)}
                    className="inline-flex items-center justify-center border border-gray-100 bg-gray-50 px-5 py-2.5 rounded-2xl text-sm font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                  >
                    Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content grid ─────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left (2/3) ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Services */}
            <section className="bg-white rounded-3xl border border-gray-100 p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] animate-fade-in-up stagger-1">
              <h2 className="text-base font-black text-brand-navy uppercase tracking-widest mb-5 flex items-center gap-2.5">
                <div className="w-6 h-6 bg-[#1ECE25] rounded-lg flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1-3.4M1.07 18.66L5.1 22.5m3.57-7.5l9.57 5.97" /></svg>
                </div>
                Services Offered
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {(profile.categories?.length ? profile.categories : profile.skills.map(s => ({ id: s, name: s, slug: s, icon: null, description: null }))).map((item) => (
                  <span key={item.id || item.name} className="px-4 py-2 bg-brand-navy/5 rounded-2xl text-sm font-bold text-brand-navy hover:bg-brand-navy/10 transition-colors cursor-default">
                    {item.icon ? `${item.icon} ` : ''}{item.name}
                  </span>
                ))}
              </div>
            </section>

            {/* Portfolio gallery */}
            {profile.portfolioUrls.length > 0 && (
              <section className="bg-white rounded-3xl border border-gray-100 p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] animate-fade-in-up stagger-2">
                <h2 className="text-base font-black text-brand-navy uppercase tracking-widest mb-5 flex items-center gap-2.5">
                  <div className="w-6 h-6 bg-brand-navy rounded-lg flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v13.5a1.5 1.5 0 001.5 1.5z" /></svg>
                  </div>
                  Portfolio ({profile.portfolioUrls.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {profile.portfolioUrls.map((url, i) => (
                    <button
                      key={`${url}-${i}`}
                      type="button"
                      onClick={() => setLightboxIndex(i)}
                      className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-gray-100"
                    >
                      <Image
                        src={url}
                        alt={`Portfolio ${i + 1}`}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" /></svg>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            <section className="bg-white rounded-3xl border border-gray-100 p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] animate-fade-in-up stagger-3">
              <h2 className="text-base font-black text-brand-navy uppercase tracking-widest mb-5 flex items-center gap-2.5">
                <div className="w-6 h-6 bg-yellow-400 rounded-lg flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                </div>
                Reviews ({profile.reviewCount})
              </h2>

              {profile.reviews.length > 0 ? (
                <div className="space-y-5">
                  {profile.reviews.map((review, i) => (
                    <div key={i} className="border-b border-gray-50 pb-5 last:border-0 last:pb-0 animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-navy/10 to-[#1ECE25]/10 flex items-center justify-center font-black text-brand-navy text-sm flex-shrink-0 border border-gray-100">
                          {review.reviewerName?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2.5 mb-2">
                            <p className="font-bold text-sm text-gray-900">{review.reviewerName || 'Anonymous'}</p>
                            <span className="text-gray-200">·</span>
                            <p className="text-xs text-gray-400 font-medium">{new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                          <StarRating rating={review.rating} size="sm" />
                          {review.comment && <p className="text-gray-600 text-sm mt-2.5 leading-relaxed">{review.comment}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
                  </div>
                  <p className="text-gray-500 font-semibold text-sm">No reviews yet. Be the first to hire {profile.firstName}!</p>
                </div>
              )}
            </section>
          </div>

          {/* ── Right sidebar (1/3) ── */}
          <div className="space-y-5">
            {/* Sticky CTA */}
            <div className="sticky top-20 space-y-5">
              {/* Book CTA card */}
              <section className="bg-gradient-to-br from-brand-navy to-[#1a3a72] rounded-3xl p-7 text-white shadow-[0_20px_40px_-10px_rgba(13,43,94,0.4)] animate-fade-in-up stagger-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#1ECE25]/15 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-[#1ECE25] rounded-2xl flex items-center justify-center mb-4 shadow-[0_4px_12px_rgba(30,206,37,0.4)]">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                  </div>
                  <h3 className="font-black text-xl tracking-tight mb-2">Need {profile.firstName}&apos;s help?</h3>
                  <p className="text-white/60 text-sm mb-6 font-medium leading-relaxed">Describe your project and get a custom quote. Payment is held in escrow until you&apos;re satisfied.</p>
                  <Link
                    href={`/book/${artisanId}${profile.categories?.length ? `?categories=${profile.categories.map(c => c.slug).join(',')}` : ''}`}
                    className="block w-full text-center bg-[#1ECE25] text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-[#1bb822] transition-all shadow-[0_4px_15px_rgba(30,206,37,0.35)] hover:shadow-[0_6px_20px_rgba(30,206,37,0.5)] hover:-translate-y-0.5"
                  >
                    Request Service →
                  </Link>
                </div>
              </section>

              {/* Quick stats */}
              <section className="bg-white rounded-3xl border border-gray-100 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] animate-fade-in-up stagger-2">
                <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-5">Quick Stats</h2>
                <div className="space-y-4">
                  {[
                    { icon: '📅', label: 'Member Since', value: profile.memberSince ? new Date(profile.memberSince).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'N/A' },
                    { icon: '✅', label: 'Jobs Completed', value: `${profile.completedJobsCount || 0}` },
                    { icon: '⚡', label: 'Response Time', value: `~${profile.responseTimeMinutes || 15} min` },
                    { icon: '⭐', label: 'Average Rating', value: `${profile.averageRating.toFixed(1)} / 5.0` },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 font-medium flex items-center gap-2">
                        <span>{stat.icon}</span>
                        {stat.label}
                      </span>
                      <span className="font-black text-sm text-brand-navy">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Rating breakdown */}
              <section className="bg-white rounded-3xl border border-gray-100 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] animate-fade-in-up stagger-3">
                <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-5">Rating Breakdown</h2>
                <div className="space-y-2.5">
                  {[5, 4, 3, 2, 1].map(stars => {
                    const count = profile.ratingDistribution?.[stars.toString()] || 0;
                    const percent = profile.reviewCount > 0 ? (count / profile.reviewCount) * 100 : 0;
                    return (
                      <div key={stars} className="flex items-center gap-2.5 text-sm">
                        <span className="w-4 text-gray-500 font-bold text-right text-xs">{stars}</span>
                        <svg className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full transition-all duration-700" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="w-6 text-right text-xs text-gray-400 font-bold">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* ── Report modal ─────────────────────────────────────── */}
      {isReporting && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsReporting(false)} />
            <div className="relative bg-white rounded-3xl p-8 shadow-2xl max-w-lg w-full animate-scale-in border border-gray-100">
              {!reportSubmitted ? (
                <div>
                  <h3 className="text-xl font-black text-brand-navy tracking-tight mb-1">Report / Block User</h3>
                  <p className="text-sm text-gray-500 font-medium mb-6">Our moderation team will review your report within 24 hours.</p>
                  {actionError && <p className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-xl">{actionError}</p>}
                  <form onSubmit={handleReport}>
                    <textarea
                      required
                      rows={4}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1ECE25]/30 focus:border-[#1ECE25] focus:bg-white transition-all resize-none text-brand-navy placeholder:text-gray-400"
                      placeholder="Describe the issue..."
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                    />
                    <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
                      <button type="button" onClick={() => setIsReporting(false)} className="px-5 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-sm font-bold hover:bg-gray-100 transition-colors">Cancel</button>
                      <button type="button" onClick={handleBlock} className="px-5 py-2.5 rounded-xl border border-red-100 text-red-600 text-sm font-bold hover:bg-red-50 transition-colors">Block User</button>
                      <button type="submit" className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors">Submit Report</button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-[#1ECE25]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[#1ECE25]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                  </div>
                  <h3 className="text-xl font-black text-brand-navy tracking-tight">Action Recorded</h3>
                  <p className="text-sm text-gray-500 font-medium mt-2">Thank you. We have received your submission.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
