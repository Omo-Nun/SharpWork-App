import request from 'supertest';
import app from '../app';
import prisma from '../prisma';
import { connectRedis, getRedis } from '../lib/redis';
import { BookingState, Role } from '@prisma/client';
import { createTestUser, deleteTestUsers } from './helpers/testUsers';

describe('Booking chat gating (Phase C)', () => {
  const createdUserIds: string[] = [];

  beforeAll(async () => {
    await connectRedis();
  });

  afterAll(async () => {
    await deleteTestUsers(createdUserIds);
    await getRedis().quit();
    await prisma.$disconnect();
  });

  async function createPaidBooking() {
    const customer = await createTestUser(Role.CUSTOMER);
    const artisan = await createTestUser(Role.ARTISAN);
    createdUserIds.push(customer.userId, artisan.userId);

    const booking = await prisma.booking.create({
      data: {
        customerId: customer.userId,
        artisanId: artisan.userId,
        description: 'Fix leaking kitchen faucet and replace worn washers today',
        price: 15000,
        state: BookingState.PENDING,
        paymentStatus: 'PAID',
      },
    });

    return { customer, artisan, booking };
  }

  it('blocks message history before artisan accepts', async () => {
    const { customer, booking } = await createPaidBooking();

    const res = await request(app)
      .get(`/booking/${booking.id}/messages`)
      .set('Authorization', `Bearer ${customer.accessToken}`);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('CHAT_CLOSED');
  });

  it('allows message history after artisan accepts', async () => {
    const { customer, artisan, booking } = await createPaidBooking();

    await prisma.booking.update({
      where: { id: booking.id },
      data: { state: BookingState.ACCEPTED },
    });

    await prisma.message.create({
      data: {
        bookingId: booking.id,
        senderId: artisan.userId,
        receiverId: customer.userId,
        content: 'On my way shortly.',
      },
    });

    const res = await request(app)
      .get(`/booking/${booking.id}/messages`)
      .set('Authorization', `Bearer ${customer.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].content).toBe('On my way shortly.');
  });

  it('blocks message history after job completion', async () => {
    const { customer, booking } = await createPaidBooking();

    await prisma.booking.update({
      where: { id: booking.id },
      data: { state: BookingState.COMPLETED },
    });

    const res = await request(app)
      .get(`/booking/${booking.id}/messages`)
      .set('Authorization', `Bearer ${customer.accessToken}`);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('CHAT_CLOSED');
  });

  it('includes chatOpen on booking detail', async () => {
    const { customer, booking } = await createPaidBooking();

    const pendingRes = await request(app)
      .get(`/booking/${booking.id}`)
      .set('Authorization', `Bearer ${customer.accessToken}`);
    expect(pendingRes.status).toBe(200);
    expect(pendingRes.body.chatOpen).toBe(false);

    await prisma.booking.update({
      where: { id: booking.id },
      data: { state: BookingState.IN_PROGRESS },
    });

    const activeRes = await request(app)
      .get(`/booking/${booking.id}`)
      .set('Authorization', `Bearer ${customer.accessToken}`);
    expect(activeRes.status).toBe(200);
    expect(activeRes.body.chatOpen).toBe(true);
  });
});
