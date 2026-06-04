import { Router, Request, Response } from 'express';
import { DisputeStatus, VerificationStatus, BookingState, PaymentStatus, Role } from '@prisma/client';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { requireAdminTotpEnabled } from '../middleware/adminTotp';
import prisma from '../prisma';
import { buildTotpUri, generateTotpSecret, generateTotpQrCode, verifyTotpToken } from '../utils/totp';
import { refundEscrowForBooking, releaseEscrowForBooking } from '../lib/escrow';
import { slugifyCategory } from '../lib/categories';
import { canRaiseDispute, canAdmin48hRelease, canAdminReleaseEscrow } from '../lib/escrow-gating';
import { getPlatformFeePercent, setPlatformFeePercent } from '../lib/platformSettings';

const router = Router();

router.post('/totp/setup', authenticate, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user!.userId;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    const secret = generateTotpSecret();

    await prisma.adminProfile.update({
      where: { userId },
      data: { totpSecret: secret, totpEnabled: false },
    });

    const otpAuthUrl = buildTotpUri(user!.email, secret);
    const qrCode = await generateTotpQrCode(otpAuthUrl);
    res.json({ secret, otpAuthUrl, qrCode });
  } catch (error) {
    console.error('TOTP setup error:', error);
    res.status(500).json({ error: 'Failed to setup TOTP' });
  }
});

router.post('/totp/verify', authenticate, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user!.userId;
    const { token } = req.body;

    const adminProfile = await prisma.adminProfile.findUnique({ where: { userId } });

    if (!adminProfile?.totpSecret) {
      res.status(400).json({ error: 'TOTP not set up. Call /admin/totp/setup first.' });
      return;
    }

    if (!token || !verifyTotpToken(String(token), adminProfile.totpSecret)) {
      res.status(401).json({ error: 'Invalid TOTP code' });
      return;
    }

    await prisma.adminProfile.update({
      where: { userId },
      data: { totpEnabled: true },
    });

    res.json({ verified: true });
  } catch (error) {
    console.error('TOTP verify error:', error);
    res.status(500).json({ error: 'Failed to verify TOTP' });
  }
});

router.post('/disputes', authenticate, requireRole(['CUSTOMER', 'ARTISAN']), async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user!.userId;
    const { bookingId, reason } = req.body;

    if (!bookingId || !reason) {
      res.status(400).json({ error: 'bookingId and reason are required' });
      return;
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
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
        bookingId,
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
        bookingId,
        raisedById: userId,
        reason,
        escrowFrozen: true,
        status: 'OPEN',
      },
    });

    await prisma.booking.update({
      where: { id: bookingId },
      data: { escrowReleased: false },
    });

    await prisma.escrowAuditLog.create({
      data: {
        bookingId,
        actorId: userId,
        actorRole: (req as AuthRequest).user!.role as Role,
        action: 'DISPUTE_RAISED',
        metadata: { disputeId: dispute.id },
      },
    });

    res.status(201).json(dispute);
  } catch (error) {
    console.error('Create dispute error:', error);
    res.status(500).json({ error: 'Failed to create dispute' });
  }
});

