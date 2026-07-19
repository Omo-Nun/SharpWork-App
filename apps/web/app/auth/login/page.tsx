'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useEffect, useState } from 'react';
import { apiGet, apiPost, ApiError } from '../../../lib/api';
import { AuthUser, getDashboardPath, useAuth } from '../../../context/AuthContext';
import { Logo } from '../../../components/Logo';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Phone passwordless flow states
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');

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
      if (authMethod === 'phone') {
        if (!otpSent) {
          const result = await apiPost<{ message: string; phoneNumber: string; devOtp?: string }>('/auth/passwordless/request', { phoneNumber: identifier });
          setOtpSent(true);
          if (result.devOtp) {
            setDevOtp(result.devOtp);
          }
          setLoading(false);
          return;
        } else {
          const result = await apiPost<{
            accessToken: string;
            user: { id: string; role: string; phoneNumber?: string };
          }>('/auth/passwordless/verify', { phoneNumber: identifier, otp });

          const fullUser = await apiGet<AuthUser>('/auth/me', result.accessToken);
          login(result.accessToken, fullUser);

          const nextPath = searchParams.get('next') || searchParams.get('returnUrl');
          if (nextPath && nextPath.startsWith('/')) {
            router.push(nextPath);
          } else {
            router.push(getDashboardPath(fullUser.role));
          }
        }
      } else {
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
    <main className="min-h-screen flex items-center justify-center bg-gray-50/50 p-6 relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute top-0 w-full h-[400px] bg-gradient-to-b from-brand-navy/[0.03] to-transparent -z-10" />
      <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#1ECE25]/5 blur-[120px] -z-10" />
      <div className="absolute bottom-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-brand-navy/5 blur-[120px] -z-10" />

      <div className="w-full max-w-[420px] bg-white p-10 rounded-[2rem] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-gray-100/80">
        <div className="flex flex-col items-center text-center mb-10">
          <Link href="/" className="mb-8 hover:scale-105 transition-transform duration-300">
            <Logo height={28} />
          </Link>
          <h1 className="text-[28px] font-black tracking-tight text-brand-navy">Welcome Back</h1>
          <p className="text-gray-500 font-medium mt-1">Log in to your account</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="flex bg-gray-50/80 p-1.5 rounded-2xl mb-6 border border-gray-100">
            <button
              type="button"
              onClick={() => { setAuthMethod('email'); setIdentifier(''); setOtpSent(false); setOtp(''); setDevOtp(''); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                authMethod === 'email' ? 'bg-white text-brand-navy shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => { setAuthMethod('phone'); setIdentifier(''); setOtpSent(false); setOtp(''); setDevOtp(''); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                authMethod === 'phone' ? 'bg-white text-brand-navy shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
              }`}
            >
              Phone Number
            </button>
          </div>

          {devOtp && (
            <div className="p-3 bg-emerald-50 rounded-xl text-sm border border-emerald-200 text-center text-emerald-800">
              <span className="font-bold">🛠️ Dev OTP:</span> <code className="bg-emerald-100 px-2 py-1 rounded font-mono text-base font-bold text-emerald-900">{devOtp}</code>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              {authMethod === 'email' ? 'Email Address' : 'Phone Number'}
            </label>
            <input
              type={authMethod === 'email' ? 'email' : 'tel'}
              required
              disabled={authMethod === 'phone' && otpSent}
              autoComplete={authMethod === 'email' ? 'email' : 'tel'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={authMethod === 'email' ? 'you@example.com' : '+234 800 000 0000'}
              className="w-full px-4 py-3.5 bg-gray-50/50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1ECE25]/50 focus:border-[#1ECE25] focus:bg-white transition-all disabled:opacity-60 disabled:bg-gray-100 text-brand-navy font-medium placeholder:font-normal"
            />
          </div>

          {authMethod === 'email' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                <Link href="/auth/forgot-password" className="text-xs font-bold text-gray-400 hover:text-[#1ECE25] transition-colors">
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3.5 bg-gray-50/50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1ECE25]/50 focus:border-[#1ECE25] focus:bg-white transition-all text-brand-navy font-medium placeholder:font-normal"
              />
            </div>
          )}

          {authMethod === 'phone' && otpSent && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Verification Code (OTP)</label>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit code"
                className="w-full px-4 py-3.5 bg-gray-50/50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1ECE25]/50 focus:border-[#1ECE25] focus:bg-white transition-all text-center tracking-widest font-mono text-xl text-brand-navy placeholder:text-gray-300"
                maxLength={6}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1ECE25] text-white py-4 rounded-xl font-bold text-[15px] hover:bg-[#1bb822] hover:shadow-[0_8px_20px_rgb(30,206,37,0.25)] transition-all active:scale-[0.98] mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : (authMethod === 'phone' ? (otpSent ? 'Verify & Log In' : 'Request OTP') : 'Log In')}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-gray-500">
          Don&apos;t have an account?{' '}
          <Link
            href={`/auth/register${searchParams.get('next') ? `?next=${encodeURIComponent(searchParams.get('next')!)}&role=customer` : ''}`}
            className="text-brand-navy font-black hover:text-[#1ECE25] transition-colors"
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
