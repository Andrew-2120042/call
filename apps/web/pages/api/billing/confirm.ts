import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { getPlanService } from "@calcom/features/plans/lib/getPlanService";
import { HttpError } from "@calcom/lib/http-error";
import { defaultResponder } from "@calcom/lib/server/defaultResponder";
import type { NextApiRequest } from "next";
import { z } from "zod";

const bodySchema = z.object({ subscriptionId: z.string().min(1).max(100) });

/** After checkout: checks the payment with the provider and switches the plan right away. */
async function handler(req: NextApiRequest) {
  if (req.method !== "POST") throw new HttpError({ statusCode: 405, message: "Use POST" });
  const session = await getServerSession({ req });
  if (!session?.user?.id) throw new HttpError({ statusCode: 401, message: "Log in first" });
  const { subscriptionId } = bodySchema.parse(req.body);
  return getPlanService().confirmCheckout(session.user.id, subscriptionId);
}

export default defaultResponder(handler, "/api/billing/confirm");
