-- AlterTable
ALTER TABLE "User" ADD COLUMN     "expoPushToken" TEXT,
ADD COLUMN     "phoneVerifiedAt" TIMESTAMP(3),
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "passwordHash" DROP NOT NULL,
ALTER COLUMN "phoneNumber" DROP NOT NULL;
