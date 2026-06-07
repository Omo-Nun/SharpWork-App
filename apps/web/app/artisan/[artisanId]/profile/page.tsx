'use client';

import Image from 'next/image';
import { use, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { blockUser, fetchPublicArtisanProfile, reportUser } from '../../../../lib/marketplace';

export default function ArtisanProfilePage({ params }: { params: Promise<{ artisanId: string }> }) {
  const { artisanId } = use(params);
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [actionError, setActionError] = useState('');

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
      setTimeout(() => {
        setIsReporting(false);
        setReportSubmitted(false);
      }, 2000);
    } catch {
      setActionError('Failed to submit report. Please sign in and try again.');
    }
  };

  const handleBlock = async () => {
    setActionError('');
    try {
      await blockUser(artisanId, reportReason || 'Blocked from profile page');
      setReportSubmitted(true);
    } catch {
      setActionError('Failed to block user. Please sign in and try again.');
    }
  };

  if (isLoading) {
    return <div className="max-w-5xl mx-auto py-10 px-4 text-gray-500">Loading profile...</div>;
  }

  if (error || !profile) {
    return (
      <div className="max-w-5xl mx-auto py-10 px-4">
        <p className="text-red-600">Artisan not found or not verified.</p>
        <Link href="/search" className="text-brand-green font-bold mt-4 inline-block">← Back to search</Link>
      </div>
    );
  }

  const displayName = `${profile.firstName} ${profile.lastName}`;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="h-32 bg-[#0D2B5E]" />
        <div className="px-6 py-4 sm:flex sm:items-center sm:justify-between relative">
          <div className="sm:flex sm:space-x-5">
            <div className="flex-shrink-0 -mt-16 relative">
              <Image
                className="mx-auto h-24 w-24 rounded-full border-4 border-white shadow-md object-cover"
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D2B5E&color=fff`}
                alt={displayName}
                width={96}
                height={96}
                unoptimized
              />
            </div>
            <div className="mt-4 text-center sm:mt-0 sm:pt-1 sm:text-left">
              <p className="text-xl font-bold text-gray-900 sm:text-2xl">{displayName}</p>
              <p className="text-sm font-medium text-gray-600">{profile.categories?.map((c) => c.name).join(', ') || profile.skills.join(', ') || 'Artisan'}</p>
              <div className="mt-1 flex items-center justify-center sm:justify-start gap-2">
                {profile.isVerified && (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-[#007A52]">
                    Verified Artisan
                  </span>
                )}
                <span className="text-sm text-yellow-500">
                  ★ {profile.averageRating} ({profile.reviewCount} reviews)
                </span>
              </div>
              <div className="mt-2 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                {['identity', 'skills', 'background', 'references'].map(badge => {
                  const hasBadge = profile.verificationBadges?.includes(badge);
                  return (
                    <span key={badge} className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${hasBadge ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-500 border border-gray-200 opacity-60'}`}>
                      {hasBadge ? '✓ ' : '⏳ '}{badge.charAt(0).toUpperCase() + badge.slice(1)}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="mt-5 flex justify-center sm:mt-0 gap-3">
            <Link
              href={`/book/${artisanId}${profile.categories?.length ? `?categories=${profile.categories.map((c) => c.slug).join(',')}` : ''}`}
              className="inline-flex items-center justify-center rounded-md bg-[#F56500] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#F56500]/90"
            >
              Book Now
            </Link>
            <button onClick={() => setIsReporting(true)} className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
              Report
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Services Offered</h2>
            <div className="flex flex-wrap gap-2">
              {(profile.categories?.length ? profile.categories : profile.skills.map((s) => ({ id: s, name: s, slug: s, icon: null, description: null }))).map((item) => (
                <span key={item.id || item.name} className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">{item.icon ? `${item.icon} ` : ''}{item.name}</span>
              ))}
            </div>
          </div>

          {profile.portfolioUrls.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Portfolio</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {profile.portfolioUrls.map((url) => (
                  <Image
                    key={url}
                    src={url}
                    alt="Portfolio"
                    width={320}
                    height={128}
                    unoptimized
                    className="h-32 w-full object-cover rounded-lg bg-gray-200"
                  />
                ))}
              </div>
            </div>
          )}

          {profile.reviews.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Reviews</h2>
              <div className="space-y-4">
                {profile.reviews.map((review, i) => (
                  <div key={i} className="border-b pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 text-xs">
                        {review.reviewerName?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{review.reviewerName || 'Anonymous'}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-yellow-500 text-xs tracking-wider">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                          <p className="text-xs text-gray-400">• {new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    {review.comment && <p className="text-gray-600 text-sm">{review.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Details</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Member Since</dt>
              <dd className="font-medium text-gray-900">{profile.memberSince ? new Date(profile.memberSince).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Unknown'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Completed Jobs</dt>
              <dd className="font-medium text-gray-900">{profile.completedJobsCount || 0}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Response Time</dt>
              <dd className="font-medium text-gray-900">~{profile.responseTimeMinutes || 15} min</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Reviews</dt>
              <dd className="font-medium text-gray-900">{profile.reviewCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Average Rating</dt>
              <dd className="font-medium text-gray-900">{profile.averageRating} / 5</dd>
            </div>
          </dl>

          <div className="mt-6">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Rating Distribution</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(stars => {
                const count = profile.ratingDistribution?.[stars.toString()] || 0;
                const percent = profile.reviewCount > 0 ? (count / profile.reviewCount) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center text-sm">
                    <span className="w-8 text-gray-500">{stars} ★</span>
                    <div className="flex-1 ml-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="w-8 text-right text-gray-500 text-xs">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {isReporting && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setIsReporting(false)} />
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              {!reportSubmitted ? (
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Report / Block User</h3>
                  <p className="text-sm text-gray-500 mt-2 mb-4">Our moderation team will review your report.</p>
                  {actionError && <p className="text-red-600 text-sm mb-2">{actionError}</p>}
                  <form onSubmit={handleReport}>
                    <textarea
                      required
                      rows={4}
                      className="w-full rounded-md border-gray-300 border p-2 sm:text-sm"
                      placeholder="Describe the issue..."
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                    />
                    <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                      <button type="button" onClick={() => setIsReporting(false)} className="px-4 py-2 border rounded-md text-sm">Cancel</button>
                      <button type="button" onClick={handleBlock} className="px-4 py-2 border border-red-300 text-red-700 rounded-md text-sm font-medium">Block User</button>
                      <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium">Submit Report</button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="text-center py-6">
                  <h3 className="text-lg font-medium text-gray-900">Action Recorded</h3>
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
