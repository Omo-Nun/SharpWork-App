import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { saveTokens, getAccessToken, getRefreshToken, clearTokens } from '../utils/secureStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

export type UserRole = 'CUSTOMER' | 'ARTISAN' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  profile?: {
    firstName: string;
    lastName: string;
  };
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (token: string, refreshToken: string, user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Restore session from SecureStore on mount
  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          const res = await axios.get<AuthUser>(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setState({ user: res.data, token, isLoading: false, isAuthenticated: true });
        } else {
          setState((s) => ({ ...s, isLoading: false }));
        }
      } catch {
        // Token expired or invalid — attempt refresh
        try {
          const refreshToken = await getRefreshToken();
          if (refreshToken) {
            const res = await axios.post<{ accessToken: string; refreshToken: string }>(
              `${API_URL}/api/auth/refresh`,
              {},
              { headers: { Authorization: `Bearer ${refreshToken}` } }
            );
            const newToken = res.data.accessToken;
            const meRes = await axios.get<AuthUser>(`${API_URL}/api/auth/me`, {
              headers: { Authorization: `Bearer ${newToken}` },
            });
            await saveTokens(newToken, res.data.refreshToken || refreshToken);
            setState({ user: meRes.data, token: newToken, isLoading: false, isAuthenticated: true });
          } else {
            setState((s) => ({ ...s, isLoading: false }));
          }
        } catch {
          await clearTokens();
          setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
        }
      }
    })();
  }, []);

  const login = async (token: string, refreshToken: string, user: AuthUser) => {
    await saveTokens(token, refreshToken);
    setState({ user, token, isLoading: false, isAuthenticated: true });
  };

  const logout = async () => {
    try {
      const token = await getAccessToken();
      if (token) {
        await axios.post(`${API_URL}/api/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch { /* ignore logout errors */ }
    await clearTokens();
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
  };

  const setUser = (user: AuthUser) => {
    setState((s) => ({ ...s, user }));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
