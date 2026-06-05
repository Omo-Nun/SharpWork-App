import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../prisma';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { Role } from '@prisma/client';
import { generateVerificationToken, hashVerificationToken } from '../utils/emailVerification';
import { sendVerificationEmail } from '../utils/email';
import { getWebAppUrl } from '../config/env';
import { authenticate, AuthRequest } from '../middleware/auth';
import { generateOtp } from '../utils/otp';
import { consumeOtp, isOtpOnCooldown, storeOtp } from '../utils/otpStore';
import { sendPasswordResetOtp } from '../utils/termii';
import { setArtisanOnline } from '../utils/availability';
import { verifyTotpToken } from '../utils/totp';
import { REFRESH_COOKIE_OPTIONS } from '../utils/cookies';
import { denyRefreshToken, isRefreshTokenDenied } from '../utils/refreshTokenStore';
import { rateLimit } from '../middleware/rateLimit';

const router = Router();

router.use(rateLimit('auth', 100, 60));
router.post('/register', rateLimit('register', 10, 3600));
router.post('/login', rateLimit('login', 20, 900));
router.post('/forgot-password', rateLimit('forgot-password', 5, 3600));

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_COOLDOWN_MS = 60 * 1000;

function validateRegistrationBody(body: Record<string, unknown>): string | null {
  const { email, password, phoneNumber, role, firstName, lastName } = body;

  if (!email || !password || !phoneNumber || !role || !firstName || !lastName) {
    return 'All fields are required';
  }
  if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    return 'A valid email address is required';
  }
  if (typeof password !== 'string' || password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (typeof phoneNumber !== 'string' || phoneNumber.trim().length < 10) {
    return 'A valid phone number is required';
  }
  if (role !== Role.CUSTOMER && role !== Role.ARTISAN) {
    return 'Role must be CUSTOMER or ARTISAN';
  }
  if (typeof firstName !== 'string' || typeof lastName !== 'string') {
    return 'First and last name are required';
  }

  return null;
}

function normalizePhone(phoneNumber: string): string {
  return phoneNumber.replace(/\s+/g, '');
}

