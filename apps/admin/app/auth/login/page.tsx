'use client';

import { useState } from 'react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { ApiError } from '../../../lib/api';

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totp, setTotp] = useState('');
  const [needsTotp, setNeedsTotp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, totp || undefined);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'TOTP_REQUIRED') {
          setNeedsTotp(true);
          setError('Enter your 6-digit authenticator code.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 p-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-navy/50 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-orange/20 rounded-full blur-[100px] -z-10" />

      <div className="w-full max-w-md bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700">
        <div className="text-center mb-8">
          <div className="text-3xl font-black text-white tracking-tighter mb-2">
            SharpWork <span className="text-brand-orange">Admin</span>
          </div>
          <p className="text-slate-400">Secure Portal Login</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sharpwork.com"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </div>

          {(needsTotp || totp) && (
            <div className="pt-4 border-t border-slate-700">
              <label className="block text-sm font-bold text-brand-orange mb-2">Google Authenticator TOTP</label>
              <input
                type="text"
                value={totp}
                onChange={(e) => setTotp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                required={needsTotp}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-center tracking-[0.5em] text-lg font-mono focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-orange text-white py-3.5 rounded-xl font-bold text-lg hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Authenticate'}
          </button>
        </form>
      </div>
    </main>
  );
}
