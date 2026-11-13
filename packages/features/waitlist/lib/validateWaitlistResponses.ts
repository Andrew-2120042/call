import { getBookingFieldsWithSystemFields } from "@calcom/features/bookings/lib/getBookingFields";
import getBookingResponsesSchema from "@calcom/features/bookings/lib/getBookingResponsesSchema";
import { prisma } from "@calcom/prisma";

/**
 * Validates waitlist answers with the exact schema the booking flow uses, so a claim later can't fail
 * because a required question was skipped when joining. Returns the normalised responses or the errors.
 */
export async function validateWaitlistResponses(
  eventTypeId: number,
  responses: Record<string, unknown>
): Promise<{ ok: true; responses: Record<string, unknown> } | { ok: false; errors: string[] }> {
  const eventType = await prisma.eventType.findUnique({
    where: { id: eventTypeId },
    select: { bookingFields: true, disableGuests: true, customInputs: true, metadata: true },
  });
  if (!eventType) return { ok: false, errors: ["Service not found"] };

  const bookingFields = getBookingFieldsWithSystemFields({
    bookingFields: eventType.bookingFields,
    disableGuests: eventType.disableGuests,
    customInputs: eventType.customInputs,
    metadata: eventType.metadata,
  });
  const result = await getBookingResponsesSchema({ bookingFields, view: "booking" }).safeParseAsync(
    responses
  );
  if (result.success) return { ok: true, responses: result.data as Record<string, unknown> };
  return { ok: false, errors: result.error.issues.map((issue) => issue.message) };
}
