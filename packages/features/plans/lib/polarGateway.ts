import type { IPolarGateway } from "../services/PlanService";

const BASE_URLS = {
  production: "https://api.polar.sh/v1",
  sandbox: "https://sandbox-api.polar.sh/v1",
} as const;

export type PolarEnvironment = keyof typeof BASE_URLS;

type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

/** Thin REST client for the two Polar calls billing needs (checkout session, customer portal session). */
export function createPolarGateway(options: {
  accessToken: string;
  environment: PolarEnvironment;
  fetchImpl?: FetchLike;
}): IPolarGateway {
  const doFetch = options.fetchImpl ?? fetch;
  const post = async <T>(path: string, body: Record<string, unknown>): Promise<T> => {
    const response = await doFetch(`${BASE_URLS[options.environment]}${path}`, {
      method: "POST",
      headers: { authorization: `Bearer ${options.accessToken}`, "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`Polar ${path} failed with ${response.status}: ${detail.slice(0, 300)}`);
    }
    return (await response.json()) as T;
  };

  return {
    async createCheckoutUrl({ productId, userId, email, successUrl, returnUrl }) {
      const checkout = await post<{ url: string }>("/checkouts/", {
        products: [productId],
        external_customer_id: String(userId),
        customer_email: email,
        success_url: successUrl,
        return_url: returnUrl,
        metadata: { nodslotUserId: String(userId) },
      });
      return checkout.url;
    },
    async createPortalUrl({ userId, returnUrl }) {
      const session = await post<{ customer_portal_url: string }>("/customer-sessions/", {
        external_customer_id: String(userId),
        return_url: returnUrl,
      });
      return session.customer_portal_url;
    },
  };
}
