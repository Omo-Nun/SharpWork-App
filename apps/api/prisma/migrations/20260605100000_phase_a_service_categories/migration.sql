-- Service categories (Phase A)
CREATE TABLE "ServiceCategory" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ServiceCategory_slug_key" ON "ServiceCategory"("slug");

CREATE TABLE "ArtisanServiceCategory" (
    "artisanProfileId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,

    CONSTRAINT "ArtisanServiceCategory_pkey" PRIMARY KEY ("artisanProfileId", "categoryId")
);

CREATE INDEX "ArtisanServiceCategory_categoryId_idx" ON "ArtisanServiceCategory"("categoryId");

ALTER TABLE "ArtisanServiceCategory" ADD CONSTRAINT "ArtisanServiceCategory_artisanProfileId_fkey"
  FOREIGN KEY ("artisanProfileId") REFERENCES "ArtisanProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ArtisanServiceCategory" ADD CONSTRAINT "ArtisanServiceCategory_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed default categories
INSERT INTO "ServiceCategory" ("id", "name", "slug", "description", "icon", "isActive", "sortOrder", "updatedAt") VALUES
  (gen_random_uuid(), 'Plumbing', 'plumbing', 'Pipe repair, leaks, and installations', '🔧', true, 1, NOW()),
  (gen_random_uuid(), 'Electrical', 'electrical', 'Wiring, outlets, and electrical faults', '⚡', true, 2, NOW()),
  (gen_random_uuid(), 'Carpentry', 'carpentry', 'Furniture, doors, and woodwork', '🪚', true, 3, NOW()),
  (gen_random_uuid(), 'Cleaning', 'cleaning', 'Home and office cleaning services', '🧹', true, 4, NOW()),
  (gen_random_uuid(), 'Painting', 'painting', 'Interior and exterior painting', '🎨', true, 5, NOW()),
  (gen_random_uuid(), 'AC Repair', 'ac-repair', 'Air conditioning service and repair', '❄️', true, 6, NOW());

-- Link existing artisans to categories by matching skill names
INSERT INTO "ArtisanServiceCategory" ("artisanProfileId", "categoryId")
SELECT ap.id, sc.id
FROM "ArtisanProfile" ap
CROSS JOIN LATERAL unnest(ap.skills) AS skill_name
JOIN "ServiceCategory" sc ON lower(sc.name) = lower(skill_name)
WHERE ap.deleted_at IS NULL
ON CONFLICT DO NOTHING;
