import crypto from 'crypto';
import { getRedis } from '../lib/redis';

const REFRESH_DENY_TTL_SECONDS = 30 * 24 * 60 * 60;

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function denyRefreshToken(token: string): Promise<void> {
  const redis = getRedis();
  if (redis.status !== 'ready') await redis.connect();
  await redis.set(`refresh:deny:${hashToken(token)}`, '1', 'EX', REFRESH_DENY_TTL_SECONDS);
}

export async function isRefreshTokenDenied(token: string): Promise<boolean> {
  try {
    const redis = getRedis();
    if (redis.status !== 'ready') await redis.connect();
    const result = await redis.get(`refresh:deny:${hashToken(token)}`);
    return result === '1';
  } catch {
    return false;
  }
}
