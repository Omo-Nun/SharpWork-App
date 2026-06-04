import { Request, Response, NextFunction } from 'express';
import { getRedis } from '../lib/redis';

export function rateLimit(keyPrefix: string, maxRequests: number, windowSeconds: number) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (process.env.NODE_ENV === 'test' || process.env.DISABLE_RATE_LIMIT === 'true') {
      next();
      return;
    }

    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `ratelimit:${keyPrefix}:${ip}`;

    try {
      const redis = getRedis();
      if (redis.status !== 'ready') await redis.connect();

      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, windowSeconds);
      }

      if (count > maxRequests) {
        res.status(429).json({ error: 'Too many requests. Please try again later.' });
        return;
      }

      next();
    } catch (error) {
      console.error('Rate limit error:', error);
      next();
    }
  };
}
