import { Router, Request, Response } from 'express';
import prisma from '../prisma';

const router = Router();

// PostGIS Radius Search for Artisans
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { lat, lng, radiusKm } = req.query;

  if (!lat || !lng || !radiusKm) {
    res.status(400).json({ error: 'lat, lng, and radiusKm are required' });
    return;
  }

  const radiusInMeters = parseFloat(radiusKm as string) * 1000;
  const latitude = parseFloat(lat as string);
  const longitude = parseFloat(lng as string);

  try {
    // Note: ST_DWithin uses meters when geography is used. 
    const artisans = await prisma.$queryRaw`
      SELECT 
        id, 
        "userId", 
        "firstName", 
        "lastName", 
        "isVerified",
        longitude as lng,
        latitude as lat,
        ST_Distance(
          ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography, 
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
        ) as distance
      FROM "ArtisanProfile"
      WHERE longitude IS NOT NULL AND latitude IS NOT NULL
      AND ST_DWithin(
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
        ${radiusInMeters}
      )
      ORDER BY distance ASC
      LIMIT 50;
    `;

    res.status(200).json(artisans);
  } catch (error) {
    console.error('Spatial query error:', error);
    res.status(500).json({ error: 'Failed to search artisans' });
  }
});

export default router;
