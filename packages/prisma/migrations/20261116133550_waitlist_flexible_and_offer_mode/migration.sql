-- CreateEnum
CREATE TYPE "public"."WaitlistEntryKind" AS ENUM ('EXACT_TIME', 'ANY_TIME_ON_DAY', 'EARLIER_THAN_BOOKING');

-- CreateEnum
CREATE TYPE "public"."WaitlistOfferMode" AS ENUM ('IN_ORDER', 'EVERYONE');

-- AlterTable
ALTER TABLE "public"."EventType" ADD COLUMN     "waitlistOfferMode" "public"."WaitlistOfferMode" NOT NULL DEFAULT 'IN_ORDER';

-- AlterTable
ALTER TABLE "public"."WaitlistEntry" ADD COLUMN     "kind" "public"."WaitlistEntryKind" NOT NULL DEFAULT 'EXACT_TIME',
ADD COLUMN     "offerEndTime" TIMESTAMP(3),
ADD COLUMN     "offerStartTime" TIMESTAMP(3),
ADD COLUMN     "rangeEnd" TIMESTAMP(3),
ADD COLUMN     "rangeStart" TIMESTAMP(3),
ADD COLUMN     "rescheduleBookingUid" TEXT;

-- CreateIndex
CREATE INDEX "WaitlistEntry_eventTypeId_status_kind_idx" ON "public"."WaitlistEntry"("eventTypeId", "status", "kind");

-- CreateIndex
CREATE INDEX "WaitlistEntry_eventTypeId_offerStartTime_status_idx" ON "public"."WaitlistEntry"("eventTypeId", "offerStartTime", "status");

-- Offers made before this migration were for the entry's own time.
UPDATE "WaitlistEntry" SET "offerStartTime" = "startTime", "offerEndTime" = "endTime" WHERE "status" = 'OFFERED';
