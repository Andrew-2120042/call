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

const tokenSchema = z.object({ token: z.string().min(1).max(200) });

const CLAIM_FAILURE_MESSAGES = {
  invalid: "This link isn't valid.",
  expired: "This offer has expired and the time was offered to the next person.",
  already_claimed: "This time has already been claimed with this link.",
  slot_unavailable: "Someone else just took this time. You're still on the waitlist.",
  taken_by_someone_else: "Someone else claimed this time first. You're still on the waitlist.",
} as const;

// GET only reads the offer so email link scanners that prefetch links can never claim a slot.
async function handler(req: NextApiRequest) {
  const userIp = getIP(req);
  await checkRateLimitAndThrowError({
    rateLimitingType: "core",
    identifier: `waitlistClaim:${piiHasher.hash(userIp)}`,
  });

  const service = getWaitlistService();

  if (req.method === "GET") {
    const parsed = tokenSchema.safeParse(req.query);
    if (!parsed.success) throw new ErrorWithCode(ErrorCode.BadRequest, "Missing token");
    const offer = await service.getOffer(parsed.data.token);
    if (!offer) throw new ErrorWithCode(ErrorCode.NotFound, CLAIM_FAILURE_MESSAGES.invalid);
    return {
      status: offer.entry.status,
      isClaimable: offer.isClaimable,
      isExpired: offer.isExpired,
      takenBySomeoneElse: offer.takenBySomeoneElse,
      kind: offer.entry.kind,
      firstComeFirstServed: offer.eventType.waitlistOfferMode === "EVERYONE",
      startTime: offer.entry.startTime.toISOString(),
      endTime: offer.entry.endTime.toISOString(),
      timeZone: offer.entry.timeZone,
      offerExpiresAt: offer.entry.offerExpiresAt?.toISOString() ?? null,
      eventTitle: offer.eventType.title,
      hostName: offer.eventType.owner?.name ?? null,
    };
  }

  if (req.method === "POST") {
    const parsed = tokenSchema.safeParse(req.body);
    if (!parsed.success) throw new ErrorWithCode(ErrorCode.BadRequest, "Missing token");
    const result = await service.claim(parsed.data.token);
    if (!result.ok) {
      const code = result.reason === "invalid" ? ErrorCode.NotFound : ErrorCode.BadRequest;
      throw new ErrorWithCode(code, CLAIM_FAILURE_MESSAGES[result.reason], { reason: result.reason });
    }
    return { bookingUid: result.bookingUid, bookingStatus: result.bookingStatus };
  }

  throw new HttpError({ statusCode: 405, message: "Use GET to view an offer or POST to claim it" });
}

export default defaultResponder(handler, "/api/waitlist/claim");
