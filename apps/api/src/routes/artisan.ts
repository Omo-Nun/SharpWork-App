import { Router, Response } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import {
  verifyNIN,
  verifyFacialLiveness,
  passesConfidenceThreshold,
  runBackgroundCheck,
} from '../utils/smileIdentity';
import { createSubaccount } from '../utils/paystack';
import { uploadArtisanAsset } from '../utils/s3';
import { getSkillTestQuestions, gradeSkillTest, type SkillAnswer } from '../lib/skillTest';
import { syncArtisanCategories, syncArtisanCategoriesByNames, getCategoriesForArtisanProfiles, getCompletedJobsCountForArtisans, getRatingDistribution } from '../lib/categories';
import { setArtisanOnline, getArtisanOnline } from '../utils/availability';
import prisma from '../prisma';
import { VerificationStatus, BookingState, PaymentStatus } from '@prisma/client';
import { requireEmailVerified } from '../middleware/requireEmailVerified';

const router = Router();
const SKILL_OPTIONS = ['Plumbing', 'Electrical', 'Carpentry', 'Cleaning', 'Painting', 'AC Repair'];

async function getProfile(userId: string) {
  return prisma.artisanProfile.findUnique({
    where: { userId },
    include: {
      references: true,
      user: { select: { phoneNumber: true } },
      serviceCategories: {
        include: { category: { select: { id: true, name: true, slug: true, icon: true } } },
      },
    },
  });
}

