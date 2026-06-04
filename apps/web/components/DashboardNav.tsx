'use client';

import Link from 'next/link';
import { getUserInitials, useAuth } from '../context/AuthContext';

interface DashboardNavProps {
  variant: 'customer' | 'artisan';
}

export function DashboardNav({ variant }: DashboardNavProps) {
  const { user, logout } = useAuth();
  const initials = getUserInitials(user);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-black text-brand-navy tracking-tighter">
          Sharp<span className="text-brand-green">Work</span>
          {variant === 'artisan' && (
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-2">Artisan</span>
          )}
        </Link>

        <div className="flex items-center space-x-4">
          <Link href="/settings" className="text-gray-500 hover:text-brand-navy transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>

          <button
            type="button"
            onClick={() => logout()}
            className="text-sm font-medium text-gray-500 hover:text-brand-navy transition-colors"
          >
            Log out
          </button>

          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-navy to-brand-green p-0.5">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-sm font-bold text-brand-navy border-2 border-white">
              {initials}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
