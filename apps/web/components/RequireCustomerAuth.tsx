'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

export function RequireCustomerAuth({ children }: { children: ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isLoading) return;

    const query = searchParams.toString();
    const returnPath = `${pathname}${query ? `?${query}` : ''}`;

    if (!isAuthenticated) {
      router.replace(`/auth/login?next=${encodeURIComponent(returnPath)}`);
      return;
    }

    if (user?.role !== 'CUSTOMER') {
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, user, router, pathname, searchParams]);

  if (isLoading || !isAuthenticated || user?.role !== 'CUSTOMER') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-brand-green/30 border-t-brand-green rounded-full animate-spin" />
      </div>
    );
  }

  return children;
}
