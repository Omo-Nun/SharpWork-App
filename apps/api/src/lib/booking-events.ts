import { emitToBooking, emitToUser } from '../socket';

export function notifyBookingCreated(
  artisanId: string,
  booking: { id: string; description: string; price: number; state: string; paymentStatus: string }
) {
  emitToUser(artisanId, 'booking:created', booking);
}

export function notifyBookingPaid(
  artisanId: string,
  customerId: string,
  booking: { id: string; state: string; paymentStatus: string; price: number }
) {
  emitToUser(artisanId, 'booking:paid', booking);
  emitToUser(customerId, 'booking:paid', booking);
  emitToBooking(booking.id, 'booking:paid', booking);
}

export function notifyBookingStateChanged(
  customerId: string,
  artisanId: string,
  booking: { id: string; state: string }
) {
  const payload = { id: booking.id, state: booking.state };
  emitToUser(customerId, 'booking:state_changed', payload);
  emitToUser(artisanId, 'booking:state_changed', payload);
  emitToBooking(booking.id, 'booking:state_changed', payload);
}
