import { Role, Prisma } from '@prisma/client';
import prisma from '../prisma';
import { transferToArtisan, refundTransaction } from '../utils/paystack';
import { PARTIAL_RELEASE_PERCENTS, type PartialReleasePercent } from './escrow-gating';

export function artisanNetTotal(
  grossNaira: number,
  platformFeePercent: number | null | undefined
): number {
  const fee = platformFeePercent ?? 15;
  return Math.round(grossNaira * (1 - fee / 100) * 100) / 100;
}

export function remainingArtisanPayout(
  grossNaira: number,
  platformFeePercent: number | null | undefined,
  releasedAmount: number
): number {
  const net = artisanNetTotal(grossNaira, platformFeePercent);
  return Math.max(0, Math.round((net - releasedAmount) * 100) / 100);
}

async function logEscrowAction(params: {
  bookingId: string;
  action: string;
  amount?: number;
  actorId?: string;
  actorRole?: Role;
  metadata?: Record<string, unknown>;
}) {
  await prisma.escrowAuditLog.create({
    data: {
      bookingId: params.bookingId,
      action: params.action,
      amount: params.amount,
      actorId: params.actorId,
      actorRole: params.actorRole,
      metadata: params.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

async function transferArtisanPayout(
  booking: {
    id: string;
    price: number | null;
    platformFeePercent: number | null;
    escrowReleasedAmount: number;
    artisan: { artisanProfile: { settlementBank: string | null; accountNumber: string | null; firstName: string; lastName: string } | null };
  },
  amountNaira: number,
  referenceSuffix: string
): Promise<number> {
  if (amountNaira <= 0) return 0;

  const profile = booking.artisan.artisanProfile;
  if (!profile?.settlementBank || !profile?.accountNumber) {
    throw new Error('Artisan payout account is not configured');
  }

  await transferToArtisan({
    bankCode: profile.settlementBank,
    accountNumber: profile.accountNumber,
    accountName: `${profile.firstName} ${profile.lastName}`,
    amountNaira,
    reason: `Escrow release for booking ${booking.id}`,
    reference: `escrow_${booking.id}_${referenceSuffix}`,
  });

  return amountNaira;
}

export async function releaseEscrowForBooking(
  bookingId: string,
  options?: {
    actorId?: string;
    actorRole?: Role;
    action?: string;
  }
): Promise<void> {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, deleted_at: null },
    include: { artisan: { include: { artisanProfile: true } } },
  });

  if (!booking || booking.escrowReleased || booking.paymentStatus !== 'PAID') {
    return;
  }

  const remaining = remainingArtisanPayout(
    booking.price ?? 0,
    booking.platformFeePercent,
    booking.escrowReleasedAmount
  );

  if (remaining <= 0) {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { escrowReleased: true },
    });
    return;
  }

  const transferred = await transferArtisanPayout(booking, remaining, 'full');

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      escrowReleasedAmount: booking.escrowReleasedAmount + transferred,
      escrowReleased: true,
    },
  });

  await logEscrowAction({
    bookingId: booking.id,
    action: options?.action ?? 'FULL_RELEASE',
    amount: transferred,
    actorId: options?.actorId,
    actorRole: options?.actorRole,
  });
}

export async function releasePartialEscrowForBooking(
  bookingId: string,
  percent: PartialReleasePercent,
  options: { actorId: string; actorRole: Role }
): Promise<{ released: number; remaining: number }> {
  if (!PARTIAL_RELEASE_PERCENTS.includes(percent)) {
    throw new Error('Partial release must be 20, 50, or 75 percent');
  }

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, deleted_at: null },
    include: { artisan: { include: { artisanProfile: true } } },
  });

  if (!booking || booking.escrowReleased || booking.paymentStatus !== 'PAID') {
    throw new Error('Booking is not eligible for partial release');
  }

  const netTotal = artisanNetTotal(booking.price ?? 0, booking.platformFeePercent);
  const targetRelease = Math.round(netTotal * (percent / 100) * 100) / 100;
  const alreadyReleased = booking.escrowReleasedAmount;
  const amountToRelease = Math.max(0, Math.round((targetRelease - alreadyReleased) * 100) / 100);

  if (amountToRelease <= 0) {
    throw new Error('Partial release amount already satisfied');
  }

  const transferred = await transferArtisanPayout(booking, amountToRelease, `partial_${percent}`);

  const newReleasedAmount = alreadyReleased + transferred;
  const fullyReleased = newReleasedAmount >= netTotal - 0.01;

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      escrowReleasedAmount: newReleasedAmount,
      escrowReleased: fullyReleased,
      pendingPartialPercent: null,
      partialRequestedAt: null,
    },
  });

  await logEscrowAction({
    bookingId: booking.id,
    action: 'PARTIAL_RELEASE',
    amount: transferred,
    actorId: options.actorId,
    actorRole: options.actorRole,
    metadata: { percent },
  });

  return {
    released: transferred,
    remaining: remainingArtisanPayout(booking.price ?? 0, booking.platformFeePercent, newReleasedAmount),
  };
}

export async function refundEscrowForBooking(
  bookingId: string,
  options?: { actorId?: string; actorRole?: Role }
): Promise<void> {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, deleted_at: null },
  });

  if (!booking?.paystackRef) {
    throw new Error('No Paystack reference found for booking');
  }

  await refundTransaction(booking.paystackRef, booking.price ?? undefined);

  await prisma.booking.update({
    where: { id: booking.id },
    data: { escrowReleased: true, paymentStatus: 'FAILED' },
  });

  await logEscrowAction({
    bookingId: booking.id,
    action: 'REFUND',
    amount: booking.price ?? undefined,
    actorId: options?.actorId,
    actorRole: options?.actorRole,
  });
}

// Backward-compatible export used in tests
export function artisanPayoutAmount(grossNaira: number, platformFeePercent?: number | null): number {
  return artisanNetTotal(grossNaira, platformFeePercent);
}
