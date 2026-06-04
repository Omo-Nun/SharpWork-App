import request from 'supertest';
import app from '../app';
import prisma from '../prisma';
import { connectRedis, getRedis } from '../lib/redis';
import { Role, BookingState } from '@prisma/client';
import { createTestUser, deleteTestUsers, type TestUserContext } from './helpers/testUsers';
import { generateTokens } from '../utils/jwt';

describe('API integration — endpoint coverage', () => {
  const createdUserIds: string[] = [];

  beforeAll(async () => {
    await connectRedis();
  });

  afterAll(async () => {
    await deleteTestUsers(createdUserIds);
    await getRedis().quit();
    await prisma.$disconnect();
  });

  function track(ctx: TestUserContext): TestUserContext {
    createdUserIds.push(ctx.userId);
    return ctx;
  }

  describe('GET /health', () => {
    it('returns ok with database and redis checks', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.checks.database).toBe(true);
      expect(res.body.checks.redis).toBe(true);
    });
  });

  describe('GET /search', () => {
    it('requires lat, lng, and radiusKm', async () => {
      const res = await request(app).get('/search');
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/lat, lng, and radiusKm/);
    });

    it('rejects invalid radius', async () => {
      const res = await request(app).get('/search?lat=6.5&lng=3.3&radiusKm=99');
      expect(res.status).toBe(400);
    });

    it('returns verified artisans within radius', async () => {
      const artisan = track(await createTestUser(Role.ARTISAN, { lat: 6.5244, lng: 3.3792 }));
      const res = await request(app).get('/search?lat=6.5244&lng=3.3792&radiusKm=10&skill=Plumbing');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const match = res.body.find((a: { userId: string }) => a.userId === artisan.userId);
      expect(match).toBeDefined();
    });
  });

  describe('POST /auth/*', () => {
    it('rejects registration with missing fields', async () => {
      const res = await request(app).post('/auth/register').send({ email: 'bad@test.com' });
      expect(res.status).toBe(400);
    });

    it('rejects login for unverified email', async () => {
      const suffix = Date.now();
      await request(app).post('/auth/register').send({
        email: `unverified-${suffix}@sharpwork.test`,
        password: 'password123',
        phoneNumber: `+2348098${String(suffix).slice(-6)}`,
        role: 'CUSTOMER',
        firstName: 'Un',
        lastName: 'Verified',
      });

      const res = await request(app).post('/auth/login').send({
        email: `unverified-${suffix}@sharpwork.test`,
        password: 'password123',
      });
      expect(res.status).toBe(403);
      createdUserIds.push(
        (await prisma.user.findUnique({ where: { email: `unverified-${suffix}@sharpwork.test` } }))!.id
      );
    });
  });

  describe('GET /artisan/public/:userId', () => {
    it('returns public profile for verified artisan', async () => {
      const artisan = track(await createTestUser(Role.ARTISAN));
      const res = await request(app).get(`/artisan/public/${artisan.userId}`);
      expect(res.status).toBe(200);
      expect(res.body.firstName).toBe('Test');
      expect(res.body.isVerified).toBe(true);
    });

    it('returns 404 for unknown artisan', async () => {
      const res = await request(app).get('/artisan/public/550e8400-e29b-41d4-a716-446655440000');
      expect(res.status).toBe(404);
    });
  });

  describe('Booking lifecycle', () => {
    it('runs pending → reviewed with escrow dev payment', async () => {
      const customer = track(await createTestUser(Role.CUSTOMER));
      const artisan = track(await createTestUser(Role.ARTISAN));

      const createRes = await request(app)
        .post('/booking')
        .set('Authorization', `Bearer ${customer.accessToken}`)
        .send({
          artisanId: artisan.userId,
          description: 'Fix leaking kitchen faucet and replace worn washers',
          price: 15000,
          serviceAddress: '12 Allen Avenue, Ikeja',
          latitude: 6.5244,
          longitude: 3.3792,
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body.payment.reference).toBeDefined();
      const bookingId = createRes.body.booking.id;
      const reference = createRes.body.payment.reference;

      const payRes = await request(app)
        .post('/booking/payment/verify')
        .set('Authorization', `Bearer ${customer.accessToken}`)
        .send({ reference });
      expect(payRes.status).toBe(200);
      expect(payRes.body.booking.paymentStatus).toBe('PAID');

      const acceptRes = await request(app)
        .patch(`/booking/${bookingId}/state`)
        .set('Authorization', `Bearer ${artisan.accessToken}`)
        .send({ state: BookingState.ACCEPTED });
      expect(acceptRes.status).toBe(200);

      await request(app)
        .patch(`/booking/${bookingId}/state`)
        .set('Authorization', `Bearer ${artisan.accessToken}`)
        .send({ state: BookingState.IN_PROGRESS })
        .expect(200);

      await request(app)
        .patch(`/booking/${bookingId}/state`)
        .set('Authorization', `Bearer ${artisan.accessToken}`)
        .send({ state: BookingState.COMPLETED })
        .expect(200);

      const confirmRes = await request(app)
        .post(`/booking/${bookingId}/confirm-completion`)
        .set('Authorization', `Bearer ${customer.accessToken}`);
      expect(confirmRes.status).toBe(200);
      expect(confirmRes.body.escrowReleased).toBe(true);
      expect(confirmRes.body.customerConfirmedAt).toBeTruthy();

      const reviewRes = await request(app)
        .patch(`/booking/${bookingId}/state`)
        .set('Authorization', `Bearer ${customer.accessToken}`)
        .send({ state: BookingState.REVIEWED, rating: 5, comment: 'Excellent work' });
      expect(reviewRes.status).toBe(200);
      expect(reviewRes.body.state).toBe('REVIEWED');

      const review = await prisma.review.findUnique({ where: { bookingId } });
      expect(review?.rating).toBe(5);
    });
  });

  describe('POST /moderation/*', () => {
    it('submits report and block actions', async () => {
      const reporter = track(await createTestUser(Role.CUSTOMER));
      const target = track(await createTestUser(Role.ARTISAN));

      const reportRes = await request(app)
        .post('/moderation/report')
        .set('Authorization', `Bearer ${reporter.accessToken}`)
        .send({ targetUserId: target.userId, reason: 'Inappropriate behaviour during job' });
      expect(reportRes.status).toBe(201);

      const blockRes = await request(app)
        .post('/moderation/block')
        .set('Authorization', `Bearer ${reporter.accessToken}`)
        .send({ targetUserId: target.userId });
      expect(blockRes.status).toBe(201);

      const listRes = await request(app)
        .get('/moderation/blocked')
        .set('Authorization', `Bearer ${reporter.accessToken}`);
      expect(listRes.status).toBe(200);
      expect(listRes.body.some((b: { targetUserId: string }) => b.targetUserId === target.userId)).toBe(true);
    });
  });

  describe('GET /admin/*', () => {
    it('returns stats, users, and bookings for admin with TOTP enabled', async () => {
      const admin = track(await createTestUser(Role.ADMIN));

      const statsRes = await request(app)
        .get('/admin/stats')
        .set('Authorization', `Bearer ${admin.accessToken}`);
      expect(statsRes.status).toBe(200);
      expect(statsRes.body.kpis).toHaveProperty('totalUsers');

      const usersRes = await request(app)
        .get('/admin/users')
        .set('Authorization', `Bearer ${admin.accessToken}`);
      expect(usersRes.status).toBe(200);
      expect(Array.isArray(usersRes.body)).toBe(true);

      const bookingsRes = await request(app)
        .get('/admin/bookings')
        .set('Authorization', `Bearer ${admin.accessToken}`);
      expect(bookingsRes.status).toBe(200);
      expect(Array.isArray(bookingsRes.body)).toBe(true);
    });

    it('blocks admin routes without TOTP enabled', async () => {
      const suffix = Date.now();
      const user = await prisma.user.create({
        data: {
          email: `admin-nototp-${suffix}@sharpwork.test`,
          phoneNumber: `+2348097${String(suffix).slice(-6)}`,
          passwordHash: 'hash',
          role: 'ADMIN',
          emailVerifiedAt: new Date(),
        },
      });
      await prisma.adminProfile.create({ data: { userId: user.id, totpEnabled: false } });
      createdUserIds.push(user.id);

      const { accessToken } = generateTokens(user.id, 'ADMIN');
      const res = await request(app).get('/admin/stats').set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(403);
      expect(res.body.code).toBe('ADMIN_TOTP_REQUIRED');
    });
  });

  describe('POST /webhooks/paystack', () => {
    it('accepts charge.success webhook in dev mode', async () => {
      const customer = track(await createTestUser(Role.CUSTOMER));
      const artisan = track(await createTestUser(Role.ARTISAN));

      const booking = await prisma.booking.create({
        data: {
          customerId: customer.userId,
          artisanId: artisan.userId,
          description: 'Webhook test booking for payment confirmation flow',
          price: 5000,
          paystackRef: `sw_webhook_${Date.now()}`,
          paymentStatus: 'PENDING',
        },
      });

      const payload = JSON.stringify({
        event: 'charge.success',
        data: { reference: booking.paystackRef },
      });

      const res = await request(app)
        .post('/webhooks/paystack')
        .set('Content-Type', 'application/json')
        .set('x-paystack-signature', 'dev-signature')
        .send(payload);

      expect(res.status).toBe(200);

      const updated = await prisma.booking.findUnique({ where: { id: booking.id } });
      expect(updated?.paymentStatus).toBe('PAID');
    });

    it('rejects webhook with invalid signature when secret is set', async () => {
      const original = process.env.PAYSTACK_SECRET_KEY;
      process.env.PAYSTACK_SECRET_KEY = 'test_secret_key';

      const res = await request(app)
        .post('/webhooks/paystack')
        .set('Content-Type', 'application/json')
        .set('x-paystack-signature', 'invalid')
        .send('{"event":"charge.success"}');

      process.env.PAYSTACK_SECRET_KEY = original;
      expect(res.status).toBe(401);
    });
  });

  describe('404 handler', () => {
    it('returns friendly not found message', async () => {
      const res = await request(app).get('/does-not-exist');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Resource not found');
    });
  });
});
