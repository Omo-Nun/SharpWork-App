const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.error(
    'DATABASE_URL is not set. On Railway, open the api service shell (not web/admin) and ensure Postgres is linked under Variables.'
  );
  process.exit(1);
}

const { PrismaClient, Role, VerificationStatus } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@test.com';
const ADMIN_PASSWORD = 'password';

const DEFAULT_CATEGORIES = [
  { name: 'Plumbing', slug: 'plumbing', description: 'Pipe repair, leaks, and installations', icon: '🔧', sortOrder: 1 },
  { name: 'Electrical', slug: 'electrical', description: 'Wiring, outlets, and electrical faults', icon: '⚡', sortOrder: 2 },
  { name: 'Carpentry', slug: 'carpentry', description: 'Furniture, doors, and woodwork', icon: '🪚', sortOrder: 3 },
  { name: 'Cleaning', slug: 'cleaning', description: 'Home and office cleaning services', icon: '🧹', sortOrder: 4 },
  { name: 'Painting', slug: 'painting', description: 'Interior and exterior painting', icon: '🎨', sortOrder: 5 },
  { name: 'AC Repair', slug: 'ac-repair', description: 'Air conditioning service and repair', icon: '❄️', sortOrder: 6 },
  { name: 'Generator Repair', slug: 'generator-repair', description: 'Generator servicing and repairs', icon: '🔌', sortOrder: 7 },
  { name: 'Appliance Repair', slug: 'appliance-repair', description: 'Washing machines, fridges, and more', icon: '🛠️', sortOrder: 8 },
];

const TEST_ARTISANS = [
  {
    email: 'chidi.plumber@test.com',
    phoneNumber: '+2348010000101',
    firstName: 'Chidi',
    lastName: 'Okafor',
    skills: ['Plumbing'],
    categorySlugs: ['plumbing'],
    latitude: 6.5244,
    longitude: 3.3792,
  },
  {
    email: 'amaka.electric@test.com',
    phoneNumber: '+2348010000102',
    firstName: 'Amaka',
    lastName: 'Nwosu',
    skills: ['Electrical'],
    categorySlugs: ['electrical'],
    latitude: 6.528,
    longitude: 3.384,
  },
  {
    email: 'tunde.carpenter@test.com',
    phoneNumber: '+2348010000103',
    firstName: 'Tunde',
    lastName: 'Adeyemi',
    skills: ['Carpentry'],
    categorySlugs: ['carpentry'],
    latitude: 6.519,
    longitude: 3.372,
  },
  {
    email: 'funke.cleaner@test.com',
    phoneNumber: '+2348010000104',
    firstName: 'Funke',
    lastName: 'Balogun',
    skills: ['Cleaning'],
    categorySlugs: ['cleaning'],
    latitude: 6.531,
    longitude: 3.365,
  },
  {
    email: 'yusuf.painter@test.com',
    phoneNumber: '+2348010000105',
    firstName: 'Yusuf',
    lastName: 'Ibrahim',
    skills: ['Painting'],
    categorySlugs: ['painting'],
    latitude: 6.515,
    longitude: 3.388,
  },
  {
    email: 'ngozi.ac@test.com',
    phoneNumber: '+2348010000106',
    firstName: 'Ngozi',
    lastName: 'Eze',
    skills: ['AC Repair'],
    categorySlugs: ['ac-repair'],
    latitude: 6.522,
    longitude: 3.391,
  },
];

async function seedCategories() {
  for (const category of DEFAULT_CATEGORIES) {
    await prisma.serviceCategory.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        icon: category.icon,
        sortOrder: category.sortOrder,
        isActive: true,
        deleted_at: null,
      },
      create: category,
    });
  }
}

async function seedAdmin() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const existing = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
    include: { adminProfile: true },
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        passwordHash,
        role: Role.ADMIN,
        emailVerifiedAt: existing.emailVerifiedAt ?? new Date(),
      },
    });
    if (!existing.adminProfile) {
      await prisma.adminProfile.create({
        data: { userId: existing.id, totpEnabled: false },
      });
    }
    return;
  }

  await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      phoneNumber: '+2348010000001',
      passwordHash,
      role: Role.ADMIN,
      emailVerifiedAt: new Date(),
      adminProfile: { create: { totpEnabled: false } },
    },
  });
}

async function seedArtisan(artisan, passwordHash, categoryIdsBySlug) {
  const existing = await prisma.user.findUnique({
    where: { email: artisan.email },
    include: { artisanProfile: true },
  });

  let profileId;

  if (existing?.artisanProfile) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { passwordHash, emailVerifiedAt: existing.emailVerifiedAt ?? new Date() },
    });
    await prisma.artisanProfile.update({
      where: { id: existing.artisanProfile.id },
      data: {
        firstName: artisan.firstName,
        lastName: artisan.lastName,
        skills: artisan.skills,
        isVerified: true,
        verificationStatus: VerificationStatus.APPROVED,
        latitude: artisan.latitude,
        longitude: artisan.longitude,
        isOnline: true,
        settlementBank: '058',
        accountNumber: '0123456789',
      },
    });
    profileId = existing.artisanProfile.id;
  } else if (existing) {
    const profile = await prisma.artisanProfile.create({
      data: {
        userId: existing.id,
        firstName: artisan.firstName,
        lastName: artisan.lastName,
        skills: artisan.skills,
        isVerified: true,
        verificationStatus: VerificationStatus.APPROVED,
        latitude: artisan.latitude,
        longitude: artisan.longitude,
        isOnline: true,
        settlementBank: '058',
        accountNumber: '0123456789',
      },
    });
    profileId = profile.id;
  } else {
    const user = await prisma.user.create({
      data: {
        email: artisan.email,
        phoneNumber: artisan.phoneNumber,
        passwordHash,
        role: Role.ARTISAN,
        emailVerifiedAt: new Date(),
        artisanProfile: {
          create: {
            firstName: artisan.firstName,
            lastName: artisan.lastName,
            skills: artisan.skills,
            isVerified: true,
            verificationStatus: VerificationStatus.APPROVED,
            latitude: artisan.latitude,
            longitude: artisan.longitude,
            isOnline: true,
            settlementBank: '058',
            accountNumber: '0123456789',
          },
        },
      },
      include: { artisanProfile: true },
    });
    profileId = user.artisanProfile.id;
  }

  const categoryIds = artisan.categorySlugs
    .map((slug) => categoryIdsBySlug.get(slug))
    .filter(Boolean);

  await prisma.artisanServiceCategory.deleteMany({ where: { artisanProfileId: profileId } });
  if (categoryIds.length > 0) {
    await prisma.artisanServiceCategory.createMany({
      data: categoryIds.map((categoryId) => ({ artisanProfileId: profileId, categoryId })),
      skipDuplicates: true,
    });
  }
}

async function main() {
  console.log('Seeding SharpWork test data...');

  await seedCategories();

  const categories = await prisma.serviceCategory.findMany({
    where: { deleted_at: null },
    select: { id: true, slug: true },
  });
  const categoryIdsBySlug = new Map(categories.map((c) => [c.slug, c.id]));

  await seedAdmin();

  const artisanPasswordHash = await bcrypt.hash('password', 10);
  for (const artisan of TEST_ARTISANS) {
    await seedArtisan(artisan, artisanPasswordHash, categoryIdsBySlug);
  }

  await prisma.platformSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: { id: 'default', platformFeePercent: 15 },
  });

  console.log('Seed complete.');
  console.log(`Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log('Test artisans also use password: password');
  console.log(`Service categories: ${categories.length}`);
  console.log(`Test artisans: ${TEST_ARTISANS.length} (verified, Lagos area)`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
