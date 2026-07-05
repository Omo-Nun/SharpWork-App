'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';
import { apiPost, ApiError } from '../../../lib/api';

type Role = 'CUSTOMER' | 'ARTISAN';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'artisan' ? 'ARTISAN' : 'CUSTOMER';
  const nextParam = searchParams.get('next');

  const [role, setRole] = useState<Role>(initialRole);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await apiPost<{ email?: string; phoneNumber?: string }>('/auth/register', {
        firstName,
        lastName,
        email: authMethod === 'email' ? identifier : undefined,
        phoneNumber: authMethod === 'phone' ? identifier : undefined,
        password,
        role,
      });

      if (authMethod === 'email' && result.email) {
        const devVerifyParam = (result as any).devVerificationUrl ? `&devVerificationUrl=${encodeURIComponent((result as any).devVerificationUrl)}` : '';
        const checkEmailUrl = `/auth/check-email?email=${encodeURIComponent(result.email)}${devVerifyParam}${
          nextParam ? `&next=${encodeURIComponent(nextParam)}` : ''
        }`;
        router.push(checkEmailUrl);
      } else if (authMethod === 'phone' && result.phoneNumber) {
        const devOtpParam = (result as any).devOtp ? `&devOtp=${(result as any).devOtp}` : '';
        const verifyPhoneUrl = `/auth/verify-phone?phone=${encodeURIComponent(result.phoneNumber)}${devOtpParam}${
          nextParam ? `&next=${encodeURIComponent(nextParam)}` : ''
        }`;
        router.push(verifyPhoneUrl);
      } else {
        router.push(`/auth/login${nextParam ? `?next=${encodeURIComponent(nextParam)}` : ''}`);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6 py-12">
      <div className="w-full max-w-lg bg-white p-8 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/10 rounded-bl-full -z-10 blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-orange/10 rounded-tr-full -z-10 blur-xl"></div>

        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black text-brand-green tracking-tighter hover:opacity-80 transition-opacity">
            SharpWork
          </Link>
          <h1 className="text-2xl font-bold mt-6 text-brand-navy">Create an Account</h1>
          <p className="text-gray-500 mt-2">Join the ultimate artisan marketplace</p>
        </div>

        <div className="flex gap-4 mb-8">
          <button
            type="button"
            onClick={() => setRole('CUSTOMER')}
            className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all ${
              role === 'CUSTOMER'
                ? 'border-brand-green bg-brand-green/5 text-brand-green'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            I am a Customer
          </button>
          <button
            type="button"
            onClick={() => setRole('ARTISAN')}
            className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all ${
              role === 'ARTISAN'
                ? 'border-brand-green bg-brand-green/5 text-brand-green'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            I am an Artisan
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
            <button
              type="button"
              onClick={() => { setAuthMethod('email'); setIdentifier(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                authMethod === 'email' ? 'bg-white text-brand-green shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Use Email
            </button>
            <button
              type="button"
              onClick={() => { setAuthMethod('phone'); setIdentifier(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                authMethod === 'phone' ? 'bg-white text-brand-green shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Use Phone Number
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {authMethod === 'email' ? 'Email Address' : 'Phone Number'}
            </label>
            <input
              type={authMethod === 'email' ? 'email' : 'tel'}
              required
              autoComplete={authMethod === 'email' ? 'email' : 'tel'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={authMethod === 'email' ? 'you@example.com' : '+234 800 000 0000'}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
            />
          </div>

          <p className="text-sm text-gray-500">
            We will send a verification code to your {authMethod === 'email' ? 'email' : 'phone number'} before you can log in.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-green text-white py-3.5 rounded-xl font-bold text-lg hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center text-gray-500">
          Already have an account?{' '}
          <Link
            href={`/auth/login${nextParam ? `?next=${encodeURIComponent(nextParam)}` : ''}`}
            className="text-brand-green font-bold hover:underline"
          >
            Log In
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <RegisterForm />
    </Suspense>
  );
}
