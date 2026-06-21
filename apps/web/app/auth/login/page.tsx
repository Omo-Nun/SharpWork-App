'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useEffect, useState } from 'react';
import { apiGet, apiPost, ApiError } from '../../../lib/api';
import { AuthUser, getDashboardPath, useAuth } from '../../../context/AuthContext';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      const nextPath = searchParams.get('next') || searchParams.get('returnUrl');
      if (nextPath && nextPath.startsWith('/')) {
        router.replace(nextPath);
      } else {
        router.replace(getDashboardPath(user.role));
      }
    }
  }, [authLoading, isAuthenticated, user, router, searchParams]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await apiPost<{
        accessToken: string;
        user: { id: string; role: string; email?: string; phoneNumber?: string };
      }>('/auth/login', { identifier, password });

      const fullUser = await apiGet<AuthUser>('/auth/me', result.accessToken);
      login(result.accessToken, fullUser);

      const nextPath = searchParams.get('next') || searchParams.get('returnUrl');
      if (nextPath && nextPath.startsWith('/')) {
        router.push(nextPath);
      } else {
        router.push(getDashboardPath(fullUser.role));
      }
    } catch (err) {
      if (err instanceof ApiError && err.code === 'EMAIL_NOT_VERIFIED') {
        const unverifiedEmail = typeof err.data?.email === 'string' ? err.data.email : identifier;
        router.push(`/auth/check-email?email=${encodeURIComponent(unverifiedEmail)}`);
        return;
      }
      if (err instanceof ApiError && err.code === 'PHONE_NOT_VERIFIED') {
        const unverifiedPhone = typeof err.data?.phoneNumber === 'string' ? err.data.phoneNumber : identifier;
        router.push(`/auth/verify-phone?phone=${encodeURIComponent(unverifiedPhone)}`);
        return;
      }

      setError(err instanceof ApiError ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-brand-green/30 border-t-brand-green rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black text-brand-green tracking-tighter hover:opacity-80 transition-opacity">
            SharpWork
          </Link>
          <h1 className="text-2xl font-bold mt-6">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Log in to your account</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { setAuthMethod('email'); setIdentifier(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                authMethod === 'email' ? 'bg-white text-brand-green shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => { setAuthMethod('phone'); setIdentifier(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                authMethod === 'phone' ? 'bg-white text-brand-green shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Phone Number
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
            />
          </div>

          <div className="flex justify-end">
            <Link href="/auth/forgot-password" className="text-sm font-medium text-brand-green hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-green text-white py-3.5 rounded-xl font-bold text-lg hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging In...' : 'Log In'}
          </button>
        </form>

        <div className="mt-8 text-center text-gray-500">
          Don&apos;t have an account?{' '}
          <Link
            href={`/auth/register${searchParams.get('next') ? `?next=${encodeURIComponent(searchParams.get('next')!)}&role=customer` : ''}`}
            className="text-brand-green font-bold hover:underline"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <LoginForm />
    </Suspense>
  );
}
