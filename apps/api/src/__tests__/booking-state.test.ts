import { BookingState, PaymentStatus, Role } from '@prisma/client';
import { isValidBookingTransition } from '../lib/booking-state';

describe('Booking state machine', () => {
  const artisanId = 'artisan-1';
  const customerId = 'customer-1';

  it('allows artisan to accept a paid pending booking', () => {
    expect(
      isValidBookingTransition(Role.ARTISAN, artisanId, {
        artisanId,
        customerId,
        state: BookingState.PENDING,
        paymentStatus: PaymentStatus.PAID,
      }, BookingState.ACCEPTED)
    ).toBe(true);
  });

  it('rejects artisan accept when booking is unpaid', () => {
    expect(
      isValidBookingTransition(Role.ARTISAN, artisanId, {
        artisanId,
        customerId,
        state: BookingState.PENDING,
        paymentStatus: PaymentStatus.PENDING,
      }, BookingState.ACCEPTED)
    ).toBe(false);
  });

  it('allows customer to review after escrow is released', () => {
    expect(
      isValidBookingTransition(Role.CUSTOMER, customerId, {
        artisanId,
        customerId,
        state: BookingState.COMPLETED,
        paymentStatus: PaymentStatus.PAID,
        escrowReleased: true,
      }, BookingState.REVIEWED)
    ).toBe(true);
  });

  it('rejects customer review before escrow release', () => {
    expect(
      isValidBookingTransition(Role.CUSTOMER, customerId, {
        artisanId,
        customerId,
        state: BookingState.COMPLETED,
        paymentStatus: PaymentStatus.PAID,
        escrowReleased: false,
      }, BookingState.REVIEWED)
    ).toBe(false);
  });

  it('rejects invalid artisan skip-ahead transition', () => {
    expect(
      isValidBookingTransition(Role.ARTISAN, artisanId, {
        artisanId,
        customerId,
        state: BookingState.PENDING,
        paymentStatus: PaymentStatus.PAID,
      }, BookingState.COMPLETED)
    ).toBe(false);
  });

  it('allows artisan to start an accepted booking', () => {
    expect(
      isValidBookingTransition(Role.ARTISAN, artisanId, {
        artisanId,
        customerId,
        state: BookingState.ACCEPTED,
        paymentStatus: PaymentStatus.PAID,
      }, BookingState.IN_PROGRESS)
    ).toBe(true);
  });

  it('allows artisan to complete an in-progress booking', () => {
    expect(
      isValidBookingTransition(Role.ARTISAN, artisanId, {
        artisanId,
        customerId,
        state: BookingState.IN_PROGRESS,
        paymentStatus: PaymentStatus.PAID,
      }, BookingState.COMPLETED)
    ).toBe(true);
  });

  it('rejects customer reviewing before completion', () => {
    expect(
      isValidBookingTransition(Role.CUSTOMER, customerId, {
        artisanId,
        customerId,
        state: BookingState.IN_PROGRESS,
        paymentStatus: PaymentStatus.PAID,
      }, BookingState.REVIEWED)
    ).toBe(false);
  });
});
