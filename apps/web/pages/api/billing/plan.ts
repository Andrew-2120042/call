import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { getPlanService } from "@calcom/features/plans/lib/getPlanService";
import { HttpError } from "@calcom/lib/http-error";
import { defaultResponder } from "@calcom/lib/server/defaultResponder";
import type { NextApiRequest } from "next";

async function handler(req: NextApiRequest) {
  if (req.method !== "GET") throw new HttpError({ statusCode: 405, message: "Use GET" });
  const session = await getServerSession({ req });
  if (!session?.user?.id) throw new HttpError({ statusCode: 401, message: "Log in first" });
  return getPlanService().getPlanSummary(session.user.id);
}

export default defaultResponder(handler, "/api/billing/plan");
