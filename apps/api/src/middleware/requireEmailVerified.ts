import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import prisma from '../prisma';

export async function requireEmailVerified(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { emailVerifiedAt: true, email: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (!user.emailVerifiedAt) {
      res.status(403).json({
        error: 'Please verify your email before performing this action.',
        code: 'EMAIL_NOT_VERIFIED',
        email: user.email,
      });
      return;
    }

    next();
  } catch (error) {
    console.error('requireEmailVerified error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
