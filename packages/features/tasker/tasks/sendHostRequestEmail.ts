import { sendOrganizerRequestEmail } from "@calcom/emails/email-manager";
import { getBookingRequestInsightService } from "@calcom/features/booking-request-insights/lib/getBookingRequestInsightService";
import { getBooking } from "@calcom/features/bookings/lib/payment/getBooking";
import logger from "@calcom/lib/logger";
import prisma from "@calcom/prisma";
import { BookingStatus } from "@calcom/prisma/enums";
import { z } from "zod";

const log = logger.getSubLogger({ prefix: ["sendHostRequestEmail"] });

export const sendHostRequestEmailPayloadSchema = z.object({
  bookingUid: z.string(),
  additionalNotes: z.string().nullish(),
});

/**
 * Sends the host's "new booking request" email once the AI summary is ready, with the summary inside.
 * If the summary can't be written the email still goes out without it, so the host always hears about the request.
 */
export async function sendHostRequestEmail(payload: string): Promise<void> {
  const { bookingUid, additionalNotes } = sendHostRequestEmailPayloadSchema.parse(JSON.parse(payload));
  const found = await prisma.booking.findUnique({ where: { uid: bookingUid }, select: { id: true } });
  if (!found) {
    log.warn(`Booking ${bookingUid} not found, skipping the request email`);
    return;
  }
  const bookingId = found.id;
  const { booking, evt, eventType } = await getBooking(bookingId);

  // The host may have accepted or declined from the app already; then this email would only confuse.
  if (booking.status !== BookingStatus.PENDING) {
    log.debug(`Booking ${bookingId} is no longer pending, skipping the request email`);
    return;
  }

  const insight = await getBookingRequestInsightService().analyseBooking(bookingId);
  await sendOrganizerRequestEmail(
    { ...evt, additionalNotes: additionalNotes ?? evt.additionalNotes },
    eventType?.metadata ?? undefined,
    insight ? { summary: insight.summary, fit: insight.fit, spamLikely: insight.spamLikely } : null
  );
}
