'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';
import { apiPost, ApiError } from '../../../lib/api';
import { Logo } from '../../../components/Logo';

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
    <main className="min-h-screen flex items-center justify-center bg-gray-50/50 p-6 py-12 relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute top-0 w-full h-[400px] bg-gradient-to-b from-brand-navy/[0.03] to-transparent -z-10" />
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-[#1ECE25]/5 rounded-bl-full -z-10 blur-[120px]"></div>
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-brand-navy/5 rounded-tr-full -z-10 blur-[120px]"></div>

      <div className="w-full max-w-[480px] bg-white p-10 rounded-[2rem] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-gray-100/80 relative">
        <div className="flex flex-col items-center text-center mb-10">
          <Link href="/" className="mb-8 hover:scale-105 transition-transform duration-300">
            <Logo height={28} />
          </Link>
          <h1 className="text-[28px] font-black tracking-tight text-brand-navy">Create an Account</h1>
          <p className="text-gray-500 font-medium mt-1">Join the ultimate artisan marketplace</p>
        </div>

        {/* Artisan/Customer Toggle (Segmented Control style) */}
        <div className="flex bg-gray-50/80 p-1.5 rounded-2xl mb-8 border border-gray-100 relative">
          <div className="absolute inset-y-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out" style={{ left: role === 'CUSTOMER' ? '6px' : 'calc(50%)' }} />
          <button
            type="button"
            onClick={() => setRole('CUSTOMER')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-colors duration-300 relative z-10 ${
              role === 'CUSTOMER' ? 'text-brand-navy' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            I'm a Customer
          </button>
          <button
            type="button"
            onClick={() => setRole('ARTISAN')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-colors duration-300 relative z-10 ${
              role === 'ARTISAN' ? 'text-brand-navy' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            I'm an Artisan
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
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="w-full px-4 py-3.5 bg-gray-50/50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1ECE25]/50 focus:border-[#1ECE25] focus:bg-white transition-all text-brand-navy font-medium placeholder:font-normal"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="w-full px-4 py-3.5 bg-gray-50/50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1ECE25]/50 focus:border-[#1ECE25] focus:bg-white transition-all text-brand-navy font-medium placeholder:font-normal"
              />
            </div>
          </div>

          <div className="flex bg-gray-50/80 p-1.5 rounded-2xl mb-4 border border-gray-100">
            <button
              type="button"
              onClick={() => { setAuthMethod('email'); setIdentifier(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all duration-300 ${
                authMethod === 'email' ? 'bg-white text-brand-navy shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
              }`}
            >
              Use Email
            </button>
            <button
              type="button"
              onClick={() => { setAuthMethod('phone'); setIdentifier(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all duration-300 ${
                authMethod === 'phone' ? 'bg-white text-brand-navy shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
              }`}
            >
              Use Phone Number
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              {authMethod === 'email' ? 'Email Address' : 'Phone Number'}
            </label>
            <input
              type={authMethod === 'email' ? 'email' : 'tel'}
              required
              autoComplete={authMethod === 'email' ? 'email' : 'tel'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={authMethod === 'email' ? 'you@example.com' : '+234 800 000 0000'}
              className="w-full px-4 py-3.5 bg-gray-50/50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1ECE25]/50 focus:border-[#1ECE25] focus:bg-white transition-all text-brand-navy font-medium placeholder:font-normal"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full px-4 py-3.5 bg-gray-50/50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1ECE25]/50 focus:border-[#1ECE25] focus:bg-white transition-all text-brand-navy font-medium placeholder:font-normal"
            />
          </div>

          <p className="text-xs text-gray-400 font-medium">
            We will send a verification code to your {authMethod === 'email' ? 'email' : 'phone number'} before you can log in.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1ECE25] text-white py-4 rounded-xl font-bold text-[15px] hover:bg-[#1bb822] hover:shadow-[0_8px_20px_rgb(30,206,37,0.25)] transition-all active:scale-[0.98] mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-gray-500">
          Already have an account?{' '}
          <Link
            href={`/auth/login${nextParam ? `?next=${encodeURIComponent(nextParam)}` : ''}`}
            className="text-brand-navy font-black hover:text-[#1ECE25] transition-colors"
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
