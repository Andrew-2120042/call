-- AlterTable
ALTER TABLE "public"."EventType" ADD COLUMN     "attendeeReminderMinutes" INTEGER[] DEFAULT ARRAY[1440]::INTEGER[];

-- CreateTable
CREATE TABLE "public"."BookingReminderSent" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "minutesBefore" INTEGER NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingReminderSent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookingReminderSent_bookingId_minutesBefore_key" ON "public"."BookingReminderSent"("bookingId", "minutesBefore");

-- AddForeignKey
ALTER TABLE "public"."BookingReminderSent" ADD CONSTRAINT "BookingReminderSent_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
