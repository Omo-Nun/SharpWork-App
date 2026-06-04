import request from 'supertest';
import app from '../app';
import prisma from '../prisma';
import { connectRedis, getRedis } from '../lib/redis';

describe('Auth security flows', () => {
  const testPhone = '+2348099900011';

  beforeAll(async () => {
    await connectRedis();
  });

  afterAll(async () => {
    await getRedis().quit();
    await prisma.$disconnect();
  });

  it('POST /auth/forgot-password returns generic success message', async () => {
    const res = await request(app).post('/auth/forgot-password').send({ phoneNumber: testPhone });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/If an account exists/);
  });

  it('POST /auth/reset-password rejects invalid OTP', async () => {
    const res = await request(app)
      .post('/auth/reset-password')
      .send({ phoneNumber: testPhone, otp: '000000', newPassword: 'newpassword123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid or expired OTP/);
  });

  it('GET /health reports database and redis checks', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.checks.database).toBe(true);
    expect(res.body.checks.redis).toBe(true);
  });
});
