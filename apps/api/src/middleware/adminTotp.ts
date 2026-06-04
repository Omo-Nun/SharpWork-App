import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import prisma from '../prisma';

export async function requireAdminTotpEnabled(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const adminProfile = await prisma.adminProfile.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!adminProfile?.totpEnabled) {
      res.status(403).json({
        error: 'Admin 2FA must be enabled before accessing this resource.',
        code: 'ADMIN_TOTP_REQUIRED',
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Admin TOTP check error:', error);
    res.status(500).json({ error: 'Failed to verify admin 2FA status' });
  }
}
