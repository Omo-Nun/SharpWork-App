import request from 'supertest';
import app from '../app';
import prisma from '../prisma';
import { connectRedis, getRedis } from '../lib/redis';
import { Role } from '@prisma/client';
import { createTestUser, deleteTestUsers } from './helpers/testUsers';

describe('Booking creation (Phase B)', () => {
  const createdUserIds: string[] = [];

  beforeAll(async () => {
    await connectRedis();
  });

  afterAll(async () => {
    await deleteTestUsers(createdUserIds);
    await getRedis().quit();
    await prisma.$disconnect();
  });

  it('requires authentication', async () => {
    const res = await request(app).post('/booking').send({
      artisanId: '550e8400-e29b-41d4-a716-446655440000',
      description: 'Need help fixing a leaking pipe under the kitchen sink',
      price: 12000,
    });
    expect(res.status).toBe(401);
  });

  it('rejects quote below minimum', async () => {
    const customer = await createTestUser(Role.CUSTOMER);
    const artisan = await createTestUser(Role.ARTISAN);
    createdUserIds.push(customer.userId, artisan.userId);

    const res = await request(app)
      .post('/booking')
      .set('Authorization', `Bearer ${customer.accessToken}`)
      .send({
        artisanId: artisan.userId,
        description: 'Need help fixing a leaking pipe under the kitchen sink',
        price: 500,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/at least/);
  });

  it('creates booking with category slugs and fee snapshot', async () => {
    const customer = await createTestUser(Role.CUSTOMER);
    const artisan = await createTestUser(Role.ARTISAN);
    createdUserIds.push(customer.userId, artisan.userId);

    const plumbing = await prisma.serviceCategory.findFirst({ where: { slug: 'plumbing' } });
    expect(plumbing).toBeTruthy();

    const profile = await prisma.artisanProfile.findUnique({ where: { userId: artisan.userId } });
    await prisma.artisanServiceCategory.create({
      data: { artisanProfileId: profile!.id, categoryId: plumbing!.id },
    });

    const res = await request(app)
      .post('/booking')
      .set('Authorization', `Bearer ${customer.accessToken}`)
      .send({
        artisanId: artisan.userId,
        description: 'Kitchen sink pipe leaking badly and needs urgent repair work',
        price: 18000,
        categorySlugs: ['plumbing'],
        serviceAddress: '12 Allen Avenue, Ikeja',
        latitude: 6.5244,
        longitude: 3.3792,
      });

    expect(res.status).toBe(201);
    expect(res.body.booking.categorySlugs).toEqual(['plumbing']);
    expect(res.body.booking.platformFeePercent).toBeGreaterThanOrEqual(0);
    expect(res.body.payment.authorization_url).toBeDefined();
    expect(res.body.escrow.heldAmount).toBe(18000);
    expect(res.body.escrow.platformFeePercent).toBe(res.body.booking.platformFeePercent);
  });

  it('rejects categories the artisan does not offer', async () => {
    const customer = await createTestUser(Role.CUSTOMER);
    const artisan = await createTestUser(Role.ARTISAN);
    createdUserIds.push(customer.userId, artisan.userId);

    const res = await request(app)
      .post('/booking')
      .set('Authorization', `Bearer ${customer.accessToken}`)
      .send({
        artisanId: artisan.userId,
        description: 'Need electrical wiring fixed in the living room ceiling area',
        price: 20000,
        categorySlugs: ['electrical'],
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/does not offer/i);
  });
});
