'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export function ArtisanVerificationBanner() {
  const { user } = useAuth();

  if (user?.role !== 'ARTISAN' || user.profile?.isVerified) {
    return null;
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-6xl mx-auto px-6 py-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-amber-900">
          <strong>Complete verification</strong> to receive job requests and appear in customer search.
        </p>
        <Link
          href="/verify"
          className="inline-flex items-center justify-center bg-brand-green text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-green-700 transition-colors"
        >
          Start Verification
        </Link>
      </div>
    </div>
  );
}
