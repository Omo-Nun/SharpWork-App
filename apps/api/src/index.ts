import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth';
import artisanRouter from './routes/artisan';
import bookingRouter from './routes/booking';
import searchRouter from './routes/search';
import adminRouter from './routes/admin';
import { initSocketIO } from './socket';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4000;

// Initialize Socket.io
initSocketIO(httpServer);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/artisan', artisanRouter);
app.use('/booking', bookingRouter);
app.use('/search', searchRouter);
app.use('/admin', adminRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'SharpWork API' });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} (HTTP + WebSocket)`);
});

