'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { apiPost, ApiError } from '../../../lib/api';

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleResend() {
    if (!email) {
      setError('No email address found. Please register again.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await apiPost<{ message: string }>('/auth/resend-verification', { email });
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not resend verification email.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center">
        <Link href="/" className="text-3xl font-black text-brand-green tracking-tighter">
          SharpWork
        </Link>

        <div className="mt-8 mb-6 w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto text-brand-green text-2xl">
          ✉
        </div>

        <h1 className="text-2xl font-bold text-brand-navy mb-3">Check your email</h1>
        <p className="text-gray-500 mb-2">
          We sent a verification link to
        </p>
        {email ? (
          <p className="font-bold text-brand-navy mb-6 break-all">{email}</p>
        ) : (
          <p className="font-bold text-brand-navy mb-6">your email address</p>
        )}
        <p className="text-sm text-gray-500 mb-8">
          Click the link in that email to verify your account and prevent spam registrations. The link expires in 24 hours.
        </p>

        {message && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleResend}
          disabled={loading || !email}
          className="w-full bg-brand-green text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed mb-4"
        >
          {loading ? 'Sending...' : 'Resend Verification Email'}
        </button>

        <Link href="/auth/login" className="text-brand-green font-bold hover:underline text-sm">
          Back to Log In
        </Link>
      </div>
    </main>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <CheckEmailContent />
    </Suspense>
  );
}
