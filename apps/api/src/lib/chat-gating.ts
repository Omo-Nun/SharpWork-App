import { BookingState } from '@prisma/client';

export const CHAT_OPEN_STATES: BookingState[] = [BookingState.ACCEPTED, BookingState.IN_PROGRESS];

export function isChatOpenForBooking(state: BookingState | string): boolean {
  return CHAT_OPEN_STATES.includes(state as BookingState);
}

export function canTrackJob(state: BookingState | string): boolean {
  return isChatOpenForBooking(state);
}
