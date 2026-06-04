const ACCESS_TOKEN_KEY = 'sharpwork_access_token';

export function setAccessToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearAccessToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function getDashboardPath(role: string): string {
  if (role === 'ARTISAN') return '/dashboard/artisan';
  return '/dashboard/customer';
}