router.use(authenticate, requireRole(['ADMIN']), requireAdminTotpEnabled);

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      activeBookings,
      openDisputes,
      escalatedDisputes,
      pendingVerifications,
      escrowHeld,
      recentDisputes,
      recentVerifications,
      recentEscrow,
    ] = await Promise.all([
      prisma.user.count({ where: { deleted_at: null } }),
      prisma.booking.count({
        where: {
          deleted_at: null,
          state: { in: [BookingState.PENDING, BookingState.ACCEPTED, BookingState.IN_PROGRESS] },
        },
      }),
      prisma.dispute.count({ where: { deleted_at: null, status: DisputeStatus.OPEN } }),
      prisma.dispute.count({ where: { deleted_at: null, status: DisputeStatus.ESCALATED } }),
      prisma.artisanProfile.count({
        where: {
          deleted_at: null,
          verificationStatus: { in: [VerificationStatus.SUBMITTED, VerificationStatus.UNDER_REVIEW] },
        },
      }),
      prisma.booking.aggregate({
        where: {
          deleted_at: null,
          paymentStatus: PaymentStatus.PAID,
          escrowReleased: false,
        },
        _sum: { price: true },
        _count: true,
      }),
      prisma.dispute.findMany({
        where: { deleted_at: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          booking: { select: { description: true } },
          raisedBy: { select: { email: true } },
        },
      }),
      prisma.artisanProfile.findMany({
        where: { deleted_at: null, verificationStatus: VerificationStatus.APPROVED },
        orderBy: { id: 'desc' },
        take: 5,
        select: { firstName: true, lastName: true, verificationStatus: true },
      }),
      prisma.booking.findMany({
        where: { deleted_at: null, escrowReleased: true },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: { id: true, price: true, updatedAt: true },
      }),
    ]);

    res.json({
      kpis: {
        totalUsers,
        activeBookings,
        openDisputes,
        escalatedDisputes,
        pendingVerifications,
        escrowHeldAmount: escrowHeld._sum.price || 0,
        escrowHeldCount: escrowHeld._count,
      },
      recentActivity: [
        ...recentDisputes.map((d) => ({
          type: 'dispute' as const,
          id: d.id,
          title: `Dispute raised on ${d.booking.description.slice(0, 40)}`,
          subtitle: d.raisedBy.email,
          status: d.status,
          createdAt: d.createdAt,
        })),
        ...recentVerifications.map((v) => ({
          type: 'verification' as const,
          id: `${v.firstName}-${v.lastName}`,
          title: `${v.firstName} ${v.lastName} verified`,
          subtitle: 'Artisan verification approved',
          status: v.verificationStatus,
          createdAt: new Date().toISOString(),
        })),
        ...recentEscrow.map((b) => ({
          type: 'escrow' as const,
          id: b.id,
          title: `Escrow released for booking ${b.id.slice(0, 8)}`,
          subtitle: `₦${b.price.toLocaleString()}`,
          status: 'RELEASED',
          createdAt: b.updatedAt,
        })),
      ].slice(0, 8),
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

router.get('/disputes', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const disputes = await prisma.dispute.findMany({
      where: {
        deleted_at: null,
        ...(status ? { status: status as DisputeStatus } : {}),
      },
      include: {
        booking: {
          select: {
            id: true,
            description: true,
            price: true,
            customerId: true,
            artisanId: true,
            customer: { select: { email: true } },
            artisan: { select: { email: true } },
          },
        },
        raisedBy: { select: { email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(disputes);
  } catch (error) {
    console.error('List disputes error:', error);
    res.status(500).json({ error: 'Failed to list disputes' });
  }
});

router.patch('/disputes/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status, adminNotes, escrowFrozen, resolution } = req.body;

    const existing = await prisma.dispute.findUnique({
      where: { id },
      include: { booking: true },
    });

    if (!existing) {
      res.status(404).json({ error: 'Dispute not found' });
      return;
    }

    if (status === 'RESOLVED' && resolution === 'refund_customer') {
      await refundEscrowForBooking(existing.bookingId);
    } else if (status === 'RESOLVED' && resolution === 'release_artisan') {
      await releaseEscrowForBooking(existing.bookingId);
    }

    const dispute = await prisma.dispute.update({
      where: { id },
      data: {
        ...(status ? { status: status as DisputeStatus } : {}),
        ...(adminNotes !== undefined ? { adminNotes } : {}),
        ...(escrowFrozen !== undefined ? { escrowFrozen } : {}),
        ...(status === 'RESOLVED' ? { resolvedAt: new Date(), escrowFrozen: false } : {}),
      },
      include: {
        booking: { select: { id: true } },
      },
    });

    res.json(dispute);
  } catch (error) {
    console.error('Update dispute error:', error);
    res.status(500).json({ error: 'Failed to update dispute' });
  }
});

router.get('/verifications', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const artisans = await prisma.artisanProfile.findMany({
      where: {
        deleted_at: null,
        ...(status ? { verificationStatus: status as VerificationStatus } : { verificationStatus: { in: ['SUBMITTED', 'UNDER_REVIEW'] } }),
      },
      include: {
        references: true,
        user: { select: { email: true, phoneNumber: true } },
      },
      orderBy: { id: 'desc' },
    });
    res.json(artisans);
  } catch (error) {
    console.error('List verifications error:', error);
    res.status(500).json({ error: 'Failed to list verifications' });
  }
});

router.patch('/verifications/:userId', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const { action, rejectionReason } = req.body;

    if (!['approve', 'reject', 'review'].includes(action)) {
      res.status(400).json({ error: 'action must be approve, reject, or review' });
      return;
    }

    const data =
      action === 'approve'
        ? { verificationStatus: 'APPROVED' as const, isVerified: true, rejectionReason: null }
        : action === 'reject'
          ? { verificationStatus: 'REJECTED' as const, isVerified: false, rejectionReason: rejectionReason || 'Did not meet requirements' }
          : { verificationStatus: 'UNDER_REVIEW' as const };

    const profile = await prisma.artisanProfile.update({
      where: { userId },
      data,
    });

    res.json(profile);
  } catch (error) {
    console.error('Update verification error:', error);
    res.status(500).json({ error: 'Failed to update verification' });
  }
});

