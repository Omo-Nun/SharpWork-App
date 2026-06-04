import prisma from '../prisma';
import { DisputeStatus } from '@prisma/client';

export const DISPUTE_WINDOW_MS = 48 * 60 * 60 * 1000;
export const PARTIAL_RELEASE_PERCENTS = [20, 50, 75] as const;
export type PartialReleasePercent = (typeof PARTIAL_RELEASE_PERCENTS)[number];

export async function hasOpenDispute(bookingId: string): Promise<boolean> {
  const count = await prisma.dispute.count({
    where: {
      bookingId,
      deleted_at: null,
      status: { in: [DisputeStatus.OPEN, DisputeStatus.UNDER_REVIEW, DisputeStatus.ESCALATED] },
    },
  });
  return count > 0;
}

export function is48hElapsed(artisanCompletedAt: Date | null | undefined): boolean {
  if (!artisanCompletedAt) return false;
  return Date.now() - artisanCompletedAt.getTime() >= DISPUTE_WINDOW_MS;
}

export function isWithinDisputeWindow(artisanCompletedAt: Date | null | undefined): boolean {
  if (!artisanCompletedAt) return false;
  return Date.now() - artisanCompletedAt.getTime() < DISPUTE_WINDOW_MS;
}

export function canRaiseDispute(booking: {
  state: string;
  escrowReleased: boolean;
  artisanCompletedAt: Date | null;
}): boolean {
  return (
    booking.state === 'COMPLETED' &&
    !booking.escrowReleased &&
    Boolean(booking.artisanCompletedAt) &&
    isWithinDisputeWindow(booking.artisanCompletedAt)
  );
}

export function canCustomerConfirmCompletion(booking: {
  state: string;
  paymentStatus: string;
  escrowReleased: boolean;
  customerConfirmedAt: Date | null;
}): boolean {
  return (
    booking.state === 'COMPLETED' &&
    booking.paymentStatus === 'PAID' &&
    !booking.escrowReleased &&
    !booking.customerConfirmedAt
  );
}

export async function canPartialReleaseEscrow(booking: {
  id: string;
  state: string;
  paymentStatus: string;
  escrowReleased: boolean;
}): Promise<boolean> {
  if (booking.paymentStatus !== 'PAID' || booking.escrowReleased) return false;
  if (!['IN_PROGRESS', 'COMPLETED'].includes(booking.state)) return false;
  if (await hasOpenDispute(booking.id)) return false;
  return true;
}

export async function canReleaseEscrow(booking: {
  id: string;
  state: string;
  paymentStatus: string;
  escrowReleased: boolean;
}): Promise<boolean> {
  if (booking.paymentStatus !== 'PAID' || booking.escrowReleased) return false;
  if (booking.state !== 'COMPLETED') return false;
  if (await hasOpenDispute(booking.id)) return false;
  return true;
}

export async function canAdminReleaseEscrow(booking: {
  id: string;
  state: string;
  paymentStatus: string;
  escrowReleased: boolean;
}): Promise<boolean> {
  return canReleaseEscrow(booking);
}

export async function canAdmin48hRelease(booking: {
  id: string;
  state: string;
  paymentStatus: string;
  escrowReleased: boolean;
  customerConfirmedAt: Date | null;
  artisanCompletedAt: Date | null;
}): Promise<boolean> {
  if (!(await canReleaseEscrow(booking))) return false;
  if (booking.customerConfirmedAt) return false;
  return is48hElapsed(booking.artisanCompletedAt);
}
