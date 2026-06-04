-- AlterTable
ALTER TABLE "ArtisanProfile" ADD COLUMN "backgroundCheckStatus" TEXT;
ALTER TABLE "ArtisanProfile" ADD COLUMN "skillTestScore" INTEGER;
ALTER TABLE "ArtisanProfile" ADD COLUMN "skillTestPassedAt" TIMESTAMP(3);
ALTER TABLE "ArtisanProfile" ADD COLUMN "smileJobId" TEXT;
ALTER TABLE "ArtisanProfile" ADD COLUMN "paystackSubaccountCode" TEXT;
ALTER TABLE "ArtisanProfile" ADD COLUMN "settlementBank" TEXT;
ALTER TABLE "ArtisanProfile" ADD COLUMN "accountNumber" TEXT;
