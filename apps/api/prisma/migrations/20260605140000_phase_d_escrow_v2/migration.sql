-- Platform settings (admin-configurable commission)
CREATE TABLE "PlatformSetting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "platformFeePercent" DOUBLE PRECISION NOT NULL DEFAULT 15,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlatformSetting_pkey" PRIMARY KEY ("id")
);

INSERT INTO "PlatformSetting" ("id", "platformFeePercent", "updatedAt")
VALUES ('default', 15, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Booking escrow lifecycle fields
ALTER TABLE "Booking" ADD COLUMN "artisanCompletedAt" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN "customerConfirmedAt" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN "escrowReleasedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Booking" ADD COLUMN "pendingPartialPercent" INTEGER;
ALTER TABLE "Booking" ADD COLUMN "partialRequestedAt" TIMESTAMP(3);

-- Escrow audit trail
CREATE TABLE "EscrowAuditLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "bookingId" UUID NOT NULL,
    "actorId" UUID,
    "actorRole" "Role",
    "action" TEXT NOT NULL,
    "amount" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EscrowAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EscrowAuditLog_bookingId_idx" ON "EscrowAuditLog"("bookingId");

ALTER TABLE "EscrowAuditLog" ADD CONSTRAINT "EscrowAuditLog_bookingId_fkey"
    FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
