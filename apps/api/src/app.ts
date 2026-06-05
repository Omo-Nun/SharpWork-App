import express from 'express';
import path from 'path';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth';
import artisanRouter from './routes/artisan';
import bookingRouter from './routes/booking';
import searchRouter from './routes/search';
import categoriesRouter from './routes/categories';
import adminRouter from './routes/admin';
import moderationRouter from './routes/moderation';
import webhooksRouter from './routes/webhooks';
import { initSocketIO } from './socket';
import prisma from './prisma';
import { pingRedis, isRedisEnabled } from './lib/redis';
import { initSentry, Sentry } from './lib/sentry';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

dotenv.config();
initSentry();

export const app = express();
export const httpServer = createServer(app);

initSocketIO(httpServer);

app.use(cors({ origin: true, credentials: true }));
app.use('/webhooks', express.raw({ type: 'application/json' }), webhooksRouter);
app.use(express.json({ limit: '6mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/auth', authRouter);
app.use('/artisan', artisanRouter);
app.use('/booking', bookingRouter);
app.use('/search', searchRouter);
app.use('/categories', categoriesRouter);
app.use('/admin', adminRouter);
app.use('/moderation', moderationRouter);

app.get('/health', async (_req, res) => {
  let dbOk = false;
  let redisOk = false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {
    dbOk = false;
  }

  redisOk = isRedisEnabled() ? await pingRedis() : false;

  const ok = dbOk;
  const redisRequired = isRedisEnabled();
  const status = !dbOk ? 'error' : redisRequired && !redisOk ? 'degraded' : 'ok';

  res.status(ok ? 200 : 503).json({
    status,
    service: 'SharpWork API',
    checks: { database: dbOk, redis: redisOk, redisConfigured: redisRequired },
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
