import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// NOTE: otplib and qrcode are installed but we use dynamic imports
// because Prisma client needs to be regenerated after db push for Dispute model.
// For now, TOTP logic is scaffolded with placeholder functions.

function generateTOTPSecret(): string {
  // Placeholder — will use: import { authenticator } from 'otplib';
  // return authenticator.generateSecret();
  return 'PLACEHOLDER_TOTP_SECRET_' + Date.now();
}

function verifyTOTPToken(token: string, secret: string): boolean {
  // Placeholder — will use: import { authenticator } from 'otplib';
  // return authenticator.verify({ token, secret });
  return token.length === 6;
}

function generateKeyUri(userId: string, secret: string): string {
  // Placeholder — will use: import { authenticator } from 'otplib';
  // return authenticator.keyuri(userId, 'SharpWork Admin', secret);
  return `otpauth://totp/SharpWork%20Admin:${userId}?secret=${secret}&issuer=SharpWork%20Admin`;
}

/**
 * POST /admin/totp/setup
 * Generate a TOTP secret and QR code for the admin user.
 * Admin-only.
 */
router.post('/totp/setup', authenticate, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const secret = generateTOTPSecret();

    await prisma.adminProfile.update({
      where: { userId },
      data: { totpSecret: secret },
    });

    const otpAuthUrl = generateKeyUri(userId, secret);
    // const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

    res.json({ secret, otpAuthUrl, qrCode: null /* Replace with QRCode.toDataURL when keys are ready */ });
  } catch (error) {
    console.error('TOTP setup error:', error);
    res.status(500).json({ error: 'Failed to setup TOTP' });
  }
});

/**
 * POST /admin/totp/verify
 * Verify a TOTP code for the admin user.
 */
router.post('/totp/verify', authenticate, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { token } = req.body;

    const adminProfile = await prisma.adminProfile.findUnique({
      where: { userId },
    });

    if (!adminProfile?.totpSecret) {
      res.status(400).json({ error: 'TOTP not set up. Call /admin/totp/setup first.' });
      return;
    }

    const isValid = verifyTOTPToken(token, adminProfile.totpSecret);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid TOTP code' });
      return;
    }

    res.json({ verified: true });
  } catch (error) {
    console.error('TOTP verify error:', error);
    res.status(500).json({ error: 'Failed to verify TOTP' });
  }
});

/**
 * GET /admin/disputes
 * List all disputes, optionally filtered by status.
 * Admin-only.
 * NOTE: Uses raw query as a workaround until Prisma client is regenerated with Dispute model.
 */
router.get('/disputes', authenticate, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    let query = `SELECT d.*, b.description as booking_description, b.price as booking_price
                 FROM "Dispute" d
                 JOIN "Booking" b ON d."bookingId" = b.id
                 WHERE d.deleted_at IS NULL`;
    const params: any[] = [];

    if (status) {
      params.push(status);
      query += ` AND d.status = $${params.length}::\"DisputeStatus\"`;
    }

    query += ` ORDER BY d."createdAt" DESC`;

    const disputes = await prisma.$queryRawUnsafe(query, ...params);
    res.json(disputes);
  } catch (error) {
    console.error('List disputes error:', error);
    res.status(500).json({ error: 'Failed to list disputes' });
  }
});

/**
 * PATCH /admin/disputes/:id
 * Update a dispute (change status, add admin notes, freeze/release escrow).
 * Admin-only.
 */
router.patch('/disputes/:id', authenticate, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, escrowFrozen } = req.body;

    const setClauses: string[] = [];
    const params: any[] = [];

    if (status) {
      params.push(status);
      setClauses.push(`status = $${params.length}::"DisputeStatus"`);
    }
    if (adminNotes !== undefined) {
      params.push(adminNotes);
      setClauses.push(`"adminNotes" = $${params.length}`);
    }
    if (escrowFrozen !== undefined) {
      params.push(escrowFrozen);
      setClauses.push(`"escrowFrozen" = $${params.length}`);
    }
    if (status === 'RESOLVED') {
      setClauses.push(`"resolvedAt" = NOW()`);
    }
    setClauses.push(`"updatedAt" = NOW()`);

    params.push(id);
    const query = `UPDATE "Dispute" SET ${setClauses.join(', ')} WHERE id = $${params.length}::uuid RETURNING *`;

    const dispute = await prisma.$queryRawUnsafe(query, ...params);
    res.json(dispute);
  } catch (error) {
    console.error('Update dispute error:', error);
    res.status(500).json({ error: 'Failed to update dispute' });
  }
});

/**
 * POST /admin/disputes
 * Raise a new dispute for a booking (customer or artisan can do this).
 */
router.post('/disputes', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { bookingId, reason } = req.body;

    if (!bookingId || !reason) {
      res.status(400).json({ error: 'bookingId and reason are required' });
      return;
    }

    const dispute = await prisma.$queryRawUnsafe(
      `INSERT INTO "Dispute" (id, "bookingId", "raisedById", reason, "escrowFrozen", status, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1::uuid, $2::uuid, $3, true, 'OPEN', NOW(), NOW())
       RETURNING *`,
      bookingId, userId, reason
    );

    // Freeze the escrow on the booking
    await prisma.booking.update({
      where: { id: bookingId },
      data: { escrowReleased: false },
    });

    res.status(201).json(dispute);
  } catch (error) {
    console.error('Create dispute error:', error);
    res.status(500).json({ error: 'Failed to create dispute' });
  }
});

export default router;
