import process from "node:process";
import { getPlanService } from "@calcom/features/plans/lib/getPlanService";
import { PolarWebhookSignatureError, verifyPolarWebhook } from "@calcom/features/plans/lib/polarWebhook";
import logger from "@calcom/lib/logger";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const log = logger.getSubLogger({ prefix: ["[polar-webhook]"] });

// The signature is computed over the exact bytes Polar sent, so Next.js must not parse the body.
export const config = { api: { bodyParser: false } };

const MAX_BODY_BYTES = 1_000_000;

const subscriptionEventSchema = z.object({
  type: z.string(),
  data: z.object({
    id: z.string(),
    status: z.string(),
    product_id: z.string(),
    customer_id: z.string(),
    current_period_end: z.string().nullable(),
    cancel_at_period_end: z.boolean(),
    modified_at: z.string().nullable(),
    created_at: z.string(),
    customer: z.object({ external_id: z.string().nullable().optional() }).passthrough().nullable().optional(),
    metadata: z.record(z.unknown()).nullable().optional(),
  }),
});

async function readRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = typeof chunk === "string" ? Buffer.from(chunk) : (chunk as Buffer);
    size += buffer.length;
    if (size > MAX_BODY_BYTES) throw new Error("Webhook body too large");
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}

const header = (req: NextApiRequest, name: string) => {
  const value = req.headers[name];
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) {
    log.error("POLAR_WEBHOOK_SECRET is not set; rejecting webhook");
    return res.status(503).json({ message: "Billing webhooks aren't configured" });
  }

  let event: { type?: unknown; data?: unknown };
  try {
    const body = await readRawBody(req);
    event = verifyPolarWebhook({
      body,
      headers: {
        "webhook-id": header(req, "webhook-id"),
        "webhook-timestamp": header(req, "webhook-timestamp"),
        "webhook-signature": header(req, "webhook-signature"),
      },
      secret,
    }) as { type?: unknown; data?: unknown };
  } catch (error) {
    if (error instanceof PolarWebhookSignatureError) {
      return res.status(403).json({ message: "Invalid webhook signature" });
    }
    log.error("Failed to read webhook", error);
    return res.status(400).json({ message: "Invalid webhook payload" });
  }

  const parsed = subscriptionEventSchema.safeParse(event);
  if (typeof event.type !== "string" || !event.type.startsWith("subscription.")) {
    return res.status(202).json({ received: true, ignored: true });
  }
  if (!parsed.success) {
    log.error("Subscription webhook with unexpected shape", parsed.error.issues);
    return res.status(400).json({ message: "Invalid subscription payload" });
  }

  // Errors here propagate as 500 so Polar retries the delivery.
  const outcome = await getPlanService().applySubscriptionEvent(parsed.data);
  return res.status(200).json({ received: true, outcome });
}
