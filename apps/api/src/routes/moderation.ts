import { Router, Response } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { sanitizeString } from '../middleware/validate';
import prisma from '../prisma';

const router = Router();

router.post('/report', authenticate, requireRole(['CUSTOMER', 'ARTISAN']), async (req: AuthRequest, res: Response): Promise<void> => {
  const reporterId = req.user!.userId;
  const { targetUserId, reason } = req.body;

  const cleanReason = sanitizeString(reason, 1000);
  if (!targetUserId || !cleanReason) {
    res.status(400).json({ error: 'targetUserId and reason are required' });
    return;
  }

  if (targetUserId === reporterId) {
    res.status(400).json({ error: 'You cannot report yourself' });
    return;
  }

  try {
    const report = await prisma.moderationReport.create({
      data: {
        reporterId,
        targetUserId,
        reason: cleanReason,
        type: 'REPORT',
      },
    });

    res.status(201).json({ message: 'Report submitted. Our team will review it.', id: report.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

router.post('/block', authenticate, requireRole(['CUSTOMER', 'ARTISAN']), async (req: AuthRequest, res: Response): Promise<void> => {
  const reporterId = req.user!.userId;
  const { targetUserId, reason } = req.body;

  const cleanReason = sanitizeString(reason || 'Blocked by user', 1000);
  if (!targetUserId) {
    res.status(400).json({ error: 'targetUserId is required' });
    return;
  }

  if (targetUserId === reporterId) {
    res.status(400).json({ error: 'You cannot block yourself' });
    return;
  }

  try {
    await prisma.moderationReport.create({
      data: {
        reporterId,
        targetUserId,
        reason: cleanReason!,
        type: 'BLOCK',
      },
    });

    res.status(201).json({ message: 'User blocked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to block user' });
  }
});

router.get('/blocked', authenticate, requireRole(['CUSTOMER', 'ARTISAN']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const blocked = await prisma.moderationReport.findMany({
      where: { reporterId: req.user!.userId, type: 'BLOCK', deleted_at: null },
      select: { targetUserId: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(blocked);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blocked users' });
  }
});

export default router;
