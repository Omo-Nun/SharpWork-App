/** Same-origin path proxied to the Express API by Next.js route handlers. */
export const API_PROXY_PREFIX = '/backend';

const DEFAULT_API_PORT = process.env.API_SERVICE_PORT || process.env.API_PORT || '4000';

/**
 * Base URL for browser fetch calls.
 * Uses direct URL when NEXT_PUBLIC_API_URL is set; otherwise same-origin proxy.
 */
export function getClientApiBaseUrl(): string {
  const direct = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (direct) return direct;
  return API_PROXY_PREFIX;
}

function internalApiHost(): string {
  return (
    process.env.API_INTERNAL_HOST ||
    process.env.API_HOST ||
    (process.env.RAILWAY_ENVIRONMENT ? 'api.railway.internal' : 'localhost')
  );
}

/**
 * Upstream Express API URL for server-side proxying (runtime env on web/admin).
 * Priority: API_URL → internal host convention → localhost.
 */
export function resolveApiUrl(): string {
  const fromEnv = process.env.API_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;

  const host = internalApiHost();
  if (host === 'localhost') {
    return `http://localhost:${DEFAULT_API_PORT}`;
  }

  // Railway private DNS routes to the service port automatically.
  if (host.endsWith('.railway.internal')) {
    return `http://${host}`;
  }

  return `http://${host}:${DEFAULT_API_PORT}`;
}

/** For next.config rewrites (socket.io), evaluated at build time. */
export function resolveApiUrlForBuild(): string {
  return resolveApiUrl();
}
