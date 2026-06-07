'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiPost, ApiError } from '../../../lib/api';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialPhone = searchParams.get('phone') || '';
  
  const [phone, setPhone] = useState(initialPhone);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialPhone) {
      setMessage('OTP sent! Please check your messages.');
    }
  }, [initialPhone]);

  async function handleResetPassword(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiPost('/auth/reset-password', {
        phoneNumber: phone,
        otp,
        newPassword,
      });
      router.push('/auth/login?message=Password reset successful');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to reset password.');
    } finally {
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
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the OTP sent to your phone and choose a new password.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}
        {message && !error && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
          <div className="space-y-4">
            {!initialPhone && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="block w-full rounded-md border border-gray-300 px-4 py-3 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all sm:text-sm"
                  placeholder="+234 800 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            )}
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                OTP Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                maxLength={6}
                className="block w-full rounded-md border border-gray-300 px-4 py-3 text-center tracking-widest text-lg font-mono focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all sm:text-sm"
                placeholder="------"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                id="new-password"
                name="password"
                type="password"
                required
                minLength={8}
                className="block w-full rounded-md border border-gray-300 px-4 py-3 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all sm:text-sm"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-orange py-3.5 px-4 text-sm font-bold text-white hover:bg-brand-orange/90 hover:-translate-y-0.5 transition-all disabled:opacity-60"
          >
            {loading ? 'Resetting...' : 'Confirm Reset'}
          </button>

          <div className="text-center mt-4">
            <Link href="/auth/forgot-password" className="text-sm font-medium text-brand-navy hover:underline">
              Didn&apos;t receive code? Try again
            </Link>
          </div>
        </form>

        <div className="text-center mt-4">
          <Link href="/auth/login" className="font-medium text-sm text-brand-green hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
