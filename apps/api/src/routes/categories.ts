import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { setPublicRlsContext } from '../middleware/rls';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    await setPublicRlsContext();
    const categories = await prisma.serviceCategory.findMany({
      where: { isActive: true, deleted_at: null },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        sortOrder: true,
      },
    });
    res.json(categories);
  } catch (error) {
    console.error('List categories error:', error);
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

export default router;