router.get('/users', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { deleted_at: null },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        role: true,
        emailVerifiedAt: true,
        createdAt: true,
        customerProfile: { select: { firstName: true, lastName: true } },
        artisanProfile: { select: { firstName: true, lastName: true, isVerified: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to list users' });
  }
});

router.get('/bookings', async (_req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { deleted_at: null },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        customer: { select: { email: true } },
        artisan: { select: { email: true } },
      },
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to list bookings' });
  }
});

router.get('/bookings/escrow-pending', async (_req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        deleted_at: null,
        paymentStatus: PaymentStatus.PAID,
        escrowReleased: false,
        state: BookingState.COMPLETED,
        customerConfirmedAt: null,
      },
      orderBy: { artisanCompletedAt: 'asc' },
      take: 50,
      include: {
        customer: { select: { email: true, customerProfile: { select: { firstName: true, lastName: true } } } },
        artisan: { select: { email: true, artisanProfile: { select: { firstName: true, lastName: true } } } },
        disputes: { where: { deleted_at: null, status: { in: ['OPEN', 'UNDER_REVIEW', 'ESCALATED'] } } },
      },
    });

    const enriched = await Promise.all(
      bookings.map(async (booking) => ({
        ...booking,
        eligibleFor48hRelease: await canAdmin48hRelease(booking),
        canAdminRelease: await canAdminReleaseEscrow(booking),
      }))
    );

    res.json(enriched);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to list escrow-pending bookings' });
  }
});

router.post('/bookings/:id/release-escrow', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const adminId = (req as AuthRequest).user!.userId;

    const booking = await prisma.booking.findFirst({ where: { id, deleted_at: null } });
    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    if (!(await canAdminReleaseEscrow(booking))) {
      res.status(400).json({ error: 'This booking is not eligible for escrow release' });
      return;
    }

    await releaseEscrowForBooking(id, {
      actorId: adminId,
      actorRole: Role.ADMIN,
      action: 'ADMIN_RELEASE',
    });

    const updated = await prisma.booking.findUnique({ where: { id } });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to release escrow' });
  }
});

router.get('/settings/platform', async (_req: Request, res: Response) => {
  try {
    const platformFeePercent = await getPlatformFeePercent();
    res.json({ platformFeePercent });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load platform settings' });
  }
});

router.patch('/settings/platform', async (req: Request, res: Response) => {
  try {
    const percent = Number(req.body.platformFeePercent);
    const platformFeePercent = await setPlatformFeePercent(percent);
    res.json({ platformFeePercent });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to update platform settings' });
  }
});

router.get('/audit-log', async (req: Request, res: Response) => {
  try {
    const bookingId = typeof req.query.bookingId === 'string' ? req.query.bookingId : undefined;
    const logs = await prisma.escrowAuditLog.findMany({
      where: bookingId ? { bookingId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        booking: { select: { id: true, description: true, price: true } },
      },
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load audit log' });
  }
});

router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.serviceCategory.findMany({
      where: { deleted_at: null },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to list categories' });
  }
});

router.post('/categories', async (req: Request, res: Response) => {
  try {
    const { name, description, icon, sortOrder, isActive } = req.body;
    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'name is required' });
      return;
    }

    const slug = slugifyCategory(name);
    const category = await prisma.serviceCategory.create({
      data: {
        name: name.trim(),
        slug,
        description: typeof description === 'string' ? description.trim() : null,
        icon: typeof icon === 'string' ? icon.trim() : null,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
        isActive: isActive !== false,
      },
    });
    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.patch('/categories/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, description, icon, sortOrder, isActive } = req.body;

    const existing = await prisma.serviceCategory.findFirst({ where: { id, deleted_at: null } });
    if (!existing) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    const category = await prisma.serviceCategory.update({
      where: { id },
      data: {
        ...(typeof name === 'string' ? { name: name.trim(), slug: slugifyCategory(name) } : {}),
        ...(typeof description === 'string' ? { description: description.trim() } : {}),
        ...(typeof icon === 'string' ? { icon: icon.trim() } : {}),
        ...(typeof sortOrder === 'number' ? { sortOrder } : {}),
        ...(typeof isActive === 'boolean' ? { isActive } : {}),
      },
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/categories/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const category = await prisma.serviceCategory.update({
      where: { id },
      data: { isActive: false, deleted_at: new Date() },
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to deactivate category' });
  }
});

export default router;
