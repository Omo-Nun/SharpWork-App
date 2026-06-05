import { connectRedis } from './lib/redis';
import { app, httpServer } from './app';
import { logZeroConfigWarnings } from './config/env';

const PORT = process.env.PORT || 4000;

async function start() {
  logZeroConfigWarnings();

  try {
    await connectRedis();
    console.log('Redis connected');
  } catch (error) {
    console.warn('Redis connection failed — OTP and availability caching unavailable:', error);
  }

  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} (HTTP + WebSocket)`);
  });
}

start();

export default app;
