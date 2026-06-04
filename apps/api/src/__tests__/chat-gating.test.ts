import { BookingState } from '@prisma/client';
import { isChatOpenForBooking, canTrackJob, CHAT_OPEN_STATES } from '../lib/chat-gating';

describe('Chat gating (Phase C)', () => {
  it('opens chat only after accept through in-progress', () => {
    expect(CHAT_OPEN_STATES).toEqual([BookingState.ACCEPTED, BookingState.IN_PROGRESS]);
    expect(isChatOpenForBooking(BookingState.PENDING)).toBe(false);
    expect(isChatOpenForBooking(BookingState.ACCEPTED)).toBe(true);
    expect(isChatOpenForBooking(BookingState.IN_PROGRESS)).toBe(true);
    expect(isChatOpenForBooking(BookingState.COMPLETED)).toBe(false);
    expect(isChatOpenForBooking(BookingState.REVIEWED)).toBe(false);
  });

  it('allows job tracking while chat is open', () => {
    expect(canTrackJob(BookingState.ACCEPTED)).toBe(true);
    expect(canTrackJob(BookingState.PENDING)).toBe(false);
    expect(canTrackJob(BookingState.COMPLETED)).toBe(false);
  });
});
