import { Router, Response } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { validateUuidParam } from '../middleware/validate';
import prisma from '../prisma';
import { BookingState, PaymentStatus, Role } from '@prisma/client';
import { initializeTransaction, verifyTransaction } from '../utils/paystack';
import {
  notifyBookingCreated,
  notifyBookingPaid,
  notifyBookingStateChanged,
} from '../lib/booking-events';
import { isValidBookingTransition } from '../lib/booking-state';
import { releaseEscrowForBooking, releasePartialEscrowForBooking } from '../lib/escrow';
import {
  canCustomerConfirmCompletion,
  canRaiseDispute,
  canReleaseEscrow,
  PARTIAL_RELEASE_PERCENTS,
  canPartialReleaseEscrow,
  type PartialReleasePercent,
} from '../lib/escrow-gating';
import { getPlatformFeePercent, validateArtisanOffersCategories } from '../lib/platformSettings';
import { isChatOpenForBooking } from '../lib/chat-gating';
import { getWebAppUrl } from '../config/env';

type BookingSerializeInput = {
  state: string;
  paymentStatus: string;
  escrowReleased: boolean;
  customerConfirmedAt: Date | null;
  artisanCompletedAt: Date | null;
};

function serializeBooking<T extends BookingSerializeInput>(booking: T) {
  return {
    ...booking,
    chatOpen: isChatOpenForBooking(booking.state),
    canConfirmCompletion: canCustomerConfirmCompletion(booking),
    canDispute: canRaiseDispute(booking),
  };
}

const router = Router();

router.get('/', authenticate, requireRole(['CUSTOMER', 'ARTISAN']), async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user!;

  try {
    const where =
      user.role === Role.CUSTOMER
        ? { customerId: user.userId, deleted_at: null }
        : { artisanId: user.userId, deleted_at: null };

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            customerProfile: { select: { firstName: true, lastName: true } },
          },
        },
        artisan: {
          select: {
            id: true,
            email: true,
            artisanProfile: { select: { firstName: true, lastName: true, skills: true } },
          },
        },
      },
    });

    res.status(200).json(bookings.map((booking) => serializeBooking(booking)));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

