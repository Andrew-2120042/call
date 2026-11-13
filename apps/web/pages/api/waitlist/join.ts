import { getWaitlistService } from "@calcom/features/waitlist/lib/getWaitlistService";
import { validateWaitlistResponses } from "@calcom/features/waitlist/lib/validateWaitlistResponses";
import { checkRateLimitAndThrowError } from "@calcom/lib/checkRateLimitAndThrowError";
import { ErrorCode } from "@calcom/lib/errorCodes";
import { ErrorWithCode } from "@calcom/lib/errors";
import getIP from "@calcom/lib/getIP";
import { HttpError } from "@calcom/lib/http-error";
import { defaultResponder } from "@calcom/lib/server/defaultResponder";
import { piiHasher } from "@calcom/lib/server/PiiHasher";
import type { NextApiRequest } from "next";
import { z } from "zod";

const joinWaitlistSchema = z.object({
  eventTypeId: z.number().int().positive(),
  start: z.string().datetime(),
  end: z.string().datetime(),
  timeZone: z.string().min(1).max(64),
  language: z.string().min(2).max(10).default("en"),
  responses: z
    .object({
      name: z.string().trim().min(1).max(200),
      email: z.string().trim().email().max(320),
    })
    .passthrough(),
});

async function handler(req: NextApiRequest) {
  if (req.method !== "POST") {
    throw new HttpError({ statusCode: 405, message: "Use POST to join a waitlist" });
  }

  const userIp = getIP(req);
  await checkRateLimitAndThrowError({
    rateLimitingType: "core",
    identifier: `joinWaitlist:${piiHasher.hash(userIp)}`,
  });

  const parsed = joinWaitlistSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ErrorWithCode(
      ErrorCode.BadRequest,
      parsed.error.issues.map((issue) => issue.message).join(", ")
    );
  }
  const { eventTypeId, start, end, timeZone, language, responses } = parsed.data;

  const validated = await validateWaitlistResponses(eventTypeId, responses);
  if (!validated.ok) throw new ErrorWithCode(ErrorCode.BadRequest, validated.errors.join(", "));

  const result = await getWaitlistService().join({
    eventTypeId,
    startTime: new Date(start),
    endTime: new Date(end),
    name: responses.name,
    email: responses.email,
    timeZone,
    language,
    responses: validated.responses,
  });

  return {
    uid: result.entry.uid,
    position: result.position,
    alreadyJoined: result.alreadyJoined,
  };
}

export default defaultResponder(handler, "/api/waitlist/join");
