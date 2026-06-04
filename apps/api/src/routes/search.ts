import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { setPublicRlsContext } from '../middleware/rls';
import { getCategoriesForArtisanProfiles, getReviewStatsForArtisans } from '../lib/categories';

const router = Router();
const ALLOWED_RADIUS_KM = [5, 10, 20, 50];

function parseCategorySlugs(raw: unknown): string[] {
  if (typeof raw === 'string' && raw.trim()) {
    return raw.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  }
  if (Array.isArray(raw)) {
    return raw.flatMap((v) => String(v).split(',')).map((s) => s.trim().toLowerCase()).filter(Boolean);
  }
  return [];
}

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { lat, lng, radiusKm, categories, skill, q } = req.query;

  if (!lat || !lng || !radiusKm) {
    res.status(400).json({ error: 'lat, lng, and radiusKm are required' });
    return;
  }

  const radius = parseFloat(radiusKm as string);
  if (!ALLOWED_RADIUS_KM.includes(radius)) {
    res.status(400).json({ error: 'radiusKm must be one of 5, 10, 20, or 50' });
    return;
  }

  const radiusInMeters = radius * 1000;
  const latitude = parseFloat(lat as string);
  const longitude = parseFloat(lng as string);
  const categorySlugs = parseCategorySlugs(categories);
  const skillFilter = typeof skill === 'string' ? skill.trim() : '';
  const query = typeof q === 'string' ? q.trim().toLowerCase() : '';

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    res.status(400).json({ error: 'Invalid lat or lng' });
    return;
  }

  try {
    await setPublicRlsContext();

    let matchingProfileIds: string[] | null = null;
    if (categorySlugs.length > 0) {
      const matchedCategories = await prisma.serviceCategory.findMany({
        where: { slug: { in: categorySlugs }, isActive: true, deleted_at: null },
        select: { id: true, slug: true },
      });

      if (matchedCategories.length !== categorySlugs.length) {
        res.status(400).json({ error: 'One or more category slugs are invalid' });
        return;
      }

      const categoryIds = matchedCategories.map((c) => c.id);
      const links = await prisma.artisanServiceCategory.findMany({
        where: { categoryId: { in: categoryIds } },
        select: { artisanProfileId: true, categoryId: true },
      });

      const countByProfile = new Map<string, Set<string>>();
      for (const link of links) {
        const set = countByProfile.get(link.artisanProfileId) || new Set<string>();
        set.add(link.categoryId);
        countByProfile.set(link.artisanProfileId, set);
      }

      matchingProfileIds = [...countByProfile.entries()]
        .filter(([, set]) => categoryIds.every((id) => set.has(id)))
        .map(([profileId]) => profileId);
      if (matchingProfileIds.length === 0) {
        res.status(200).json([]);
        return;
      }
    }

    type ArtisanSearchRow = {
      id: string;
      userId: string;
      firstName: string;
      lastName: string;
      isVerified: boolean;
      skills: string[];
      isOnline: boolean;
      portfolioUrls: string[];
      lng: number;
      lat: number;
      distance: number | bigint;
    };

    const artisans = matchingProfileIds
      ? await prisma.$queryRaw<ArtisanSearchRow[]>`
          SELECT 
            ap.id, 
            ap."userId", 
            ap."firstName", 
            ap."lastName", 
            ap."isVerified",
            ap.skills,
            ap."isOnline",
            ap."portfolioUrls",
            ap.longitude as lng,
            ap.latitude as lat,
            ST_Distance(
              ST_SetSRID(ST_MakePoint(ap.longitude, ap.latitude), 4326)::geography, 
              ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
            ) as distance
          FROM "ArtisanProfile" ap
          WHERE ap.deleted_at IS NULL
          AND ap."isVerified" = true
          AND ap."verificationStatus" = 'APPROVED'::"VerificationStatus"
          AND ap.longitude IS NOT NULL AND ap.latitude IS NOT NULL
          AND ap.id = ANY(${matchingProfileIds}::uuid[])
          AND ST_DWithin(
            ST_SetSRID(ST_MakePoint(ap.longitude, ap.latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
            ${radiusInMeters}
          )
          ORDER BY distance ASC
          LIMIT 50;
        `
      : await prisma.$queryRaw<ArtisanSearchRow[]>`
          SELECT 
            ap.id, 
            ap."userId", 
            ap."firstName", 
            ap."lastName", 
            ap."isVerified",
            ap.skills,
            ap."isOnline",
            ap."portfolioUrls",
            ap.longitude as lng,
            ap.latitude as lat,
            ST_Distance(
              ST_SetSRID(ST_MakePoint(ap.longitude, ap.latitude), 4326)::geography, 
              ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
            ) as distance
          FROM "ArtisanProfile" ap
          WHERE ap.deleted_at IS NULL
          AND ap."isVerified" = true
          AND ap."verificationStatus" = 'APPROVED'::"VerificationStatus"
          AND ap.longitude IS NOT NULL AND ap.latitude IS NOT NULL
          AND ST_DWithin(
            ST_SetSRID(ST_MakePoint(ap.longitude, ap.latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
            ${radiusInMeters}
          )
          ORDER BY distance ASC
          LIMIT 50;
        `;

    let results = artisans.map((a) => ({
      ...a,
      distance: Number(a.distance),
      distanceKm: Math.round((Number(a.distance) / 1000) * 10) / 10,
    }));

    if (skillFilter) {
      results = results.filter((a) =>
        a.skills?.some((s) => s.toLowerCase().includes(skillFilter.toLowerCase()))
      );
    }

    if (query) {
      results = results.filter((a) => {
        const name = `${a.firstName} ${a.lastName}`.toLowerCase();
        const skillsText = (a.skills || []).join(' ').toLowerCase();
        return name.includes(query) || skillsText.includes(query);
      });
    }

    const profileIds = results.map((r) => r.id);
    const userIds = results.map((r) => r.userId);
    const [categoryMap, reviewMap] = await Promise.all([
      getCategoriesForArtisanProfiles(profileIds),
      getReviewStatsForArtisans(userIds),
    ]);

    const enriched = results.map((a) => {
      const stats = reviewMap.get(a.userId) || { averageRating: 0, reviewCount: 0 };
      return {
        ...a,
        categories: categoryMap.get(a.id) || [],
        averageRating: stats.averageRating,
        reviewCount: stats.reviewCount,
      };
    });

    res.status(200).json(enriched);
  } catch (error) {
    console.error('Spatial query error:', error);
    res.status(500).json({ error: 'Failed to search artisans' });
  }
});

export default router;
