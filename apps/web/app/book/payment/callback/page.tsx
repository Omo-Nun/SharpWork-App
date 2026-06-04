'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyBookingPayment } from '../../../../lib/marketplace';
import { ApiError } from '../../../../lib/api';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get('reference');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!reference) {
      setStatus('error');
      setMessage('Missing payment reference.');
      return;
    }

    verifyBookingPayment(reference)
      .then(() => {
        setStatus('success');
        setMessage('Payment confirmed. Your booking is secured in escrow.');
      })
      .catch((err: unknown) => {
        setStatus('error');
        setMessage(err instanceof ApiError ? err.message : 'Payment verification failed.');
      });
  }, [reference]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center">
        <Link href="/" className="text-2xl font-black text-brand-green">SharpWork</Link>

        {status === 'loading' && (
          <div className="mt-8">
            <div className="w-12 h-12 border-4 border-brand-green/30 border-t-brand-green rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Confirming your escrow payment...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="mt-8">
            <div className="text-5xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-brand-navy mb-2">Payment Secured</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              type="button"
              onClick={() => router.push('/dashboard/customer')}
              className="w-full bg-brand-green text-white py-3 rounded-xl font-bold"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-8">
            <div className="text-5xl mb-4 text-red-500">!</div>
            <h1 className="text-2xl font-bold text-brand-navy mb-2">Payment Issue</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link href="/search" className="text-brand-green font-bold hover:underline">
              Back to Search
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <PaymentCallbackContent />
    </Suspense>
  );
}
