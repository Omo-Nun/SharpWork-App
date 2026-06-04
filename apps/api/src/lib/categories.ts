import prisma from '../prisma';

export function slugifyCategory(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function syncArtisanCategories(artisanProfileId: string, categoryIds: string[]): Promise<void> {
  const uniqueIds = [...new Set(categoryIds)];
  const valid = await prisma.serviceCategory.findMany({
    where: { id: { in: uniqueIds }, isActive: true, deleted_at: null },
    select: { id: true },
  });

  await prisma.$transaction([
    prisma.artisanServiceCategory.deleteMany({ where: { artisanProfileId } }),
    ...valid.map((c) =>
      prisma.artisanServiceCategory.create({
        data: { artisanProfileId, categoryId: c.id },
      })
    ),
  ]);
}

export async function syncArtisanCategoriesByNames(artisanProfileId: string, names: string[]): Promise<void> {
  const normalized = names.map((n) => n.trim()).filter(Boolean);
  if (normalized.length === 0) {
    await prisma.artisanServiceCategory.deleteMany({ where: { artisanProfileId } });
    return;
  }

  const categories = await prisma.serviceCategory.findMany({
    where: {
      isActive: true,
      deleted_at: null,
      OR: normalized.map((name) => ({ name: { equals: name, mode: 'insensitive' as const } })),
    },
    select: { id: true },
  });

  await syncArtisanCategories(
    artisanProfileId,
    categories.map((c) => c.id)
  );
}

export async function getReviewStatsForArtisans(artisanUserIds: string[]) {
  if (artisanUserIds.length === 0) return new Map<string, { averageRating: number; reviewCount: number }>();

  const grouped = await prisma.review.groupBy({
    by: ['artisanId'],
    where: { artisanId: { in: artisanUserIds } },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return new Map(
    grouped.map((g) => [
      g.artisanId,
      {
        averageRating: Math.round((g._avg.rating || 0) * 10) / 10,
        reviewCount: g._count.rating,
      },
    ])
  );
}

export async function getCategoriesForArtisanProfiles(profileIds: string[]) {
  if (profileIds.length === 0) return new Map<string, Array<{ id: string; name: string; slug: string; icon: string | null }>>();

  const links = await prisma.artisanServiceCategory.findMany({
    where: { artisanProfileId: { in: profileIds } },
    include: {
      category: { select: { id: true, name: true, slug: true, icon: true, isActive: true, deleted_at: true } },
    },
  });

  const map = new Map<string, Array<{ id: string; name: string; slug: string; icon: string | null }>>();
  for (const link of links) {
    if (!link.category.isActive || link.category.deleted_at) continue;
    const list = map.get(link.artisanProfileId) || [];
    list.push({
      id: link.category.id,
      name: link.category.name,
      slug: link.category.slug,
      icon: link.category.icon,
    });
    map.set(link.artisanProfileId, list);
  }
  return map;
}
