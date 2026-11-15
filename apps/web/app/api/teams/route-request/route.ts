import { getTeamRoutingService } from "@calcom/features/teams/lib/getTeamRoutingService";
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
  teamSlug: z.string().min(1).max(100),
  message: z.string().trim().min(3).max(1000),
});

// Public: a visitor on a team page describes what they need and is pointed at a service or person.
async function handler(req: NextRequest) {
  await checkRateLimitAndThrowError({
    rateLimitingType: "core",
    identifier: `teamRouting:${piiHasher.hash(getIP(req))}`,
  });
  const parsed = bodySchema.safeParse(await parseRequestData(req));
  if (!parsed.success) throw new ErrorWithCode(ErrorCode.BadRequest, "Tell us a little about what you need");
  const service = getTeamRoutingService();
  if (!service.isEnabled) return NextResponse.json({ message: "Routing is not available" }, { status: 503 });
  const result = await service.route(parsed.data);
  if (!result) return NextResponse.json({ service: null, member: null, reason: null });
  return NextResponse.json(result);
}

export const POST = defaultResponderForAppDir(handler);
