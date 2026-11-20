import { getRebookBookingService } from "@calcom/features/rebook/lib/getRebookBookingService";
import { checkRateLimitAndThrowError } from "@calcom/lib/checkRateLimitAndThrowError";
import { ErrorCode } from "@calcom/lib/errorCodes";
import { ErrorWithCode } from "@calcom/lib/errors";
import getIP from "@calcom/lib/getIP";
import { piiHasher } from "@calcom/lib/server/PiiHasher";
import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import { parseRequestData } from "app/api/parseRequestData";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  bookingUid: z.string().min(1).max(100),
  start: z.string().datetime(),
});

// Public: the client who cancelled rebooks one of the host's open times with the details they already gave.
async function handler(req: NextRequest) {
  await checkRateLimitAndThrowError({
    rateLimitingType: "core",
    identifier: `rebookBook:${piiHasher.hash(getIP(req))}`,
  });
  const parsed = bodySchema.safeParse(await parseRequestData(req));
  if (!parsed.success) throw new ErrorWithCode(ErrorCode.BadRequest, "Invalid request");
  const result = await getRebookBookingService().book({
    bookingUid: parsed.data.bookingUid,
    start: new Date(parsed.data.start),
  });
  if (!result.ok) throw new ErrorWithCode(ErrorCode.BadRequest, result.reason);
  return NextResponse.json(result);
}

export const POST = defaultResponderForAppDir(handler);
