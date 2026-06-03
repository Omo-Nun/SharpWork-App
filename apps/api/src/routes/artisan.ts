import { Router, Response } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { verifyNIN, verifyFacialLiveness } from '../utils/smileIdentity';
import prisma from '../prisma';

const router = Router();

// Artisan 4-Step Verification Endpoint
router.post('/verify', authenticate, requireRole(['ARTISAN']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { nin } = req.body;
  const userId = req.user.userId;

  try {
    // Step 1: NIN Verification
    const isNinValid = await verifyNIN(nin);
    if (!isNinValid) {
      res.status(400).json({ error: 'NIN Verification Failed' });
      return;
    }

    // Step 2: Facial Liveness (Mocking file upload for now)
    const livenessResult = await verifyFacialLiveness(Buffer.from('mock_image'));
    if (!livenessResult.success || livenessResult.confidence < 80) {
      res.status(400).json({ error: 'Facial Liveness Verification Failed. Confidence must be > 80%.' });
      return;
    }

    // Update artisan verification status in the database
    // Assuming we update the user or artisan profile. We need to fetch the ArtisanProfile ID.
    const artisanProfile = await prisma.artisanProfile.findUnique({ where: { userId } });
    if (!artisanProfile) {
      res.status(404).json({ error: 'Artisan profile not found' });
      return;
    }

    await prisma.artisanProfile.update({
      where: { id: artisanProfile.id },
      data: { isVerified: true },
    });

    res.status(200).json({ message: 'Artisan verified successfully', confidence: livenessResult.confidence });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error during verification' });
  }
});

export default router;
