'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';
import { apiPost, ApiError } from '../../../lib/api';

function VerifyPhoneForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneParam = searchParams.get('phone') || '';
  const nextParam = searchParams.get('next');
  const devOtp = searchParams.get('devOtp') || '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiPost('/auth/verify-phone', {
        phoneNumber: phoneParam,
        otp,
      });

      // Verification successful, redirect to login
      router.push(`/auth/login${nextParam ? `?next=${encodeURIComponent(nextParam)}` : ''}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black text-brand-green tracking-tighter hover:opacity-80 transition-opacity">
            SharpWork
          </Link>
          <h1 className="text-2xl font-bold mt-6">Verify Phone Number</h1>
          <p className="text-gray-500 mt-2">
            We sent a verification code to <span className="font-bold text-gray-900">{phoneParam}</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {devOtp && (
          <div className="mb-6 p-4 rounded-2xl border border-emerald-200 bg-emerald-50 text-sm text-emerald-800 text-center">
            <span className="font-bold">🛠️ Dev OTP:</span> <code className="bg-emerald-100 px-2 py-1 rounded font-mono text-base font-bold text-emerald-900">{devOtp}</code>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code (OTP)</label>
            <input
              type="text"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter the 6-digit code"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all text-center tracking-widest font-mono text-lg"
              maxLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 4}
            className="w-full bg-brand-green text-white py-3.5 rounded-xl font-bold text-lg hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify Phone Number'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function VerifyPhonePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <VerifyPhoneForm />
    </Suspense>
  );
}
