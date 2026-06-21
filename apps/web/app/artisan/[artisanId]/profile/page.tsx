'use client';

import Image from 'next/image';
import Link from 'next/link';
import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { blockUser, fetchPublicArtisanProfile, reportUser } from '../../../../lib/marketplace';

/* ── Star rating display ────────────────────────────────── */
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

/* ── Gallery lightbox ───────────────────────────────────── */
function GalleryLightbox({ images, initial, onClose }: { images: string[]; initial: number; onClose: () => void }) {
  const [idx, setIdx] = useState(initial);
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-6 right-6 text-white/80 hover:text-white z-10">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
      <div className="max-w-4xl max-h-[85vh] relative" onClick={e => e.stopPropagation()}>
        <Image src={images[idx] || ''} alt={`Portfolio ${idx + 1}`} width={1000} height={700} unoptimized className="max-h-[85vh] object-contain rounded-lg" />
        {images.length > 1 && (
          <>
            <button onClick={() => setIdx((idx - 1 + images.length) % images.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>
            <button onClick={() => setIdx((idx + 1) % images.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
          </>
        )}
      </div>
      <div className="absolute bottom-6 text-white/70 text-sm">{idx + 1} / {images.length}</div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────── */
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

  /* ── Loading skeleton ─── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="h-44 bg-brand-navy animate-pulse" />
        <div className="max-w-5xl mx-auto px-4 -mt-16">
          <div className="bg-white rounded-2xl p-6 shadow-sm border animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-7 bg-gray-200 rounded w-48 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-64 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Error / Not found ─── */
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-brand-navy mb-2">Artisan Not Found</h2>
          <p className="text-gray-500 mb-6">This profile doesn&apos;t exist or is not yet verified.</p>
          <Link href="/search" className="text-brand-green font-bold hover:underline">← Back to search</Link>
        </div>
      </div>
    );
  }

  const displayName = `${profile.firstName} ${profile.lastName}`;
  const starsFull = Math.floor(profile.averageRating || 0);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* ── Lightbox ─── */}
      {lightboxIndex !== null && (
        <GalleryLightbox images={profile.portfolioUrls} initial={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}

      {/* ── Sticky header ─── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-black text-brand-navy flex items-center gap-1.5">
            <span className="bg-brand-green text-white w-7 h-7 rounded-lg flex items-center justify-center text-sm shadow shadow-brand-green/30">S</span>
            Sharp<span className="text-brand-green">Work</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/search" className="text-sm font-medium text-gray-500 hover:text-brand-green transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
              Back to search
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero banner ─── */}
      <div className="relative bg-gradient-to-br from-brand-navy via-brand-navy to-brand-navy/80 h-44 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', backgroundSize: '30px' }} />
      </div>

      {/* ── Profile card (overlapping banner) ─── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-20 relative z-10 mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-5">
            {/* Avatar */}
            <div className="flex-shrink-0 -mt-16 sm:-mt-20 self-center sm:self-auto">
              <Image
                className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl border-4 border-white shadow-lg object-cover"
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D2B5E&color=fff&size=256&rounded=true`}
                alt={displayName}
                width={128}
                height={128}
                unoptimized
              />
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-black text-brand-navy flex items-center justify-center sm:justify-start gap-2">
                {displayName}
                {profile.isVerified && (
                  <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-bold ring-1 ring-emerald-200">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                    Verified
                  </span>
                )}
              </h1>
              <p className="text-gray-500 mt-1">{profile.categories?.map((c) => c.name).join(' • ') || profile.skills.join(' • ') || 'Professional Artisan'}</p>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start">
                <StarRating rating={profile.averageRating} />
                <span className="text-sm font-bold text-gray-800">{profile.averageRating.toFixed(1)}</span>
                <span className="text-sm text-gray-400">({profile.reviewCount} review{profile.reviewCount !== 1 ? 's' : ''})</span>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-2 flex-wrap mt-3 justify-center sm:justify-start">
                {['identity', 'skills', 'background', 'references'].map(badge => {
                  const hasBadge = profile.verificationBadges?.includes(badge);
                  return (
                    <span key={badge} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-opacity ${
                      hasBadge ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-gray-50 text-gray-400 ring-1 ring-gray-200 opacity-50'
                    }`}>
                      {hasBadge ? (
                        <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                      ) : '⏳'}
                      {badge.charAt(0).toUpperCase() + badge.slice(1)}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 flex-shrink-0 self-center sm:self-start mt-4 sm:mt-0">
              <Link
                href={`/book/${artisanId}${profile.categories?.length ? `?categories=${profile.categories.map((c) => c.slug).join(',')}` : ''}`}
                className="inline-flex items-center justify-center gap-2 bg-brand-green text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
                Request Service
              </Link>
              <button
                onClick={() => setIsReporting(true)}
                className="inline-flex items-center justify-center gap-1 border border-gray-200 bg-white px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content grid ─── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left column (2/3) ─── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Services */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-brand-navy mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-green" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1-3.4a.75.75 0 01-.18-1.05l2.92-4.08a.75.75 0 011.05-.18l5.1 3.4a.75.75 0 01.18 1.05l-2.92 4.08a.75.75 0 01-1.05.18z" /><path strokeLinecap="round" strokeLinejoin="round" d="M1.07 18.66L5.1 22.5a.75.75 0 001.05-.18l2.92-4.08-5.1-3.4L1.07 18.66z" /></svg>
                Services Offered
              </h2>
              <div className="flex flex-wrap gap-2">
                {(profile.categories?.length ? profile.categories : profile.skills.map((s) => ({ id: s, name: s, slug: s, icon: null, description: null }))).map((item) => (
                  <span key={item.id || item.name} className="px-4 py-2 bg-brand-navy/5 rounded-xl text-sm font-medium text-brand-navy">
                    {item.icon ? `${item.icon} ` : ''}{item.name}
                  </span>
                ))}
              </div>
            </section>

            {/* Portfolio gallery */}
            {profile.portfolioUrls.length > 0 && (
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-brand-navy mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-brand-green" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v13.5a1.5 1.5 0 001.5 1.5z" /></svg>
                  Portfolio ({profile.portfolioUrls.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {profile.portfolioUrls.map((url, i) => (
                    <button key={url} type="button" onClick={() => setLightboxIndex(i)} className="group relative overflow-hidden rounded-xl aspect-[4/3]">
                      <Image
                        src={url}
                        alt={`Portfolio ${i + 1}`}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" /></svg>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-brand-navy mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-green" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
                Reviews ({profile.reviewCount})
              </h2>

              {profile.reviews.length > 0 ? (
                <div className="space-y-4">
                  {profile.reviews.map((review, i) => (
                    <div key={i} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-navy/10 to-brand-green/10 flex items-center justify-center font-bold text-brand-navy text-sm flex-shrink-0">
                          {review.reviewerName?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-sm text-gray-900">{review.reviewerName || 'Anonymous'}</p>
                            <span className="text-xs text-gray-400">•</span>
                            <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                          <StarRating rating={review.rating} size="sm" />
                          {review.comment && <p className="text-gray-600 text-sm mt-2 leading-relaxed">{review.comment}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
                  </div>
                  <p className="text-gray-500 text-sm">No reviews yet. Be the first to hire this artisan!</p>
                </div>
              )}
            </section>
          </div>

          {/* ── Right sidebar (1/3) ─── */}
          <div className="space-y-6">
            {/* Quick stats */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wider mb-4">Quick Stats</h2>
              <dl className="space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-500 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                    Member Since
                  </dt>
                  <dd className="font-bold text-sm text-brand-navy">{profile.memberSince ? new Date(profile.memberSince).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'N/A'}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-500 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                    Jobs Completed
                  </dt>
                  <dd className="font-bold text-sm text-brand-navy">{profile.completedJobsCount || 0}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-500 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Response Time
                  </dt>
                  <dd className="font-bold text-sm text-brand-navy">~{profile.responseTimeMinutes || 15} min</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-500 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
                    Average Rating
                  </dt>
                  <dd className="font-bold text-sm text-brand-navy">{profile.averageRating.toFixed(1)} / 5</dd>
                </div>
              </dl>
            </section>

            {/* Rating distribution */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wider mb-4">Rating Breakdown</h2>
              <div className="space-y-2.5">
                {[5, 4, 3, 2, 1].map(stars => {
                  const count = profile.ratingDistribution?.[stars.toString()] || 0;
                  const percent = profile.reviewCount > 0 ? (count / profile.reviewCount) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-2 text-sm">
                      <span className="w-6 text-gray-500 font-medium text-right">{stars}</span>
                      <svg className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="w-8 text-right text-xs text-gray-400 font-medium">{count}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* CTA card */}
            <section className="bg-gradient-to-br from-brand-green to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
              <h3 className="font-bold text-lg mb-2">Need this service?</h3>
              <p className="text-white/80 text-sm mb-4">Describe what you need and get a custom quote from {profile.firstName}.</p>
              <Link
                href={`/book/${artisanId}${profile.categories?.length ? `?categories=${profile.categories.map((c) => c.slug).join(',')}` : ''}`}
                className="block w-full text-center bg-white text-brand-green py-3 rounded-xl font-bold text-sm hover:bg-green-50 transition-colors shadow-sm"
              >
                Request Service →
              </Link>
            </section>
          </div>
        </div>
      </div>

      {/* ── Report modal ─── */}
      {isReporting && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsReporting(false)} />
            <div className="relative bg-white rounded-2xl p-6 shadow-2xl max-w-lg w-full">
              {!reportSubmitted ? (
                <div>
                  <h3 className="text-lg font-bold text-brand-navy mb-1">Report / Block User</h3>
                  <p className="text-sm text-gray-500 mb-4">Our moderation team will review your report within 24 hours.</p>
                  {actionError && <p className="text-red-600 text-sm mb-3 bg-red-50 p-2 rounded-lg">{actionError}</p>}
                  <form onSubmit={handleReport}>
                    <textarea
                      required
                      rows={4}
                      className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green resize-none"
                      placeholder="Describe the issue..."
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                    />
                    <div className="mt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                      <button type="button" onClick={() => setIsReporting(false)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                      <button type="button" onClick={handleBlock} className="px-4 py-2.5 rounded-xl border border-red-200 text-red-700 text-sm font-bold hover:bg-red-50 transition-colors">Block User</button>
                      <button type="submit" className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors">Submit Report</button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-green-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-brand-navy">Action Recorded</h3>
                  <p className="text-sm text-gray-500 mt-2">Thank you. We have received your submission.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
