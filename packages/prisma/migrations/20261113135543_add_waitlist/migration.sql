-- CreateEnum
CREATE TYPE "public"."WaitlistEntryStatus" AS ENUM ('WAITING', 'OFFERED', 'CLAIMED', 'EXPIRED', 'REMOVED');

-- AlterTable
ALTER TABLE "public"."EventType" ADD COLUMN     "waitlistEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."WaitlistEntry" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "eventTypeId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "timeZone" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "responses" JSONB NOT NULL DEFAULT '{}',
    "status" "public"."WaitlistEntryStatus" NOT NULL DEFAULT 'WAITING',
    "offerTokenHash" TEXT,
    "offeredAt" TIMESTAMP(3),
    "offerExpiresAt" TIMESTAMP(3),
    "claimedBookingId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaitlistEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistEntry_uid_key" ON "public"."WaitlistEntry"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistEntry_offerTokenHash_key" ON "public"."WaitlistEntry"("offerTokenHash");

-- CreateIndex
CREATE INDEX "WaitlistEntry_eventTypeId_startTime_status_idx" ON "public"."WaitlistEntry"("eventTypeId", "startTime", "status");

-- CreateIndex
CREATE INDEX "WaitlistEntry_status_offerExpiresAt_idx" ON "public"."WaitlistEntry"("status", "offerExpiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistEntry_eventTypeId_startTime_email_key" ON "public"."WaitlistEntry"("eventTypeId", "startTime", "email");

-- AddForeignKey
ALTER TABLE "public"."WaitlistEntry" ADD CONSTRAINT "WaitlistEntry_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "public"."EventType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
