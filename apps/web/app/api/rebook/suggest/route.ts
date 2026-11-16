import { getRebookSuggestionService } from "@calcom/features/rebook/lib/getRebookSuggestionService";
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
  timeZone: z.string().min(1).max(100),
  candidates: z.array(z.string().datetime()).max(400),
});

// Public: the client who cancelled is offered a few new times, chosen from the slots their booking page shows.
async function handler(req: NextRequest) {
  await checkRateLimitAndThrowError({
    rateLimitingType: "core",
    identifier: `rebookSuggest:${piiHasher.hash(getIP(req))}`,
  });
  const parsed = bodySchema.safeParse(await parseRequestData(req));
  if (!parsed.success) throw new ErrorWithCode(ErrorCode.BadRequest, "Invalid request");
  return NextResponse.json(await getRebookSuggestionService().suggest(parsed.data));
}

export const POST = defaultResponderForAppDir(handler);
