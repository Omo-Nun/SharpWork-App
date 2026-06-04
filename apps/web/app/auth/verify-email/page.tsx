'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { apiPost, ApiError } from '../../../lib/api';

type VerifyState = 'loading' | 'success' | 'already' | 'error';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [state, setState] = useState<VerifyState>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setMessage('Missing verification token.');
      return;
    }

    apiPost<{ message: string; alreadyVerified?: boolean }>('/auth/verify-email', { token })
      .then((result) => {
        setState(result.alreadyVerified ? 'already' : 'success');
        setMessage(result.message);
      })
      .catch((err: unknown) => {
        setState('error');
        setMessage(err instanceof ApiError ? err.message : 'Verification failed.');
      });
  }, [token]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center">
        <Link href="/" className="text-3xl font-black text-brand-green tracking-tighter">
          SharpWork
        </Link>

        <div className="mt-8">
          {state === 'loading' && (
            <>
              <div className="w-12 h-12 border-4 border-brand-green/30 border-t-brand-green rounded-full animate-spin mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-brand-navy">Verifying your email...</h1>
            </>
          )}

          {(state === 'success' || state === 'already') && (
            <>
              <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-green text-3xl">
                ✓
              </div>
              <h1 className="text-2xl font-bold text-brand-navy mb-3">
                {state === 'already' ? 'Already verified' : 'Email verified'}
              </h1>
              <p className="text-gray-500 mb-8">{message}</p>
              <button
                type="button"
                onClick={() => router.push('/auth/login')}
                className="w-full bg-brand-green text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all"
              >
                Continue to Log In
              </button>
            </>
          )}

          {state === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 text-3xl">
                !
              </div>
              <h1 className="text-2xl font-bold text-brand-navy mb-3">Verification failed</h1>
              <p className="text-gray-500 mb-8">{message}</p>
              <Link
                href="/auth/check-email"
                className="inline-block w-full bg-brand-green text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all"
              >
                Request a New Link
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
