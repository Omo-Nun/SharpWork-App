'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { AuthProvider } from '../context/AuthContext';

const PUBLIC_EXACT = new Set(['/', '/search', '/services']);

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true;
  if (/^\/artisan\/[^/]+\/profile$/.test(pathname)) return true;
  return false;
}

export function ConditionalAuth({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (isPublicPath(pathname)) {
    return <>{children}</>;
  }
  return <AuthProvider>{children}</AuthProvider>;
}
