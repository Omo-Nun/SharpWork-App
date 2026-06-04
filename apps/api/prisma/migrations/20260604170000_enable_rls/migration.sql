-- Create Dispute table (missing from initial migration)
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'ESCALATED');

CREATE TABLE "Dispute" (
    "id" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "raisedById" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "adminNotes" TEXT,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "escrowFrozen" BOOLEAN NOT NULL DEFAULT true,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_raisedById_fkey" FOREIGN KEY ("raisedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Row-Level Security for data isolation (Phase 2)

ALTER TABLE "Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Dispute" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ArtisanProfile" ENABLE ROW LEVEL SECURITY;

-- Booking: participants and admins only
CREATE POLICY "booking_select_participants" ON "Booking"
  FOR SELECT
  USING (
    deleted_at IS NULL AND (
      current_setting('app.user_role', true) = 'ADMIN'
      OR "customerId"::text = nullif(current_setting('app.user_id', true), '')
      OR "artisanId"::text = nullif(current_setting('app.user_id', true), '')
    )
  );

CREATE POLICY "booking_insert_customer" ON "Booking"
  FOR INSERT
  WITH CHECK (
    deleted_at IS NULL
    AND current_setting('app.user_role', true) = 'CUSTOMER'
    AND "customerId"::text = nullif(current_setting('app.user_id', true), '')
  );

CREATE POLICY "booking_update_participants" ON "Booking"
  FOR UPDATE
  USING (
    deleted_at IS NULL AND (
      current_setting('app.user_role', true) = 'ADMIN'
      OR "customerId"::text = nullif(current_setting('app.user_id', true), '')
      OR "artisanId"::text = nullif(current_setting('app.user_id', true), '')
    )
  );

-- Messages: sender or receiver
CREATE POLICY "message_select_participants" ON "Message"
  FOR SELECT
  USING (
    deleted_at IS NULL AND (
      current_setting('app.user_role', true) = 'ADMIN'
      OR "senderId"::text = nullif(current_setting('app.user_id', true), '')
      OR "receiverId"::text = nullif(current_setting('app.user_id', true), '')
    )
  );

CREATE POLICY "message_insert_sender" ON "Message"
  FOR INSERT
  WITH CHECK (
    deleted_at IS NULL
    AND "senderId"::text = nullif(current_setting('app.user_id', true), '')
  );

-- Disputes: raised by user or booking participant or admin
CREATE POLICY "dispute_select_participants" ON "Dispute"
  FOR SELECT
  USING (
    deleted_at IS NULL AND (
      current_setting('app.user_role', true) = 'ADMIN'
      OR "raisedById"::text = nullif(current_setting('app.user_id', true), '')
      OR EXISTS (
        SELECT 1 FROM "Booking" b
        WHERE b.id = "Dispute"."bookingId"
        AND b.deleted_at IS NULL
        AND (
          b."customerId"::text = nullif(current_setting('app.user_id', true), '')
          OR b."artisanId"::text = nullif(current_setting('app.user_id', true), '')
        )
      )
    )
  );

CREATE POLICY "dispute_insert_participant" ON "Dispute"
  FOR INSERT
  WITH CHECK (
    deleted_at IS NULL
    AND "raisedById"::text = nullif(current_setting('app.user_id', true), '')
  );

CREATE POLICY "dispute_update_admin" ON "Dispute"
  FOR UPDATE
  USING (current_setting('app.user_role', true) = 'ADMIN');

-- Artisan profiles: verified public discovery, own profile always, admin all
CREATE POLICY "artisan_select_scoped" ON "ArtisanProfile"
  FOR SELECT
  USING (
    deleted_at IS NULL AND (
      current_setting('app.user_role', true) = 'ADMIN'
      OR "userId"::text = nullif(current_setting('app.user_id', true), '')
      OR (
        current_setting('app.user_role', true) IN ('PUBLIC', 'CUSTOMER', 'ARTISAN')
        AND "isVerified" = true
      )
    )
  );

CREATE POLICY "artisan_update_owner" ON "ArtisanProfile"
  FOR UPDATE
  USING (
    deleted_at IS NULL
    AND "userId"::text = nullif(current_setting('app.user_id', true), '')
  );
