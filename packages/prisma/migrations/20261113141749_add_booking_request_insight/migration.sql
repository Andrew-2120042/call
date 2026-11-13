-- CreateEnum
CREATE TYPE "public"."BookingRequestFit" AS ENUM ('GOOD', 'UNCLEAR', 'POOR');

-- CreateTable
CREATE TABLE "public"."BookingRequestInsight" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "fit" "public"."BookingRequestFit" NOT NULL,
    "spamLikely" BOOLEAN NOT NULL,
    "concerns" TEXT[],
    "suggestedReply" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingRequestInsight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookingRequestInsight_bookingId_key" ON "public"."BookingRequestInsight"("bookingId");

-- AddForeignKey
ALTER TABLE "public"."BookingRequestInsight" ADD CONSTRAINT "BookingRequestInsight_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
