import { z } from "zod";
import type { SubscriptionEvent } from "../services/PlanService";

/** Dodo's subscription statuses, in the vocabulary getEffectivePlan already understands. */
const STATUS: Record<string, string> = {
  active: "active",
  pending: "incomplete",
  on_hold: "past_due",
  past_due: "past_due",
  paused: "paused",
  cancelled: "canceled",
  failed: "failed",
  expired: "expired",
};

export const dodoSubscriptionEventSchema = z.object({
  type: z.string(),
  timestamp: z.string(),
  data: z
    .object({
      subscription_id: z.string(),
      status: z.string(),
      product_id: z.string(),
      next_billing_date: z.string().nullable().optional(),
      cancel_at_next_billing_date: z.boolean().optional(),
      created_at: z.string(),
      customer: z.object({ customer_id: z.string() }).passthrough(),
      metadata: z.record(z.unknown()).nullable().optional(),
    })
    .passthrough(),
});

export type DodoSubscriptionEvent = z.infer<typeof dodoSubscriptionEventSchema>;

/**
 * Maps a verified Dodo subscription webhook onto the event shape PlanService applies. Dodo has no
 * external customer id, so the user comes from the checkout metadata; the event timestamp orders deliveries.
 */
export function toSubscriptionEvent(event: DodoSubscriptionEvent): SubscriptionEvent {
  const { data } = event;
  return {
    type: event.type,
    data: {
      id: data.subscription_id,
      status: STATUS[data.status] ?? data.status,
      product_id: data.product_id,
      customer_id: data.customer.customer_id,
      current_period_end: data.next_billing_date ?? null,
      cancel_at_period_end: data.cancel_at_next_billing_date ?? false,
      modified_at: event.timestamp,
      created_at: data.created_at,
      customer: null,
      metadata: data.metadata ?? null,
    },
  };
}
