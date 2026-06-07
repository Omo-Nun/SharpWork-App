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

const CATEGORY_GROUPS = [
  { name: 'Building & Home Services', slug: 'building-home-services', sortOrder: 1 },
  { name: 'Transport & Machines', slug: 'transport-machines', sortOrder: 2 },
  { name: 'Personal & Fashion Services', slug: 'personal-fashion-services', sortOrder: 3 },
  { name: 'Tech & Electronics', slug: 'tech-electronics', sortOrder: 4 },
  { name: 'Food & Production Trades', slug: 'food-production-trades', sortOrder: 5 },
  { name: 'Additional Building & Construction Trades', slug: 'additional-building-construction', sortOrder: 6 },
  { name: 'Metal & Fabrication Trades', slug: 'metal-fabrication-trades', sortOrder: 7 },
  { name: 'Beauty & Personal Care', slug: 'beauty-personal-care', sortOrder: 8 },
  { name: 'Fashion & Textile Trades', slug: 'fashion-textile-trades', sortOrder: 9 },
  { name: 'Tech & Creative Trades', slug: 'tech-creative-trades', sortOrder: 10 },
  { name: 'Other Skilled Trades', slug: 'other-skilled-trades', sortOrder: 11 },
];

const DEFAULT_CATEGORIES = [
  // Building & Home Services
  { groupSlug: 'building-home-services', name: 'Plumber', slug: 'plumber', description: 'Fixes pipes, toilets, water systems', icon: '🔧', sortOrder: 1 },
  { groupSlug: 'building-home-services', name: 'Carpenter', slug: 'carpenter', description: 'Woodwork, doors, roofing frames', icon: '🪚', sortOrder: 2 },
  { groupSlug: 'building-home-services', name: 'Furniture/Cabinet Maker', slug: 'furniture-maker', description: 'Makes beds, chairs, wardrobes, kitchen cabinets', icon: '🪑', sortOrder: 3 },
  { groupSlug: 'building-home-services', name: 'Mason/Bricklayer', slug: 'mason-bricklayer', description: 'Builds walls, houses', icon: '🧱', sortOrder: 4 },
  { groupSlug: 'building-home-services', name: 'House Painter', slug: 'house-painter', description: 'House painting, spray painting', icon: '🎨', sortOrder: 5 },
  { groupSlug: 'building-home-services', name: 'Electrician', slug: 'electrician', description: 'House wiring, electrical repairs', icon: '⚡', sortOrder: 6 },
  { groupSlug: 'building-home-services', name: 'Tiler', slug: 'tiler', description: 'Installs floor and wall tiles', icon: '🧊', sortOrder: 7 },
  { groupSlug: 'building-home-services', name: 'Welder/Fabricator', slug: 'welder-fabricator', description: 'Metal gates, burglar proofs, metal furniture', icon: '🔥', sortOrder: 8 },
  { groupSlug: 'building-home-services', name: 'POP/Ceiling Installer', slug: 'pop-ceiling', description: 'POP ceilings, gypsum work', icon: '🏗️', sortOrder: 9 },
  { groupSlug: 'building-home-services', name: 'AC/Refrigeration Tech', slug: 'ac-refrigeration', description: 'Installs and repairs ACs, fridges, freezers', icon: '❄️', sortOrder: 10 },

  // Transport & Machines
  { groupSlug: 'transport-machines', name: 'Auto Mechanic', slug: 'auto-mechanic', description: 'Car engine and general repairs', icon: '🚗', sortOrder: 11 },
  { groupSlug: 'transport-machines', name: 'Auto Electrician', slug: 'auto-electrician', description: 'Car wiring, alternator, starter', icon: '🔋', sortOrder: 12 },
  { groupSlug: 'transport-machines', name: 'Panel Beater', slug: 'panel-beater', description: 'Car bodywork and denting', icon: '🔨', sortOrder: 13 },
  { groupSlug: 'transport-machines', name: 'Auto Spray Painter', slug: 'auto-spray-painter', description: 'Car painting', icon: '🚙', sortOrder: 14 },
  { groupSlug: 'transport-machines', name: 'Vulcanizer', slug: 'vulcanizer', description: 'Tire repair and vulcanizing', icon: '🛞', sortOrder: 15 },
  { groupSlug: 'transport-machines', name: 'Generator Technician', slug: 'generator-technician', description: 'Repairs generators', icon: '🔌', sortOrder: 16 },
  { groupSlug: 'transport-machines', name: 'Motorcycle/Keke Mechanic', slug: 'motorcycle-mechanic', description: 'Okada and tricycle repairs', icon: '🏍️', sortOrder: 17 },

  // Personal & Fashion Services
  { groupSlug: 'personal-fashion-services', name: 'Barber', slug: 'barber', description: 'Men’s haircut', icon: '💈', sortOrder: 18 },
  { groupSlug: 'personal-fashion-services', name: 'Hairdresser/Stylist', slug: 'hairdresser', description: 'Women’s hair', icon: '💇', sortOrder: 19 },
  { groupSlug: 'personal-fashion-services', name: 'Tailor/Fashion Designer', slug: 'tailor', description: 'Sewing clothes, agbada, suits', icon: '✂️', sortOrder: 20 },
  { groupSlug: 'personal-fashion-services', name: 'Shoe Maker/Cobbler', slug: 'shoe-maker', description: 'Repairs and makes shoes, bags', icon: '👞', sortOrder: 21 },
  { groupSlug: 'personal-fashion-services', name: 'Dry Cleaner/Laundry', slug: 'dry-cleaner', description: 'Washing, ironing, dry cleaning', icon: '🧺', sortOrder: 22 },

  // Tech & Electronics
  { groupSlug: 'tech-electronics', name: 'Phone Repairer', slug: 'phone-repairer', description: 'Screen, battery, charging port fixes', icon: '📱', sortOrder: 23 },
  { groupSlug: 'tech-electronics', name: 'Laptop/Desktop Repairer', slug: 'laptop-repairer', description: 'Hardware and software issues', icon: '💻', sortOrder: 24 },
  { groupSlug: 'tech-electronics', name: 'CCTV/Satellite Installer', slug: 'cctv-installer', description: 'DSTV, GOTV, security cameras', icon: '📡', sortOrder: 25 },
  { groupSlug: 'tech-electronics', name: 'Photographer/Videographer', slug: 'photographer', description: 'Events, portraits, video shoots', icon: '📷', sortOrder: 26 },

  // Food & Production Trades
  { groupSlug: 'food-production-trades', name: 'Baker', slug: 'baker', description: 'Bread, cakes, pastries', icon: '🎂', sortOrder: 27 },
  { groupSlug: 'food-production-trades', name: 'Caterer', slug: 'caterer', description: 'Event cooking', icon: '🥘', sortOrder: 28 },
  { groupSlug: 'food-production-trades', name: 'Block Molder', slug: 'block-molder', description: 'Makes cement blocks for building', icon: '🧱', sortOrder: 29 },
  { groupSlug: 'food-production-trades', name: 'Snacks/Small Chops Vendor', slug: 'snacks-vendor', description: 'Puff, samosa, spring rolls for events', icon: '🥟', sortOrder: 30 },
  { groupSlug: 'food-production-trades', name: 'Soap & Detergent Maker', slug: 'soap-maker', description: 'Bar soap, liquid soap, bleach production', icon: '🧼', sortOrder: 31 },
  { groupSlug: 'food-production-trades', name: 'Perfume & Scent Producer', slug: 'perfume-producer', description: 'Mixes oils, fragrances, room sprays', icon: '🧴', sortOrder: 32 },
  { groupSlug: 'food-production-trades', name: 'Brewery/Distiller', slug: 'brewery', description: 'Local drinks, palm wine tapping, zobo production', icon: '🍻', sortOrder: 33 },

  // Additional Building & Construction Trades
  { groupSlug: 'additional-building-construction', name: 'Steel Bender', slug: 'steel-bender', description: 'Bends and ties reinforcement steel for building foundations', icon: '🏗️', sortOrder: 34 },
  { groupSlug: 'additional-building-construction', name: 'Scaffolder', slug: 'scaffolder', description: 'Erects and dismantles scaffolding', icon: '🪜', sortOrder: 35 },
  { groupSlug: 'additional-building-construction', name: 'Glazier/Glass Cutter', slug: 'glazier', description: 'Cuts and installs glass, mirrors', icon: '🪟', sortOrder: 36 },
  { groupSlug: 'additional-building-construction', name: 'Plasterer', slug: 'plasterer', description: 'Wall plastering', icon: '🧱', sortOrder: 37 },
  { groupSlug: 'additional-building-construction', name: 'Roofing Specialist', slug: 'roofing-specialist', description: 'Installs aluminum roofing sheets', icon: '🏠', sortOrder: 38 },
  { groupSlug: 'additional-building-construction', name: 'Landscaper/Gardener', slug: 'landscaper', description: 'Designs and maintains lawns, gardens', icon: '🪴', sortOrder: 39 },
  { groupSlug: 'additional-building-construction', name: 'Painter & Decorator', slug: 'painter-decorator', description: 'Wallpaper, decorative finishes, interior design painting', icon: '🖼️', sortOrder: 40 },

  // Metal & Fabrication Trades
  { groupSlug: 'metal-fabrication-trades', name: 'Blacksmith', slug: 'blacksmith', description: 'Traditional ironwork, tools, farm implements', icon: '⚒️', sortOrder: 41 },
  { groupSlug: 'metal-fabrication-trades', name: 'Sheet Metal Fabricator', slug: 'sheet-metal-fabricator', description: 'Makes ducts, metal trays, kitchen equipment', icon: '🏭', sortOrder: 42 },
  { groupSlug: 'metal-fabrication-trades', name: 'Instrumentation Tech', slug: 'instrumentation-tech', description: 'Industrial sensors, gauges, control systems', icon: '🎛️', sortOrder: 43 },
  { groupSlug: 'metal-fabrication-trades', name: 'Machinist', slug: 'machinist', description: 'Operates lathes, milling machines', icon: '⚙️', sortOrder: 44 },

  // Beauty & Personal Care
  { groupSlug: 'beauty-personal-care', name: 'Makeup Artist/MUA', slug: 'makeup-artist', description: 'Bridal, event, photoshoot makeup', icon: '💄', sortOrder: 45 },
  { groupSlug: 'beauty-personal-care', name: 'Wig Maker', slug: 'wig-maker', description: 'Sewing wigs, closures, frontal installation', icon: '👱‍♀️', sortOrder: 46 },
  { groupSlug: 'beauty-personal-care', name: 'Nail Technician', slug: 'nail-technician', description: 'Manicure, pedicure, acrylics, gel nails', icon: '💅', sortOrder: 47 },
  { groupSlug: 'beauty-personal-care', name: 'Barbering Specialist', slug: 'barbering-specialist', description: 'Fades, designs, hot towel shaves', icon: '💈', sortOrder: 48 },
  { groupSlug: 'beauty-personal-care', name: 'Skincare Formulator', slug: 'skincare-formulator', description: 'Makes organic creams, scrubs, lotions', icon: '🌿', sortOrder: 49 },

  // Fashion & Textile Trades
  { groupSlug: 'fashion-textile-trades', name: 'Leather Worker', slug: 'leather-worker', description: 'Bags, belts, wallets, shoes from leather', icon: '👜', sortOrder: 50 },
  { groupSlug: 'fashion-textile-trades', name: 'Embroidery Specialist', slug: 'embroidery-specialist', description: 'Adds designs, logos, names to fabrics', icon: '🧵', sortOrder: 51 },
  { groupSlug: 'fashion-textile-trades', name: 'Bead Maker', slug: 'bead-maker', description: 'Traditional and modern beads for fashion', icon: '📿', sortOrder: 52 },
  { groupSlug: 'fashion-textile-trades', name: 'Knitter/Crochet Artisan', slug: 'knitter', description: 'Sweaters, caps, bags, baby clothes', icon: '🧶', sortOrder: 53 },
  { groupSlug: 'fashion-textile-trades', name: 'Tie & Dye/Batik Maker', slug: 'tie-dye', description: 'Adire, kampala production', icon: '👘', sortOrder: 54 },

  // Tech & Creative Trades
  { groupSlug: 'tech-creative-trades', name: 'Graphic Designer', slug: 'graphic-designer', description: 'Logos, flyers, banners, social media', icon: '🎨', sortOrder: 55 },
  { groupSlug: 'tech-creative-trades', name: 'Video Editor', slug: 'video-editor', description: 'Edits wedding videos, skits, YouTube content', icon: '🎬', sortOrder: 56 },
  { groupSlug: 'tech-creative-trades', name: 'Sound Engineer/DJ', slug: 'sound-engineer', description: 'Event sound, mixing, DJing', icon: '🎧', sortOrder: 57 },
  { groupSlug: 'tech-creative-trades', name: 'Printer/Press Operator', slug: 'printer', description: 'Banners, posters, ID cards, flyers', icon: '🖨️', sortOrder: 58 },
  { groupSlug: 'tech-creative-trades', name: 'Signage Maker', slug: 'signage-maker', description: '3D signs, neon signs, acrylic work', icon: '🪧', sortOrder: 59 },

  // Other Skilled Trades
  { groupSlug: 'other-skilled-trades', name: 'Locksmith', slug: 'locksmith', description: 'Key cutting, lock repair, car key programming', icon: '🔑', sortOrder: 60 },
  { groupSlug: 'other-skilled-trades', name: 'Upholsterer', slug: 'upholsterer', description: 'Re-upholsters sofas, car seats, chairs', icon: '🛋️', sortOrder: 61 },
  { groupSlug: 'other-skilled-trades', name: 'Glass & Aluminum Worker', slug: 'glass-aluminum-worker', description: 'Installs sliding windows, doors, partitions', icon: '🪟', sortOrder: 62 },
  { groupSlug: 'other-skilled-trades', name: 'Solar Installer', slug: 'solar-installer', description: 'Solar panel and inverter installation', icon: '☀️', sortOrder: 63 },
  { groupSlug: 'other-skilled-trades', name: 'Event Planner/Decorator', slug: 'event-planner', description: 'Decor for weddings, birthdays, corporate events', icon: '🎉', sortOrder: 64 },
  { groupSlug: 'other-skilled-trades', name: 'Fumigation', slug: 'fumigation', description: 'Pest control, fumigation services', icon: '🪲', sortOrder: 65 },
  { groupSlug: 'other-skilled-trades', name: 'House Cleaners', slug: 'house-cleaners', description: 'Deep cleaning, post-construction cleaning', icon: '🧽', sortOrder: 66 },
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
  for (const group of CATEGORY_GROUPS) {
    await prisma.categoryGroup.upsert({
      where: { slug: group.slug },
      update: {
        name: group.name,
        sortOrder: group.sortOrder,
        isActive: true,
        deleted_at: null,
      },
      create: group,
    });
  }

  const groups = await prisma.categoryGroup.findMany();
  const groupMap = new Map(groups.map((g) => [g.slug, g.id]));

  for (const category of DEFAULT_CATEGORIES) {
    const groupId = groupMap.get(category.groupSlug);
    
    const data = {
      name: category.name,
      description: category.description,
      icon: category.icon,
      sortOrder: category.sortOrder,
      groupId: groupId,
      isActive: true,
      deleted_at: null,
    };
    
    await prisma.serviceCategory.upsert({
      where: { slug: category.slug },
      update: data,
      create: { ...data, slug: category.slug },
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
