import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { getFeedbackService } from "@calcom/features/feedback/lib/getFeedbackService";
import { FEEDBACK_KINDS, MAX_FEEDBACK_LENGTH } from "@calcom/features/feedback/services/FeedbackService";
import { checkRateLimitAndThrowError } from "@calcom/lib/checkRateLimitAndThrowError";
import { ErrorCode } from "@calcom/lib/errorCodes";
import { ErrorWithCode } from "@calcom/lib/errors";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import { parseRequestData } from "app/api/parseRequestData";
import { cookies, headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  kind: z.enum(FEEDBACK_KINDS),
  message: z.string().trim().min(3).max(MAX_FEEDBACK_LENGTH),
  page: z.string().max(300).optional(),
});

async function handler(req: NextRequest) {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) throw new ErrorWithCode(ErrorCode.Unauthorized, "Sign in to send feedback");
  await checkRateLimitAndThrowError({ rateLimitingType: "core", identifier: `feedback:${session.user.id}` });
  const parsed = bodySchema.safeParse(await parseRequestData(req));
  if (!parsed.success) throw new ErrorWithCode(ErrorCode.BadRequest, "Write a few words so we can help");
  await getFeedbackService().submit({ userId: session.user.id, ...parsed.data });
  return NextResponse.json({ ok: true });
}

export const POST = defaultResponderForAppDir(handler);
