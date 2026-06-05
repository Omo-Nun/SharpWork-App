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

const PLACEHOLDER_REDIS_HOST =
  /your-elasticache-host|your-redis-host|elasticache-host|example\.com|changeme|placeholder/i;

function shouldIgnoreRedisUrl(url: string): boolean {
  if (PLACEHOLDER_REDIS_HOST.test(url)) return true;
  if (process.env.RAILWAY_ENVIRONMENT && /localhost|127\.0\.0\.1/.test(url)) {
    return true;
  }
  return false;
}

/** Drop placeholder REDIS_URL before ioredis can read it (Railway Variables tab). */
export function sanitizeRedisEnv(): void {
  const url = process.env.REDIS_URL?.trim();
  if (!url || !shouldIgnoreRedisUrl(url)) return;

  console.warn(
    `[config] Ignoring invalid REDIS_URL="${url}". Delete REDIS_URL on the Railway api service.`
  );
  delete process.env.REDIS_URL;
}

/** True when REDIS_URL points at a real broker (not docs placeholders or localhost on Railway). */
export function isRedisConfigured(): boolean {
  const url = process.env.REDIS_URL?.trim();
  if (!url) return false;
  if (shouldIgnoreRedisUrl(url)) return false;
  return true;
}

export function getRedisUrl(): string | null {
  if (!isRedisConfigured()) return null;
  return process.env.REDIS_URL!.trim();
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function logZeroConfigWarnings(): void {
  const redisUrl = process.env.REDIS_URL?.trim();
  if (redisUrl && !isRedisConfigured()) {
    console.warn(
      `[config] REDIS_URL="${redisUrl}" looks like a placeholder — Redis is disabled. ` +
        'Delete REDIS_URL on the Railway api service (Variables tab).'
    );
  }

  if (process.env.JWT_ACCESS_SECRET && process.env.JWT_REFRESH_SECRET) return;

  console.warn(
    '[config] JWT_ACCESS_SECRET / JWT_REFRESH_SECRET not set — using project-scoped defaults. ' +
      'Set both in production for stronger security.'
  );
}
