import request from 'supertest';
import app from '../app';
import prisma from '../prisma';
import { connectRedis, getRedis } from '../lib/redis';
import { Role } from '@prisma/client';
import { createTestUser, deleteTestUsers } from './helpers/testUsers';

describe('Service categories (Phase A)', () => {
  const createdUserIds: string[] = [];

  beforeAll(async () => {
    await connectRedis();
  });

  afterAll(async () => {
    await deleteTestUsers(createdUserIds);
    await getRedis().quit();
    await prisma.$disconnect();
  });

  it('GET /categories returns active categories publicly', async () => {
    const res = await request(app).get('/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('slug');
  });

  it('GET /search filters artisans by category slugs with ratings', async () => {
    const artisan = await createTestUser(Role.ARTISAN, { lat: 6.5244, lng: 3.3792 });
    createdUserIds.push(artisan.userId);

    const plumbing = await prisma.serviceCategory.findFirst({ where: { slug: 'plumbing' } });
    expect(plumbing).toBeTruthy();

    const profile = await prisma.artisanProfile.findUnique({ where: { userId: artisan.userId } });
    await prisma.artisanServiceCategory.create({
      data: { artisanProfileId: profile!.id, categoryId: plumbing!.id },
    });

    const res = await request(app).get(
      '/search?lat=6.5244&lng=3.3792&radiusKm=10&categories=plumbing'
    );
    expect(res.status).toBe(200);
    const match = res.body.find((a: { userId: string }) => a.userId === artisan.userId);
    expect(match).toBeDefined();
    expect(match.categories.some((c: { slug: string }) => c.slug === 'plumbing')).toBe(true);
    expect(match).toHaveProperty('averageRating');
    expect(match).toHaveProperty('reviewCount');
  });

  it('admin can create and list categories', async () => {
    const admin = await createTestUser(Role.ADMIN);
    createdUserIds.push(admin.userId);

    const createRes = await request(app)
      .post('/admin/categories')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ name: 'Test Category', description: 'Test', icon: '🧪', sortOrder: 99 });

    expect(createRes.status).toBe(201);
    expect(createRes.body.slug).toBe('test-category');

    const listRes = await request(app)
      .get('/admin/categories')
      .set('Authorization', `Bearer ${admin.accessToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.some((c: { slug: string }) => c.slug === 'test-category')).toBe(true);

    await prisma.serviceCategory.delete({ where: { id: createRes.body.id } }).catch(() => undefined);
  });
});
