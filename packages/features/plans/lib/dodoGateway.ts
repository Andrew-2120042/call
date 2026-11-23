import type { IBillingGateway } from "../services/PlanService";
import { dodoSubscriptionEventSchema, toSubscriptionEvent } from "./dodoWebhook";

const BASE_URLS = {
  live_mode: "https://live.dodopayments.com",
  test_mode: "https://test.dodopayments.com",
} as const;

export type DodoEnvironment = keyof typeof BASE_URLS;

type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

/** Thin REST client for the Dodo Payments calls billing needs: checkout, reading and changing a subscription, portal. */
export function createDodoGateway(options: {
  apiKey: string;
  environment: DodoEnvironment;
  fetchImpl?: FetchLike;
}): IBillingGateway {
  const doFetch = options.fetchImpl ?? fetch;
  const post = async <T>(path: string, body?: Record<string, unknown>): Promise<T> => {
    const response = await doFetch(`${BASE_URLS[options.environment]}${path}`, {
      method: "POST",
      headers: { authorization: `Bearer ${options.apiKey}`, "content-type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`Dodo ${path.split("?")[0]} failed with ${response.status}: ${detail.slice(0, 300)}`);
    }
    return (await response.json()) as T;
  };

  return {
    async createCheckoutUrl({ productId, userId, email, successUrl, returnUrl, appUrl }) {
      const session = await post<{ checkout_url: string | null }>("/checkouts", {
        product_cart: [{ product_id: productId, quantity: 1 }],
        customer: { email },
        return_url: successUrl,
        cancel_url: returnUrl,
        // Read back from subscription webhooks to know whose plan to change.
        metadata: { nodslotUserId: String(userId), nodslotApp: appUrl },
      });
      if (!session.checkout_url) throw new Error("Dodo did not return a checkout URL");
      return session.checkout_url;
    },
    async getSubscription(subscriptionId) {
      const response = await doFetch(
        `${BASE_URLS[options.environment]}/subscriptions/${encodeURIComponent(subscriptionId)}`,
        { headers: { authorization: `Bearer ${options.apiKey}` }, signal: AbortSignal.timeout(15_000) }
      );
      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`Dodo /subscriptions failed with ${response.status}`);
      const parsed = dodoSubscriptionEventSchema.safeParse({
        type: "subscription.updated",
        timestamp: new Date().toISOString(),
        data: await response.json(),
      });
      return parsed.success ? toSubscriptionEvent(parsed.data) : null;
    },
    async changePlan({ subscriptionId, productId }) {
      const result = await post<{ payment_link?: string | null }>(
        `/subscriptions/${encodeURIComponent(subscriptionId)}/change-plan`,
        // Charge only the difference for the rest of this month; the next renewal is at the Team price.
        { product_id: productId, quantity: 1, proration_billing_mode: "prorated_immediately" }
      );
      return { paymentUrl: result.payment_link ?? null };
    },
    async createPortalUrl({ customerId, returnUrl }) {
      const query = new URLSearchParams({ return_url: returnUrl });
      const session = await post<{ link: string }>(
        `/customers/${encodeURIComponent(customerId)}/customer-portal/session?${query.toString()}`
      );
      return session.link;
    },
  };
}
