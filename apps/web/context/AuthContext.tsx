'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost, ApiError, refreshAccessToken } from '../lib/api';
import {
  clearAccessToken,
  getAccessToken,
  getDashboardPath,
  setAccessToken,
} from '../lib/auth-storage';
import { reconnectSocket } from '../lib/socket';

export type UserRole = 'CUSTOMER' | 'ARTISAN' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  phoneNumber: string;
  emailVerifiedAt: string | null;
  profile: {
    firstName: string;
    lastName: string;
    isVerified?: boolean;
  } | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (accessToken: string, user: AuthUser) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchCurrentUser(token: string): Promise<AuthUser> {
  return apiGet<AuthUser>('/auth/me', token);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    let token = getAccessToken();

    if (!token) {
      try {
        token = await refreshAccessToken();
        setAccessToken(token);
        reconnectSocket();
      } catch {
        setUser(null);
        return null;
      }
    }

    try {
      const currentUser = await fetchCurrentUser(token);
      setUser(currentUser);
      return currentUser;
    } catch (err) {
      if (err instanceof ApiError && err.status === 0) {
        setUser(null);
        return null;
      }
      if (err instanceof ApiError && err.status === 401) {
        try {
          const newToken = await refreshAccessToken();
          setAccessToken(newToken);
          reconnectSocket();
          const currentUser = await fetchCurrentUser(newToken);
          setUser(currentUser);
          return currentUser;
        } catch {
          clearAccessToken();
          setUser(null);
          return null;
        }
      }
      clearAccessToken();
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = useCallback((accessToken: string, nextUser: AuthUser) => {
    setAccessToken(accessToken);
    setUser(nextUser);
    reconnectSocket();
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiPost('/auth/logout', {});
    } catch {
      // Clear local session even if the API call fails.
    }
    clearAccessToken();
    setUser(null);
    router.push('/');
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function getUserInitials(user: AuthUser | null): string {
  if (!user?.profile) return '?';
  return `${user.profile.firstName[0] ?? ''}${user.profile.lastName[0] ?? ''}`.toUpperCase();
}

export function getUserDisplayName(user: AuthUser | null): string {
  if (!user?.profile) return 'there';
  return user.profile.firstName;
}

export { getDashboardPath };
