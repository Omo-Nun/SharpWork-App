import prisma from '../prisma';

const DEFAULT_FEE = 15;

export async function getPlatformFeePercent(): Promise<number> {
  const setting = await prisma.platformSetting.findUnique({ where: { id: 'default' } });
  if (setting && setting.platformFeePercent >= 0 && setting.platformFeePercent <= 100) {
    return setting.platformFeePercent;
  }

  const fromEnv = Number(process.env.PLATFORM_FEE_PERCENT);
  if (Number.isFinite(fromEnv) && fromEnv >= 0 && fromEnv <= 100) {
    return fromEnv;
  }
  return DEFAULT_FEE;
}

export async function setPlatformFeePercent(percent: number): Promise<number> {
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
    throw new Error('Platform fee must be between 0 and 100');
  }

  const setting = await prisma.platformSetting.upsert({
    where: { id: 'default' },
    create: { id: 'default', platformFeePercent: percent },
    update: { platformFeePercent: percent },
  });

  return setting.platformFeePercent;
}

export async function validateArtisanOffersCategories(
  artisanProfileId: string,
  categorySlugs: string[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (categorySlugs.length === 0) {
    return { ok: true };
  }

  const uniqueSlugs = [...new Set(categorySlugs.map((s) => s.trim().toLowerCase()).filter(Boolean))];
  const categories = await prisma.serviceCategory.findMany({
    where: { slug: { in: uniqueSlugs }, isActive: true, deleted_at: null },
    select: { id: true, slug: true },
  });

  if (categories.length !== uniqueSlugs.length) {
    return { ok: false, error: 'One or more selected service categories are invalid' };
  }

  const links = await prisma.artisanServiceCategory.findMany({
    where: {
      artisanProfileId,
      categoryId: { in: categories.map((c) => c.id) },
    },
    select: { categoryId: true },
  });

  if (links.length !== categories.length) {
    return { ok: false, error: 'This artisan does not offer all selected services' };
  }

  return { ok: true };
}
