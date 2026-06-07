import request from 'supertest';
import app from '../app';
import prisma from '../prisma';
import { connectRedis, getRedis } from '../lib/redis';
import { createTestUser, deleteTestUsers, TestUserContext } from './helpers/testUsers';


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
  it('POST /auth/push-token registers push token successfully', async () => {
    const user = await createTestUser('CUSTOMER');
    try {
      const res = await request(app)
        .post('/auth/push-token')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send({ pushToken: 'ExponentPushToken[abcdef123456]' });

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/Push token registered successfully/);

      const dbUser = await prisma.user.findUnique({ where: { id: user.userId } });
      expect(dbUser?.expoPushToken).toBe('ExponentPushToken[abcdef123456]');
    } finally {
      await deleteTestUsers([user.userId]);
    }
  });
});
