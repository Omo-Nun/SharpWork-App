import request from 'supertest';
import app from '../app';
import prisma from '../prisma';
import { connectRedis, getRedis } from '../lib/redis';
import { BookingState, Role } from '@prisma/client';
import { createTestUser, deleteTestUsers } from './helpers/testUsers';

describe('Escrow v2 (Phase D/E)', () => {
  const createdUserIds: string[] = [];

  beforeAll(async () => {
    await connectRedis();
  });

  afterAll(async () => {
    await deleteTestUsers(createdUserIds);
    await getRedis().quit();
    await prisma.$disconnect();
  });

  async function paidCompletedBooking() {
    const customer = await createTestUser(Role.CUSTOMER);
    const artisan = await createTestUser(Role.ARTISAN);
    const admin = await createTestUser(Role.ADMIN);
    createdUserIds.push(customer.userId, artisan.userId, admin.userId);

    const booking = await prisma.booking.create({
      data: {
        customerId: customer.userId,
        artisanId: artisan.userId,
        description: 'Replace kitchen faucet and fix leaking pipe under sink',
        price: 20000,
        state: BookingState.COMPLETED,
        paymentStatus: 'PAID',
        platformFeePercent: 15,
        artisanCompletedAt: new Date(),
        paystackRef: `sw_test_${Date.now()}`,
      },
    });

    return { customer, artisan, admin, booking };
  }

  it('customer confirm releases escrow without requiring review', async () => {
    const { customer, booking } = await paidCompletedBooking();

    const res = await request(app)
      .post(`/booking/${booking.id}/confirm-completion`)
      .set('Authorization', `Bearer ${customer.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.escrowReleased).toBe(true);
    expect(res.body.customerConfirmedAt).toBeTruthy();

    const audit = await prisma.escrowAuditLog.findFirst({
      where: { bookingId: booking.id, action: 'CUSTOMER_CONFIRM_RELEASE' },
    });
    expect(audit).toBeTruthy();
  });

  it('blocks dispute outside 48h window', async () => {
    const { customer, booking } = await paidCompletedBooking();
    const oldDate = new Date(Date.now() - 49 * 60 * 60 * 1000);
    await prisma.booking.update({
      where: { id: booking.id },
      data: { artisanCompletedAt: oldDate },
    });

    const res = await request(app)
      .post(`/booking/${booking.id}/dispute`)
      .set('Authorization', `Bearer ${customer.accessToken}`)
      .send({ reason: 'Work was not completed to satisfaction at all' });

    expect(res.status).toBe(400);
  });

  it('allows partial release after customer agrees', async () => {
    const { customer, artisan, booking } = await paidCompletedBooking();
    await prisma.booking.update({
      where: { id: booking.id },
      data: { state: BookingState.IN_PROGRESS },
    });

    await request(app)
      .post(`/booking/${booking.id}/partial-release/request`)
      .set('Authorization', `Bearer ${artisan.accessToken}`)
      .send({ percent: 50 })
      .expect(200);

    const agreeRes = await request(app)
      .post(`/booking/${booking.id}/partial-release/agree`)
      .set('Authorization', `Bearer ${customer.accessToken}`);

    expect(agreeRes.status).toBe(200);
    expect(agreeRes.body.partialRelease.released).toBeGreaterThan(0);
    expect(agreeRes.body.booking.escrowReleasedAmount).toBeGreaterThan(0);
  });

  it('admin can configure platform fee for new bookings', async () => {
    const admin = await createTestUser(Role.ADMIN);
    createdUserIds.push(admin.userId);

    const patchRes = await request(app)
      .patch('/admin/settings/platform')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ platformFeePercent: 12 });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.platformFeePercent).toBe(12);

    const getRes = await request(app)
      .get('/admin/settings/platform')
      .set('Authorization', `Bearer ${admin.accessToken}`);
    expect(getRes.body.platformFeePercent).toBe(12);
  });

  it('admin can release escrow for completed booking', async () => {
    const { admin, booking } = await paidCompletedBooking();

    const res = await request(app)
      .post(`/admin/bookings/${booking.id}/release-escrow`)
      .set('Authorization', `Bearer ${admin.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.escrowReleased).toBe(true);
  });
});
