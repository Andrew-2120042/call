-- CreateEnum
CREATE TYPE "public"."AttendeeConfirmationStatus" AS ENUM ('REQUESTED', 'CONFIRMED', 'MISSED', 'CANCELLED');

-- AlterTable
ALTER TABLE "public"."EventType" ADD COLUMN     "attendeeConfirmationHours" INTEGER,
ADD COLUMN     "releaseUnconfirmedBookings" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."BookingAttendeeConfirmation" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "status" "public"."AttendeeConfirmationStatus" NOT NULL DEFAULT 'REQUESTED',
    "tokenHash" TEXT NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "BookingAttendeeConfirmation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookingAttendeeConfirmation_bookingId_key" ON "public"."BookingAttendeeConfirmation"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "BookingAttendeeConfirmation_tokenHash_key" ON "public"."BookingAttendeeConfirmation"("tokenHash");

-- CreateIndex
CREATE INDEX "BookingAttendeeConfirmation_status_deadline_idx" ON "public"."BookingAttendeeConfirmation"("status", "deadline");

-- AddForeignKey
ALTER TABLE "public"."BookingAttendeeConfirmation" ADD CONSTRAINT "BookingAttendeeConfirmation_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
