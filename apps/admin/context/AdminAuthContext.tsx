'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiGet, apiPost, ApiError } from '../lib/api';
import { clearAccessToken, getAccessToken, setAccessToken } from '../lib/auth-storage';

interface AdminUser {
  id: string;
  email: string;
  role: string;
}

interface AdminAuthContextValue {
  user: AdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string, totp?: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    clearAccessToken();
    setUser(null);
    router.push('/auth/login');
  }, [router]);

  const login = useCallback(async (email: string, password: string, totp?: string) => {
    const result = await apiPost<{ accessToken: string; user: AdminUser }>('/auth/login', {
      email,
      password,
      ...(totp ? { totp } : {}),
    });

    if (result.user.role !== 'ADMIN') {
      throw new ApiError('Admin access only', 403);
    }

    setAccessToken(result.accessToken);
    setUser(result.user);
    router.push('/');
  }, [router]);

  useEffect(() => {
    if (pathname.startsWith('/auth')) {
      setIsLoading(false);
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      router.replace('/auth/login');
      return;
    }

    apiGet<AdminUser & { profile: unknown }>('/auth/me', token)
      .then((me) => {
        if (me.role !== 'ADMIN') {
          logout();
          return;
        }
        setUser({ id: me.id, email: me.email, role: me.role });
      })
      .catch(() => logout())
      .finally(() => setIsLoading(false));
  }, [pathname, router, logout]);

  const value = useMemo(
    () => ({ user, isLoading, login, logout }),
    [user, isLoading, login, logout]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
