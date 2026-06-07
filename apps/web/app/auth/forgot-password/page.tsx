'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiPost, ApiError } from '../../../lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRequestOTP(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiPost<{ message: string }>('/auth/forgot-password', {
        phoneNumber: phone,
      });
      router.push(`/auth/reset-password?phone=${encodeURIComponent(phone)}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send OTP.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="text-center">
          <Link href="/" className="text-3xl font-black text-brand-green tracking-tighter hover:opacity-80 transition-opacity">
            SharpWork
          </Link>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Forgot Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We'll send a 6-digit OTP to your registered phone number via SMS.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleRequestOTP}>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all sm:text-sm"
              placeholder="+234 800 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-navy py-3.5 px-4 text-sm font-bold text-white hover:bg-brand-navy/90 hover:-translate-y-0.5 transition-all disabled:opacity-60"
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/auth/login" className="font-medium text-sm text-brand-green hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