router.get('/:id', authenticate, requireRole(['CUSTOMER', 'ARTISAN', 'ADMIN']), validateUuidParam('id'), async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const user = req.user!;

  try {
    const booking = await prisma.booking.findFirst({
      where: { id, deleted_at: null },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            customerProfile: { select: { firstName: true, lastName: true } },
          },
        },
        artisan: {
          select: {
            id: true,
            email: true,
            artisanProfile: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    const isParticipant =
      user.role === Role.ADMIN ||
      booking.customerId === user.userId ||
      booking.artisanId === user.userId;

    if (!isParticipant) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    res.status(200).json(serializeBooking(booking));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

router.get('/:id/messages', authenticate, requireRole(['CUSTOMER', 'ARTISAN']), validateUuidParam('id'), async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const user = req.user!;

  try {
    const booking = await prisma.booking.findFirst({
      where: {
        id,
        deleted_at: null,
        OR: [{ customerId: user.userId }, { artisanId: user.userId }],
      },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    if (!isChatOpenForBooking(booking.state)) {
      res.status(403).json({
        error: 'Chat is only available after the artisan accepts and before job completion.',
        code: 'CHAT_CLOSED',
        chatOpen: false,
      });
      return;
    }

    const messages = await prisma.message.findMany({
      where: { bookingId: id, deleted_at: null },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        senderId: true,
        receiverId: true,
        content: true,
        createdAt: true,
      },
    });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.post('/:id/confirm-completion', authenticate, requireRole(['CUSTOMER']), validateUuidParam('id'), async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const userId = req.user!.userId;

  try {
    const booking = await prisma.booking.findFirst({
      where: { id, customerId: userId, deleted_at: null },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    if (!canCustomerConfirmCompletion(booking)) {
      res.status(400).json({ error: 'This booking cannot be confirmed yet' });
      return;
    }

    if (!(await canReleaseEscrow(booking))) {
      res.status(400).json({ error: 'Escrow cannot be released while a dispute is open' });
      return;
    }

    await releaseEscrowForBooking(id, {
      actorId: userId,
      actorRole: Role.CUSTOMER,
      action: 'CUSTOMER_CONFIRM_RELEASE',
    });

    const updated = await prisma.booking.update({
      where: { id },
      data: { customerConfirmedAt: new Date() },
    });

    res.status(200).json(serializeBooking(updated));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to confirm completion' });
  }
});

router.post('/:id/partial-release/request', authenticate, requireRole(['ARTISAN']), validateUuidParam('id'), async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const userId = req.user!.userId;
  const percent = Number(req.body.percent);

  if (!PARTIAL_RELEASE_PERCENTS.includes(percent as PartialReleasePercent)) {
    res.status(400).json({ error: 'Partial release percent must be 20, 50, or 75' });
    return;
  }

  try {
    const booking = await prisma.booking.findFirst({
      where: { id, artisanId: userId, deleted_at: null },
    });

    if (!booking || booking.escrowReleased || booking.paymentStatus !== PaymentStatus.PAID) {
      res.status(400).json({ error: 'Booking is not eligible for partial release' });
      return;
    }

    if (!['IN_PROGRESS', 'COMPLETED'].includes(booking.state)) {
      res.status(400).json({ error: 'Partial release can only be requested during or after the job' });
      return;
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        pendingPartialPercent: percent,
        partialRequestedAt: new Date(),
      },
    });

    res.status(200).json(serializeBooking(updated));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to request partial release' });
  }
});

router.post('/:id/partial-release/agree', authenticate, requireRole(['CUSTOMER']), validateUuidParam('id'), async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const userId = req.user!.userId;

  try {
    const booking = await prisma.booking.findFirst({
      where: { id, customerId: userId, deleted_at: null },
    });

    if (!booking?.pendingPartialPercent) {
      res.status(400).json({ error: 'No partial release request pending for this booking' });
      return;
    }

    if (!(await canPartialReleaseEscrow(booking))) {
      res.status(400).json({ error: 'Escrow cannot be partially released for this booking' });
      return;
    }

    const result = await releasePartialEscrowForBooking(
      id,
      booking.pendingPartialPercent as PartialReleasePercent,
      { actorId: userId, actorRole: Role.CUSTOMER }
    );

    const updated = await prisma.booking.findUnique({ where: { id } });
    res.status(200).json({ booking: serializeBooking(updated!), partialRelease: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to agree to partial release' });
  }
});

router.post('/:id/dispute', authenticate, requireRole(['CUSTOMER', 'ARTISAN']), validateUuidParam('id'), async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const userId = req.user!.userId;
  const { reason } = req.body;

  if (!reason || typeof reason !== 'string' || reason.trim().length < 10) {
    res.status(400).json({ error: 'A dispute reason of at least 10 characters is required' });
    return;
  }

  try {
    const booking = await prisma.booking.findFirst({
      where: {
        id,
        deleted_at: null,
        OR: [{ customerId: userId }, { artisanId: userId }],
      },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    if (!canRaiseDispute(booking)) {
      res.status(400).json({
        error: 'Disputes can only be raised within 48 hours of artisan marking the job complete, before escrow is released',
      });
      return;
    }

    const existing = await prisma.dispute.findFirst({
      where: {
        bookingId: id,
        deleted_at: null,
        status: { in: ['OPEN', 'UNDER_REVIEW', 'ESCALATED'] },
      },
    });

    if (existing) {
      res.status(400).json({ error: 'An open dispute already exists for this booking' });
      return;
    }

    const dispute = await prisma.dispute.create({
      data: {
        bookingId: id,
        raisedById: userId,
        reason: reason.trim(),
        escrowFrozen: true,
        status: 'OPEN',
      },
    });

    await prisma.escrowAuditLog.create({
      data: {
        bookingId: id,
        actorId: userId,
        actorRole: req.user!.role as Role,
        action: 'DISPUTE_RAISED',
        metadata: { disputeId: dispute.id },
      },
    });

    res.status(201).json(dispute);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create dispute' });
  }
});

router.get('/:id/escrow-audit', authenticate, requireRole(['CUSTOMER', 'ARTISAN', 'ADMIN']), validateUuidParam('id'), async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const user = req.user!;

  try {
    const booking = await prisma.booking.findFirst({ where: { id, deleted_at: null } });
    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    const isParticipant =
      user.role === Role.ADMIN ||
      booking.customerId === user.userId ||
      booking.artisanId === user.userId;

    if (!isParticipant) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const logs = await prisma.escrowAuditLog.findMany({
      where: { bookingId: id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch escrow audit log' });
  }
});

router.post('/', authenticate, requireRole(['CUSTOMER']), async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    artisanId,
    description,
    price,
    scheduledDate,
    scheduledTime,
    serviceAddress,
    latitude,
    longitude,
    categorySlugs,
  } = req.body;
  const customerId = req.user!.userId;

  if (!artisanId || !description || price === undefined) {
    res.status(400).json({ error: 'artisanId, description, and price are required' });
    return;
  }

  if (typeof description !== 'string' || description.length < 20) {
    res.status(400).json({ error: 'Description must be at least 20 characters' });
    return;
  }

  const quotedPrice = Number(price);
  if (!Number.isFinite(quotedPrice) || quotedPrice < 1000) {
    res.status(400).json({ error: 'Agreed quote must be at least ₦1,000' });
    return;
  }

  const slugs = Array.isArray(categorySlugs)
    ? categorySlugs.map((s: unknown) => String(s).trim().toLowerCase()).filter(Boolean)
    : [];

  try {
    const artisan = await prisma.artisanProfile.findFirst({
      where: { userId: artisanId, isVerified: true, deleted_at: null },
    });

    if (!artisan) {
      res.status(400).json({ error: 'Artisan not found or not verified' });
      return;
    }

    const categoryCheck = await validateArtisanOffersCategories(artisan.id, slugs);
    if (!categoryCheck.ok) {
      res.status(400).json({ error: categoryCheck.error });
      return;
    }

    const platformFeePercent = await getPlatformFeePercent();

    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      select: { email: true },
    });

    const booking = await prisma.booking.create({
      data: {
        customerId,
        artisanId,
        state: BookingState.PENDING,
        description,
        price: quotedPrice,
        categorySlugs: slugs,
        platformFeePercent,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        scheduledTime: scheduledTime || null,
        serviceAddress: serviceAddress || null,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        paymentStatus: PaymentStatus.PENDING,
      },
    });

    const payment = await initializeTransaction(
      customer!.email,
      quotedPrice,
      `${getWebAppUrl(req)}/book/payment/callback`,
      { bookingId: booking.id }
    );

    await prisma.booking.update({
      where: { id: booking.id },
      data: { paystackRef: payment.reference },
    });

    notifyBookingCreated(artisanId, {
      id: booking.id,
      description: booking.description,
      price: booking.price,
      state: booking.state,
      paymentStatus: booking.paymentStatus,
    });

    res.status(201).json({
      booking,
      payment: {
        authorization_url: payment.authorization_url,
        reference: payment.reference,
      },
      escrow: {
        heldAmount: quotedPrice,
        platformFeePercent,
        artisanPayoutEstimate: Math.round(quotedPrice * (1 - platformFeePercent / 100) * 100) / 100,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

router.post('/payment/verify', authenticate, requireRole(['CUSTOMER']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { reference } = req.body;
  const userId = req.user!.userId;

  if (!reference) {
    res.status(400).json({ error: 'reference is required' });
    return;
  }

  try {
    const booking = await prisma.booking.findFirst({
      where: { paystackRef: reference, customerId: userId, deleted_at: null },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    if (booking.paymentStatus === PaymentStatus.PAID) {
      res.status(200).json({ booking, alreadyPaid: true });
      return;
    }

    const verification = await verifyTransaction(reference);
    if (!verification.success) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { paymentStatus: PaymentStatus.FAILED },
      });
      res.status(400).json({ error: 'Payment verification failed' });
      return;
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: PaymentStatus.PAID,
        platformFeePercent: booking.platformFeePercent ?? (await getPlatformFeePercent()),
      },
    });

    notifyBookingPaid(updated.artisanId, updated.customerId, {
      id: updated.id,
      state: updated.state,
      paymentStatus: updated.paymentStatus,
      price: updated.price,
    });

    res.status(200).json({ booking: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

router.patch('/:id/state', authenticate, requireRole(['CUSTOMER', 'ARTISAN']), validateUuidParam('id'), async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const { state, rating, comment } = req.body;
  const user = req.user!;

  if (!state || !Object.values(BookingState).includes(state)) {
    res.status(400).json({ error: 'Valid booking state is required' });
    return;
  }

  try {
    const booking = await prisma.booking.findFirst({ where: { id, deleted_at: null } });
    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    if (booking.paymentStatus !== PaymentStatus.PAID && state !== BookingState.PENDING) {
      res.status(400).json({ error: 'Booking must be paid before state changes' });
      return;
    }

    const validTransition = isValidBookingTransition(user.role as Role, user.userId, booking, state as BookingState);

    if (!validTransition) {
      res.status(400).json({ error: `Invalid state transition from ${booking.state} to ${state}` });
      return;
    }

    if (state === BookingState.REVIEWED) {
      const reviewRating = Number(rating);
      if (!Number.isInteger(reviewRating) || reviewRating < 1 || reviewRating > 5) {
        res.status(400).json({ error: 'A rating between 1 and 5 is required to leave a review' });
        return;
      }

      await prisma.review.upsert({
        where: { bookingId: id },
        create: {
          bookingId: id,
          customerId: booking.customerId,
          artisanId: booking.artisanId,
          rating: reviewRating,
          comment: typeof comment === 'string' ? comment.slice(0, 500) : null,
        },
        update: {
          rating: reviewRating,
          comment: typeof comment === 'string' ? comment.slice(0, 500) : null,
        },
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        state,
        ...(state === BookingState.COMPLETED ? { artisanCompletedAt: new Date() } : {}),
      },
    });

    notifyBookingStateChanged(booking.customerId, booking.artisanId, {
      id: updatedBooking.id,
      state: updatedBooking.state,
    });

    res.status(200).json(serializeBooking(updatedBooking));
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

export default router;
