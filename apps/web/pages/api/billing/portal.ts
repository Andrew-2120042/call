import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { getPlanService } from "@calcom/features/plans/lib/getPlanService";
import { HttpError } from "@calcom/lib/http-error";
import { defaultResponder } from "@calcom/lib/server/defaultResponder";
import type { NextApiRequest } from "next";

async function handler(req: NextApiRequest) {
  if (req.method !== "POST")
    throw new HttpError({ statusCode: 405, message: "Use POST to open the billing portal" });
  const session = await getServerSession({ req });
  if (!session?.user?.id) throw new HttpError({ statusCode: 401, message: "Log in first" });
  return { url: await getPlanService().openPortal(session.user.id) };
}

export default defaultResponder(handler, "/api/billing/portal");