router.get('/stats', authenticate, requireRole(['ARTISAN']), async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;

  try {
    const [completedBookings, paidBookings, reviews] = await Promise.all([
      prisma.booking.count({
        where: { artisanId: userId, deleted_at: null, state: { in: [BookingState.COMPLETED, BookingState.REVIEWED] } },
      }),
      prisma.booking.findMany({
        where: { artisanId: userId, deleted_at: null, paymentStatus: PaymentStatus.PAID, escrowReleased: true },
        select: { price: true, updatedAt: true },
      }),
      prisma.review.findMany({ where: { artisanId: userId }, select: { rating: true } }),
    ]);

    const totalEarnings = paidBookings.reduce((sum, b) => sum + b.price, 0);
    const averageRating =
      reviews.length > 0 ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : 0;

    const monthMap = new Map<string, number>();
    const now = new Date();
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthMap.set(d.toLocaleString('en-US', { month: 'short' }), 0);
    }

    for (const booking of paidBookings) {
      const label = booking.updatedAt.toLocaleString('en-US', { month: 'short' });
      if (monthMap.has(label)) {
        monthMap.set(label, (monthMap.get(label) || 0) + booking.price);
      }
    }

    const monthlyEarnings = Array.from(monthMap.entries()).map(([month, amount]) => ({ month, amount }));
    const lastMonth = monthlyEarnings[monthlyEarnings.length - 2]?.amount || 0;
    const thisMonth = monthlyEarnings[monthlyEarnings.length - 1]?.amount || 0;
    const growthPercent = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 1000) / 10 : 0;

    res.json({
      totalEarnings,
      completedJobs: completedBookings,
      averageRating,
      reviewCount: reviews.length,
      monthlyEarnings,
      growthPercent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

router.get('/public/:userId', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.params.userId as string;

  try {
    const profile = await prisma.artisanProfile.findFirst({
      where: { userId, deleted_at: null, isVerified: true, verificationStatus: VerificationStatus.APPROVED },
      include: {
        user: { select: { createdAt: true } },
      },
    });

    if (!profile) {
      res.status(404).json({ error: 'Artisan not found' });
      return;
    }

    const categoryMap = await getCategoriesForArtisanProfiles([profile.id]);
    const categories = categoryMap.get(profile.id) || [];

    const completedBookings = await prisma.booking.count({
      where: { artisanId: userId, state: { in: ['COMPLETED', 'REVIEWED'] } },
    });

    const verificationBadges = [];
    if (profile.nin || profile.bvn) verificationBadges.push('identity');
    if (profile.skillTestPassedAt) verificationBadges.push('skills');
    if (profile.backgroundCheckStatus === 'APPROVED') verificationBadges.push('background');
    if (profile.isVerified) verificationBadges.push('references'); // Assuming full verification includes references

    const [reviewsData, ratingDistribution] = await Promise.all([
      prisma.review.findMany({
        where: { artisanId: userId },
        select: { 
          rating: true, 
          comment: true, 
          createdAt: true,
          booking: {
            select: {
              customer: {
                select: {
                  customerProfile: { select: { firstName: true, lastName: true } }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      getRatingDistribution(userId),
    ]);

    const reviews = reviewsData.map(r => ({
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      reviewerName: r.booking?.customer?.customerProfile 
        ? `${r.booking.customer.customerProfile.firstName} ${r.booking.customer.customerProfile.lastName}` 
        : 'A verified customer',
    }));

    const averageRating =
      reviews.length > 0 ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : 0;

    res.json({
      id: profile.id,
      userId: profile.userId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      skills: profile.skills,
      portfolioUrls: profile.portfolioUrls,
      isVerified: profile.isVerified,
      categories,
      averageRating,
      reviewCount: reviews.length,
      reviews,
      completedJobsCount: completedBookings,
      memberSince: profile.user.createdAt,
      verificationBadges,
      responseTimeMinutes: 15, // Stub value until tracked
      ratingDistribution,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

router.get('/me', authenticate, requireRole(['ARTISAN']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await getProfile(req.user!.userId);
    if (!profile || profile.deleted_at) {
      res.status(404).json({ error: 'Artisan profile not found' });
      return;
    }
    const isOnline = await getArtisanOnline(req.user!.userId);
    res.status(200).json({ ...profile, isOnline, skillOptions: SKILL_OPTIONS });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/verification/status', authenticate, requireRole(['ARTISAN']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await getProfile(req.user!.userId);
    if (!profile) {
      res.status(404).json({ error: 'Artisan profile not found' });
      return;
    }
    res.status(200).json({
      verificationStatus: profile.verificationStatus,
      verificationStep: profile.verificationStep,
      isVerified: profile.isVerified,
      rejectionReason: profile.rejectionReason,
      skillTestScore: profile.skillTestScore,
      backgroundCheckStatus: profile.backgroundCheckStatus,
      skillOptions: SKILL_OPTIONS,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/verification/skill-test', authenticate, requireRole(['ARTISAN']), async (req: AuthRequest, res: Response): Promise<void> => {
  const skillsParam = req.query.skills;
  const skills =
    typeof skillsParam === 'string'
      ? skillsParam.split(',').map((s) => s.trim()).filter(Boolean)
      : SKILL_OPTIONS.slice(0, 2);

  res.status(200).json({ questions: getSkillTestQuestions(skills) });
});

router.post('/upload', authenticate, requireRole(['ARTISAN']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { dataBase64, contentType } = req.body;

  if (!dataBase64 || !contentType) {
    res.status(400).json({ error: 'dataBase64 and contentType are required' });
    return;
  }

  try {
    const result = await uploadArtisanAsset(req.user!.userId, String(dataBase64), String(contentType));
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Upload failed' });
  }
});

router.post('/verification/step-1', authenticate, requireRole(['ARTISAN']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { nin, selfieBase64 } = req.body;
  const userId = req.user!.userId;

  if (!nin || typeof nin !== 'string') {
    res.status(400).json({ error: 'NIN is required' });
    return;
  }

  try {
    const profile = await getProfile(userId);
    if (!profile) {
      res.status(404).json({ error: 'Artisan profile not found' });
      return;
    }

    const ninResult = await verifyNIN({
      userId,
      nin,
      firstName: profile.firstName,
      lastName: profile.lastName,
      phoneNumber: profile.user.phoneNumber,
    });

    if (!ninResult.success) {
      res.status(400).json({
        error: 'NIN verification failed',
        resultCode: ninResult.resultCode,
        confidence: ninResult.confidence,
      });
      return;
    }

    const liveness = await verifyFacialLiveness({
      userId,
      jobId: ninResult.jobId,
      selfieBase64,
    });

    if (!liveness.success || !passesConfidenceThreshold(liveness.confidence)) {
      res.status(400).json({ error: 'Facial liveness verification failed. Confidence must be > 80%.' });
      return;
    }

    const combinedConfidence = Math.round((ninResult.confidence + liveness.confidence) / 2);

    await prisma.artisanProfile.update({
      where: { userId },
      data: {
        nin,
        smileJobId: ninResult.jobId,
        verificationScore: combinedConfidence,
        verificationStep: 2,
      },
    });

    res.status(200).json({ message: 'Identity verified', verificationStep: 2, confidence: combinedConfidence });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/verification/step-2', authenticate, requireRole(['ARTISAN']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { skills, portfolioUrls, skillTestAnswers } = req.body;
  const userId = req.user!.userId;

  if (!Array.isArray(skills) || skills.length === 0) {
    res.status(400).json({ error: 'At least one skill is required' });
    return;
  }

  const grade = gradeSkillTest((skillTestAnswers || []) as SkillAnswer[]);
  if (!grade.passed) {
    res.status(400).json({
      error: 'Skill test failed. Score must be at least 80%.',
      score: grade.score,
    });
    return;
  }

  try {
    const profile = await getProfile(userId);
    if (!profile) {
      res.status(404).json({ error: 'Artisan profile not found' });
      return;
    }

    await prisma.artisanProfile.update({
      where: { userId },
      data: {
        skills,
        portfolioUrls: Array.isArray(portfolioUrls) ? portfolioUrls : [],
        skillTestScore: grade.score,
        skillTestPassedAt: new Date(),
        verificationStep: 3,
      },
    });

    const { categoryIds } = req.body;
    if (Array.isArray(categoryIds) && categoryIds.length > 0) {
      await syncArtisanCategories(profile.id, categoryIds as string[]);
    } else {
      await syncArtisanCategoriesByNames(profile.id, skills as string[]);
    }

    res.status(200).json({ message: 'Skills and test passed', verificationStep: 3, score: grade.score });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/verification/step-3', authenticate, requireRole(['ARTISAN']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { consent, bvn } = req.body;
  const userId = req.user!.userId;

  if (consent !== true) {
    res.status(400).json({ error: 'Background check consent is required' });
    return;
  }

  try {
    const profile = await getProfile(userId);
    if (!profile?.nin) {
      res.status(400).json({ error: 'Complete identity verification first' });
      return;
    }

    const check = await runBackgroundCheck({ nin: profile.nin, bvn: typeof bvn === 'string' ? bvn : undefined });
    if (check.status === 'FLAGGED') {
      res.status(400).json({ error: 'Background check flagged this profile for manual review' });
      return;
    }

    await prisma.artisanProfile.update({
      where: { userId },
      data: {
        bvn: typeof bvn === 'string' ? bvn : profile.bvn,
        backgroundConsentAt: new Date(),
        backgroundCheckStatus: check.status,
        verificationStep: 4,
      },
    });
    res.status(200).json({ message: 'Background check complete', verificationStep: 4, status: check.status });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/verification/step-4', authenticate, requireRole(['ARTISAN']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { references, settlementBank, accountNumber } = req.body;
  const userId = req.user!.userId;

  if (!Array.isArray(references) || references.length < 2) {
    res.status(400).json({ error: 'Two client references are required' });
    return;
  }

  if (!settlementBank || !accountNumber) {
    res.status(400).json({ error: 'settlementBank and accountNumber are required for escrow payouts' });
    return;
  }

  try {
    const profile = await prisma.artisanProfile.findUnique({ where: { userId } });
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    const subaccount = await createSubaccount(
      `${profile.firstName} ${profile.lastName}`,
      String(settlementBank),
      String(accountNumber),
      0
    );

    await prisma.$transaction([
      prisma.artisanReference.deleteMany({ where: { artisanProfileId: profile.id } }),
      ...references.map((ref: { fullName: string; phoneNumber: string }) =>
        prisma.artisanReference.create({
          data: {
            artisanProfileId: profile.id,
            fullName: ref.fullName,
            phoneNumber: ref.phoneNumber,
          },
        })
      ),
      prisma.artisanProfile.update({
        where: { userId },
        data: {
          settlementBank: String(settlementBank),
          accountNumber: String(accountNumber),
          paystackSubaccountCode: subaccount.subaccount_code,
          verificationStep: 5,
        },
      }),
    ]);

    res.status(200).json({ message: 'References and payout account saved', verificationStep: 5 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/verification/submit', authenticate, requireRole(['ARTISAN']), requireEmailVerified, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;

  try {
    const profile = await getProfile(userId);
    if (!profile || profile.verificationStep < 5) {
      res.status(400).json({ error: 'Complete all verification steps before submitting' });
      return;
    }

    if (!profile.skillTestPassedAt || profile.backgroundCheckStatus !== 'CLEAR') {
      res.status(400).json({ error: 'Skill test and background check must be complete' });
      return;
    }

    await prisma.artisanProfile.update({
      where: { userId },
      data: { verificationStatus: VerificationStatus.SUBMITTED },
    });

    res.status(200).json({ message: 'Verification submitted for admin review', verificationStatus: 'SUBMITTED' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/categories', authenticate, requireRole(['ARTISAN']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { categoryIds } = req.body;
  const userId = req.user!.userId;

  if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
    res.status(400).json({ error: 'At least one categoryId is required' });
    return;
  }

  try {
    const profile = await prisma.artisanProfile.findUnique({ where: { userId } });
    if (!profile || profile.deleted_at) {
      res.status(404).json({ error: 'Artisan profile not found' });
      return;
    }

    await syncArtisanCategories(profile.id, categoryIds as string[]);
    const categoryMap = await getCategoriesForArtisanProfiles([profile.id]);
    res.status(200).json({ categories: categoryMap.get(profile.id) || [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update categories' });
  }
});

router.patch('/availability', authenticate, requireRole(['ARTISAN']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { isOnline } = req.body;
  const userId = req.user!.userId;

  if (typeof isOnline !== 'boolean') {
    res.status(400).json({ error: 'isOnline must be a boolean' });
    return;
  }

  try {
    const profile = await prisma.artisanProfile.findUnique({ where: { userId } });
    if (!profile || profile.deleted_at) {
      res.status(404).json({ error: 'Artisan profile not found' });
      return;
    }

    if (isOnline && !profile.isVerified) {
      res.status(400).json({ error: 'You must be verified before going online' });
      return;
    }

    await prisma.artisanProfile.update({ where: { userId }, data: { isOnline } });
    await setArtisanOnline(userId, isOnline);
    res.status(200).json({ isOnline });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

router.patch('/location', authenticate, requireRole(['ARTISAN']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { latitude, longitude } = req.body;
  const userId = req.user!.userId;

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    res.status(400).json({ error: 'latitude and longitude are required' });
    return;
  }

  try {
    await prisma.artisanProfile.update({
      where: { userId },
      data: { latitude, longitude },
    });
    res.status(200).json({ latitude, longitude });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update location' });
  }
});

export default router;
