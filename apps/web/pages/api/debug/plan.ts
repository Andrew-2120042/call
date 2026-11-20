import process from "node:process";
import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { getPlanService } from "@calcom/features/plans/lib/getPlanService";
import { HttpError } from "@calcom/lib/http-error";
import { defaultResponder } from "@calcom/lib/server/defaultResponder";
import { NodslotPlan } from "@calcom/prisma/enums";
import type { NextApiRequest } from "next";
import { z } from "zod";

const bodySchema = z.object({ plan: z.nativeEnum(NodslotPlan) });

/** Dev-only plan switcher for trying the app as Free, Pro or Team. Does not exist in production builds. */
async function handler(req: NextApiRequest) {
  if (process.env.NODE_ENV !== "development") throw new HttpError({ statusCode: 404, message: "Not found" });
  if (req.method !== "POST") throw new HttpError({ statusCode: 405, message: "Use POST" });
  const session = await getServerSession({ req });
  if (!session?.user?.id) throw new HttpError({ statusCode: 401, message: "Log in first" });
  const { plan } = bodySchema.parse(req.body);
  await getPlanService().setPlanForTesting(session.user.id, plan);
  return { plan };
}

export default defaultResponder(handler, "/api/debug/plan");
