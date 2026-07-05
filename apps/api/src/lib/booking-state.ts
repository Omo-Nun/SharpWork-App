import { BookingState, PaymentStatus, Role } from '@prisma/client';

export function isValidBookingTransition(
  role: Role,
  userId: string,
  booking: {
    customerId: string;
    artisanId: string;
    state: BookingState;
    paymentStatus: PaymentStatus;
    escrowReleased?: boolean;
  },
  nextState: BookingState
): boolean {
  if (booking.paymentStatus !== PaymentStatus.PAID && nextState !== BookingState.PENDING) {
    return false;
  }

  const currentState = booking.state;

  if (role === Role.ARTISAN && booking.artisanId === userId) {
    if (currentState === BookingState.PENDING && nextState === BookingState.ACCEPTED) return true;
    if (currentState === BookingState.ACCEPTED && nextState === BookingState.IN_PROGRESS) return true;
    if (currentState === BookingState.IN_PROGRESS && nextState === BookingState.EN_ROUTE) return true;
    if (currentState === BookingState.EN_ROUTE && nextState === BookingState.ARRIVED) return true;
    // Allow jumping straight to COMPLETED from any of these states, or progression
    if (['IN_PROGRESS', 'EN_ROUTE', 'ARRIVED'].includes(currentState) && nextState === BookingState.COMPLETED) return true;
  }

  if (role === Role.CUSTOMER && booking.customerId === userId) {
    if (currentState === BookingState.COMPLETED && nextState === BookingState.REVIEWED) {
      return booking.escrowReleased === true;
    }
  }

  return false;
}
