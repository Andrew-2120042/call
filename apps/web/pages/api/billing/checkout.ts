import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { getPlanService } from "@calcom/features/plans/lib/getPlanService";
import { ErrorCode } from "@calcom/lib/errorCodes";
import { ErrorWithCode } from "@calcom/lib/errors";
import { HttpError } from "@calcom/lib/http-error";
import { defaultResponder } from "@calcom/lib/server/defaultResponder";
import type { NextApiRequest } from "next";
import { z } from "zod";

const checkoutSchema = z.object({ plan: z.enum(["pro", "team"]) });

async function handler(req: NextApiRequest) {
  if (req.method !== "POST")
    throw new HttpError({ statusCode: 405, message: "Use POST to start a checkout" });
  const session = await getServerSession({ req });
  if (!session?.user?.id || !session.user.email)
    throw new HttpError({ statusCode: 401, message: "Log in first" });
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) throw new ErrorWithCode(ErrorCode.BadRequest, "Choose the pro or team plan");
  const url = await getPlanService().startCheckout({
    userId: session.user.id,
    email: session.user.email,
    plan: parsed.data.plan,
  });
  return { url };
}

export default defaultResponder(handler, "/api/billing/checkout");
