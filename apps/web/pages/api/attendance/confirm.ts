import { getAttendeeConfirmationService } from "@calcom/features/attendee-confirmation/lib/getAttendeeConfirmationService";
import { checkRateLimitAndThrowError } from "@calcom/lib/checkRateLimitAndThrowError";
import { ErrorCode } from "@calcom/lib/errorCodes";
import { ErrorWithCode } from "@calcom/lib/errors";
import getIP from "@calcom/lib/getIP";
import { HttpError } from "@calcom/lib/http-error";
import { defaultResponder } from "@calcom/lib/server/defaultResponder";
import { piiHasher } from "@calcom/lib/server/PiiHasher";
import type { NextApiRequest } from "next";
import { z } from "zod";

const tokenSchema = z.object({ token: z.string().min(1).max(200) });

const FAILURE_MESSAGES = {
  invalid: "This link isn't valid.",
  deadline_passed: "The confirmation deadline has passed.",
  booking_cancelled: "This booking was cancelled.",
} as const;

// GET only reads, so email link scanners prefetching the link never confirm on someone's behalf.
async function handler(req: NextApiRequest) {
  await checkRateLimitAndThrowError({
    rateLimitingType: "core",
    identifier: `attendanceConfirm:${piiHasher.hash(getIP(req))}`,
  });
  const service = getAttendeeConfirmationService();

  if (req.method === "GET") {
    const parsed = tokenSchema.safeParse(req.query);
    if (!parsed.success) throw new ErrorWithCode(ErrorCode.BadRequest, "Missing token");
    const record = await service.getByToken(parsed.data.token);
    if (!record) throw new ErrorWithCode(ErrorCode.NotFound, FAILURE_MESSAGES.invalid);
    return {
      status: record.status,
      deadline: record.deadline.toISOString(),
      bookingStatus: record.booking.status,
      bookingUid: record.booking.uid,
      startTime: record.booking.startTime.toISOString(),
      timeZone: record.booking.attendees[0]?.timeZone ?? "UTC",
      eventTitle: record.booking.eventType?.title ?? record.booking.title,
      hostName: record.booking.user?.name ?? null,
    };
  }

  if (req.method === "POST") {
    const parsed = tokenSchema.safeParse(req.body);
    if (!parsed.success) throw new ErrorWithCode(ErrorCode.BadRequest, "Missing token");
    const result = await service.confirm(parsed.data.token);
    if (!result.ok) {
      const code = result.reason === "invalid" ? ErrorCode.NotFound : ErrorCode.BadRequest;
      throw new ErrorWithCode(code, FAILURE_MESSAGES[result.reason], { reason: result.reason });
    }
    return { confirmed: true, alreadyConfirmed: result.alreadyConfirmed };
  }

  throw new HttpError({ statusCode: 405, message: "Use GET to view or POST to confirm" });
}

export default defaultResponder(handler, "/api/attendance/confirm");
