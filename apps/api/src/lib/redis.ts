import Redis from 'ioredis';
import { getRedisUrl, isRedisConfigured } from '../config/env';

let redis: Redis | null = null;
let warnedDisabled = false;

function logRedisDisabled(): void {
  if (warnedDisabled) return;
  warnedDisabled = true;
  console.warn(
    '[redis] Not configured — OTP cooldown, rate limits, and online status use degraded mode. ' +
      'Remove REDIS_URL or add a Railway Redis service when you need caching.'
  );
}

export function isRedisEnabled(): boolean {
  return isRedisConfigured();
}

export function getRedis(): Redis | null {
  if (!isRedisConfigured()) {
    logRedisDisabled();
    return null;
  }

  if (!redis) {
    const url = getRedisUrl()!;
    redis = new Redis(url, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      enableOfflineQueue: false,
      retryStrategy: () => null,
    });
    redis.on('error', (err) => {
      console.warn('[redis]', err.message);
    });
  }

  return redis;
}

export async function connectRedis(): Promise<void> {
  const client = getRedis();
  if (!client) return;
  if (client.status === 'ready') return;
  await client.connect();
}

export async function pingRedis(): Promise<boolean> {
  try {
    const client = getRedis();
    if (!client) return false;
    if (client.status !== 'ready') await client.connect();
    const result = await client.ping();
    return result === 'PONG';
  } catch {
    return false;
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
