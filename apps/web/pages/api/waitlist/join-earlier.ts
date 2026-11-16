import { getWaitlistService } from "@calcom/features/waitlist/lib/getWaitlistService";
import { checkRateLimitAndThrowError } from "@calcom/lib/checkRateLimitAndThrowError";
import { ErrorCode } from "@calcom/lib/errorCodes";
import { ErrorWithCode } from "@calcom/lib/errors";
import getIP from "@calcom/lib/getIP";
import { HttpError } from "@calcom/lib/http-error";
import { defaultResponder } from "@calcom/lib/server/defaultResponder";
import { piiHasher } from "@calcom/lib/server/PiiHasher";
import type { NextApiRequest } from "next";
import { z } from "zod";

const schema = z.object({
  bookingUid: z.string().min(1).max(100),
  language: z.string().min(2).max(10).optional(),
});

// "Tell me if an earlier time opens" from a client's own booking page. Everything about the person comes
// from the booking, so the booking link is the only thing needed (the same link that lets them cancel).
async function handler(req: NextApiRequest) {
  if (req.method !== "POST") throw new HttpError({ statusCode: 405, message: "Use POST" });
  await checkRateLimitAndThrowError({
    rateLimitingType: "core",
    identifier: `joinWaitlistEarlier:${piiHasher.hash(getIP(req))}`,
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) throw new ErrorWithCode(ErrorCode.BadRequest, "bookingUid is required");
  const result = await getWaitlistService().joinEarlier(parsed.data);
  return { uid: result.entry.uid, alreadyJoined: result.alreadyJoined };
}

export default defaultResponder(handler, "/api/waitlist/join-earlier");