async function createVerificationTokenForUser(userId: string): Promise<string> {
  await prisma.emailVerificationToken.deleteMany({ where: { userId } });

  const { token, tokenHash, expiresAt } = generateVerificationToken();
  await prisma.emailVerificationToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  return token;
}

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const validationError = validateRegistrationBody(req.body);
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }

  const { email, password, phoneNumber, role, firstName, lastName } = req.body;
  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedPhone = normalizePhone(String(phoneNumber));

  try {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email: normalizedEmail }, { phoneNumber: normalizedPhone }] },
    });

    if (existingUser) {
      res.status(400).json({ error: 'User with this email or phone number already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const parsedRole = role as Role;

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        phoneNumber: normalizedPhone,
        passwordHash,
        role: parsedRole,
      },
    });

    if (parsedRole === Role.CUSTOMER) {
      await prisma.customerProfile.create({
        data: { userId: user.id, firstName, lastName },
      });
    } else if (parsedRole === Role.ARTISAN) {
      await prisma.artisanProfile.create({
        data: { userId: user.id, firstName, lastName },
      });
    }

    const verificationToken = await createVerificationTokenForUser(user.id);
    await sendVerificationEmail(normalizedEmail, verificationToken, firstName, getWebAppUrl(req));

    res.status(201).json({
      message: 'Account created. Please check your email to verify your address before logging in.',
      requiresEmailVerification: true,
      email: normalizedEmail,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/verify-email', async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body;

  if (!token || typeof token !== 'string') {
    res.status(400).json({ error: 'Verification token is required' });
    return;
  }

  try {
    const tokenHash = hashVerificationToken(token);
    const record = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!record) {
      res.status(400).json({ error: 'Invalid or expired verification link' });
      return;
    }

    if (record.expiresAt < new Date()) {
      await prisma.emailVerificationToken.delete({ where: { id: record.id } });
      res.status(400).json({ error: 'Verification link has expired. Please request a new one.' });
      return;
    }

    if (record.user.emailVerifiedAt) {
      await prisma.emailVerificationToken.deleteMany({ where: { userId: record.userId } });
      res.status(200).json({ message: 'Email already verified', alreadyVerified: true });
      return;
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { emailVerifiedAt: new Date() },
      }),
      prisma.emailVerificationToken.deleteMany({ where: { userId: record.userId } }),
    ]);

    res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/resend-verification', async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    res.status(400).json({ error: 'A valid email address is required' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        customerProfile: true,
        artisanProfile: true,
        emailVerificationTokens: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!user || user.emailVerifiedAt) {
      res.status(200).json({
        message: 'If an unverified account exists for this email, a new verification link has been sent.',
      });
      return;
    }

    const latestToken = user.emailVerificationTokens[0];
    if (latestToken && Date.now() - latestToken.createdAt.getTime() < RESEND_COOLDOWN_MS) {
      res.status(429).json({ error: 'Please wait a minute before requesting another verification email.' });
      return;
    }

    const firstName =
      user.customerProfile?.firstName ?? user.artisanProfile?.firstName ?? 'there';
    const verificationToken = await createVerificationTokenForUser(user.id);
    await sendVerificationEmail(normalizedEmail, verificationToken, firstName, getWebAppUrl(req));

    res.status(200).json({
      message: 'If an unverified account exists for this email, a new verification link has been sent.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  const { phoneNumber } = req.body;

  if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.trim().length < 10) {
    res.status(400).json({ error: 'A valid phone number is required' });
    return;
  }

  const normalizedPhone = normalizePhone(phoneNumber);

  try {
    const user = await prisma.user.findFirst({
      where: { phoneNumber: normalizedPhone, deleted_at: null },
    });

    if (!user) {
      res.status(200).json({
        message: 'If an account exists for this phone number, a reset code has been sent.',
      });
      return;
    }

    if (await isOtpOnCooldown('password_reset', normalizedPhone)) {
      res.status(429).json({ error: 'Please wait 60 seconds before requesting another code.' });
      return;
    }

    const otp = generateOtp();
    const sent = await sendPasswordResetOtp(normalizedPhone, otp);

    if (!sent) {
      res.status(502).json({ error: 'Failed to send SMS. Please try again later.' });
      return;
    }

    await storeOtp('password_reset', normalizedPhone, otp, user.id);

    res.status(200).json({
      message: 'If an account exists for this phone number, a reset code has been sent.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  const { phoneNumber, otp, newPassword } = req.body;

  if (!phoneNumber || !otp || !newPassword) {
    res.status(400).json({ error: 'Phone number, OTP, and new password are required' });
    return;
  }

  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }

  const normalizedPhone = normalizePhone(String(phoneNumber));

  try {
    const consumed = await consumeOtp('password_reset', normalizedPhone, String(otp));

    if (!consumed) {
      res.status(400).json({ error: 'Invalid or expired OTP' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: consumed.userId },
      data: { passwordHash },
    });

    res.status(200).json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password, totp } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  try {
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user || user.deleted_at || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    if (!user.emailVerifiedAt) {
      res.status(403).json({
        error: 'Please verify your email before logging in.',
        code: 'EMAIL_NOT_VERIFIED',
        email: user.email,
      });
      return;
    }

    if (user.role === 'ADMIN') {
      const adminProfile = await prisma.adminProfile.findUnique({ where: { userId: user.id } });
      if (adminProfile?.totpEnabled && adminProfile.totpSecret) {
        if (!totp) {
          res.status(403).json({ error: 'TOTP code required', code: 'TOTP_REQUIRED' });
          return;
        }
        if (!verifyTotpToken(String(totp), adminProfile.totpSecret)) {
          res.status(401).json({ error: 'Invalid TOTP code', code: 'TOTP_INVALID' });
          return;
        }
      }
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(200).json({ accessToken, user: { id: user.id, role: user.role, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    res.status(401).json({ error: 'No refresh token provided' });
    return;
  }

  if (await isRefreshTokenDenied(refreshToken)) {
    res.status(403).json({ error: 'Refresh token has been revoked' });
    return;
  }

  try {
    const decoded: any = verifyRefreshToken(refreshToken);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId, decoded.role);

    res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: {
        customerProfile: true,
        artisanProfile: true,
      },
    });

    if (!user || user.deleted_at) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const profile = user.customerProfile ?? user.artisanProfile;

    res.status(200).json({
      id: user.id,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      emailVerifiedAt: user.emailVerifiedAt,
      profile: profile
        ? {
            firstName: profile.firstName,
            lastName: profile.lastName,
            ...(user.artisanProfile
              ? {
                  isVerified: user.artisanProfile.isVerified,
                  verificationStatus: user.artisanProfile.verificationStatus,
                }
              : {}),
          }
        : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/account', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const now = new Date();

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { customerProfile: true, artisanProfile: true },
      });

      if (!user || user.deleted_at) {
        throw new Error('NOT_FOUND');
      }

      await tx.user.update({
        where: { id: userId },
        data: { deleted_at: now },
      });

      if (user.customerProfile) {
        await tx.customerProfile.update({
          where: { userId },
          data: { deleted_at: now },
        });
      }

      if (user.artisanProfile) {
        await tx.artisanProfile.update({
          where: { userId },
          data: { deleted_at: now, isOnline: false },
        });
        await setArtisanOnline(userId, false);
      }

      await tx.emailVerificationToken.deleteMany({ where: { userId } });
    });

    res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.cookies;
  if (refreshToken) {
    await denyRefreshToken(refreshToken);
  }

  res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
  res.status(200).json({ message: 'Logged out successfully' });
});

export default router;
