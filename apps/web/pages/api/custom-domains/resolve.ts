import { getCustomDomainService } from "@calcom/features/custom-domains/lib/getCustomDomainService";
import { HttpError } from "@calcom/lib/http-error";
import { defaultResponder } from "@calcom/lib/server/defaultResponder";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const querySchema = z.object({ host: z.string().min(1).max(260) });

// Called by the proxy for requests on custom domains. Only exposes which public booking page a
// verified domain points at, which anyone can already see by visiting the domain.
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") throw new HttpError({ statusCode: 405, message: "Use GET" });
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) throw new HttpError({ statusCode: 400, message: "host is required" });
  const resolution = await getCustomDomainService().resolve(parsed.data.host);
  res.setHeader("Cache-Control", "public, max-age=60");
  return resolution;
}

export default defaultResponder(handler);
