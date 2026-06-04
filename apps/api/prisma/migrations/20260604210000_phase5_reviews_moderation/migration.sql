-- CreateEnum
CREATE TYPE "ModerationType" AS ENUM ('REPORT', 'BLOCK');

-- CreateTable
CREATE TABLE "Review" (
    "id" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "artisanId" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationReport" (
    "id" UUID NOT NULL,
    "reporterId" UUID NOT NULL,
    "targetUserId" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "type" "ModerationType" NOT NULL DEFAULT 'REPORT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ModerationReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Review_bookingId_key" ON "Review"("bookingId");
CREATE INDEX "Review_artisanId_idx" ON "Review"("artisanId");
CREATE INDEX "ModerationReport_reporterId_idx" ON "ModerationReport"("reporterId");
CREATE INDEX "ModerationReport_targetUserId_idx" ON "ModerationReport"("targetUserId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
