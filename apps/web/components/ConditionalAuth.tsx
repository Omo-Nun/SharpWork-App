'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { AuthProvider } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';

const PUBLIC_EXACT = new Set(['/', '/search', '/services', '/about', '/blog', '/contact', '/faq']);

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
  return (
    <AuthProvider>
      <SocketProvider>{children}</SocketProvider>
    </AuthProvider>
  );
}
