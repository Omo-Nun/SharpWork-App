import { getRedis } from '../lib/redis';

const ONLINE_KEY_PREFIX = 'artisan:online:';

export function artisanOnlineKey(userId: string): string {
  return `${ONLINE_KEY_PREFIX}${userId}`;
}

export async function setArtisanOnline(userId: string, isOnline: boolean): Promise<void> {
  const redis = getRedis();
  const key = artisanOnlineKey(userId);

  if (isOnline) {
    await redis.set(key, '1');
  } else {
    await redis.del(key);
  }
}

export async function getArtisanOnline(userId: string): Promise<boolean> {
  const redis = getRedis();
  const value = await redis.get(artisanOnlineKey(userId));
  return value === '1';
}

export async function getOnlineArtisanIds(): Promise<string[]> {
  const redis = getRedis();
  const keys = await redis.keys(`${ONLINE_KEY_PREFIX}*`);
  return keys.map((key) => key.replace(ONLINE_KEY_PREFIX, ''));
}
