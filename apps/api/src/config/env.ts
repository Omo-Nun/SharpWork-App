import type { Request } from 'express';

function trimTrailingSlash(value: string): string {
  return value.replace(/\/$/, '');
}

function railwayPublicUrl(domain: string | undefined): string | undefined {
  if (!domain) return undefined;
  return domain.startsWith('http') ? trimTrailingSlash(domain) : `https://${domain}`;
}

/** Stable JWT material when secrets are not injected (demo / zero-config deploys). */
function derivedSecret(suffix: string): string {
  const project = process.env.RAILWAY_PROJECT_ID || 'sharpwork-local';
  const service = process.env.RAILWAY_SERVICE_ID || 'api';
  return `sharpwork-${project}-${service}-${suffix}`;
}

export function getJwtAccessSecret(): string {
  return process.env.JWT_ACCESS_SECRET || derivedSecret('access');
}

export function getJwtRefreshSecret(): string {
  return process.env.JWT_REFRESH_SECRET || derivedSecret('refresh');
}

export function getApiPublicUrl(): string {
  const explicit = process.env.API_PUBLIC_URL?.trim();
  if (explicit) return trimTrailingSlash(explicit);

  const fromRailway = railwayPublicUrl(process.env.RAILWAY_PUBLIC_DOMAIN);
  if (fromRailway) return fromRailway;

  const port = process.env.PORT || '4000';
  return `http://localhost:${port}`;
}

/**
 * Public web URL for emails and payment redirects.
 * Prefer explicit env, then the browser Origin on the current request.
 */
export function getWebAppUrl(req?: Pick<Request, 'headers'>): string {
  const explicit = process.env.WEB_APP_URL?.trim();
  if (explicit) return trimTrailingSlash(explicit);

  const origin = req?.headers?.origin;
  if (typeof origin === 'string' && origin.startsWith('http')) {
    return trimTrailingSlash(origin);
  }

  const referer = req?.headers?.referer;
  if (typeof referer === 'string') {
    try {
      return trimTrailingSlash(new URL(referer).origin);
    } catch {
      /* ignore invalid referer */
    }
  }

  return 'http://localhost:3002';
}

export function getRedisUrl(): string {
  return process.env.REDIS_URL || 'redis://localhost:6379';
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function logZeroConfigWarnings(): void {
  if (process.env.JWT_ACCESS_SECRET && process.env.JWT_REFRESH_SECRET) return;

  console.warn(
    '[config] JWT_ACCESS_SECRET / JWT_REFRESH_SECRET not set — using project-scoped defaults. ' +
      'Set both in production for stronger security.'
  );
}
