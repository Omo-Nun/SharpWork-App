import request from 'supertest';
import express from 'express';
import { createServer } from 'http';
import { initSocketIO } from '../socket';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Create a test app instance
const app = express();
const httpServer = createServer(app);

initSocketIO(httpServer);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'SharpWork API' });
});

describe('Health Check API', () => {
  it('should return 200 OK and status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', service: 'SharpWork API' });
  });
});
