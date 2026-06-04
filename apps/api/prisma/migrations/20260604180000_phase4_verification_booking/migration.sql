-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- AlterTable ArtisanProfile
ALTER TABLE "ArtisanProfile" ADD COLUMN "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "ArtisanProfile" ADD COLUMN "verificationStep" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "ArtisanProfile" ADD COLUMN "rejectionReason" TEXT;
ALTER TABLE "ArtisanProfile" ADD COLUMN "portfolioUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "ArtisanProfile" ADD COLUMN "backgroundConsentAt" TIMESTAMP(3);

UPDATE "ArtisanProfile" SET "verificationStatus" = 'APPROVED', "verificationStep" = 5 WHERE "isVerified" = true;

-- CreateTable ArtisanReference
CREATE TABLE "ArtisanReference" (
    "id" UUID NOT NULL,
    "artisanProfileId" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArtisanReference_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ArtisanReference_artisanProfileId_idx" ON "ArtisanReference"("artisanProfileId");

ALTER TABLE "ArtisanReference" ADD CONSTRAINT "ArtisanReference_artisanProfileId_fkey" FOREIGN KEY ("artisanProfileId") REFERENCES "ArtisanProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable Booking
ALTER TABLE "Booking" ADD COLUMN "scheduledDate" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN "scheduledTime" TEXT;
ALTER TABLE "Booking" ADD COLUMN "serviceAddress" TEXT;
ALTER TABLE "Booking" ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE "Booking" ADD COLUMN "longitude" DOUBLE PRECISION;
ALTER TABLE "Booking" ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING';

UPDATE "Booking" SET "paymentStatus" = 'PAID' WHERE "paystackRef" IS NOT NULL;
