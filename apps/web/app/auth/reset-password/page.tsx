'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiPost, ApiError } from '../../../lib/api';

export default function ResetPasswordPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRequestOTP(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const result = await apiPost<{ message: string }>('/auth/forgot-password', {
        phoneNumber: phone,
      });
      setMessage(result.message);
      setStep(2);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  }

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
      window.location.href = '/auth/login';
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 1
              ? "We'll send a 6-digit OTP to your registered phone number via SMS."
              : 'Enter the OTP sent to your phone and choose a new password.'}
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}
        {message && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>
        )}

        {step === 1 ? (
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
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-brand-navy focus:outline-none focus:ring-brand-navy sm:text-sm"
                placeholder="+2348012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-brand-navy py-2 px-4 text-sm font-medium text-white hover:bg-brand-navy/90 disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div className="space-y-4">
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
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-center tracking-widest text-lg font-mono focus:border-brand-navy focus:outline-none focus:ring-brand-navy sm:text-sm"
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
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-navy focus:outline-none focus:ring-brand-navy sm:text-sm"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-brand-orange py-2 px-4 text-sm font-medium text-white hover:bg-brand-orange/90 disabled:opacity-60"
            >
              {loading ? 'Resetting...' : 'Confirm Reset'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm font-medium text-brand-navy hover:underline"
              >
                Didn&apos;t receive code? Try again
              </button>
            </div>
          </form>
        )}

        <div className="text-center mt-4">
          <Link href="/auth/login" className="font-medium text-sm text-brand-navy hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
