import { randomBytes } from "node:crypto";
import { NodslotPlan } from "@calcom/prisma/enums";
import { describe, expect, it, vi } from "vitest";
import { createDodoGateway } from "../lib/dodoGateway";
import { dodoSubscriptionEventSchema, toSubscriptionEvent } from "../lib/dodoWebhook";
import { signPolarWebhookForTest, verifyStandardWebhook } from "../lib/polarWebhook";
import type { IPlanSubscriptionRepository, StoredSubscription } from "../services/PlanService";
import { PlanService } from "../services/PlanService";

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const dodoEvent = (overrides: Record<string, unknown> = {}, type = "subscription.active") => ({
  business_id: "bus_1",
  type,
  timestamp: "2026-11-20T10:00:00Z",
  data: {
    payload_type: "Subscription",
    subscription_id: "sub_dodo_1",
    status: "active",
    product_id: "pdt_pro",
    next_billing_date: "2026-12-20T10:00:00Z",
    previous_billing_date: "2026-11-20T10:00:00Z",
    cancel_at_next_billing_date: false,
    created_at: "2026-11-20T09:59:00Z",
    customer: { customer_id: "cus_1", email: "a@example.com", name: "A" },
    metadata: { nodslotUserId: "4", nodslotApp: "https://app" },
    ...overrides,
  },
});

describe("createDodoGateway", () => {
  it("creates a checkout session for one product, tagged with the user, on the test host", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ session_id: "cks_1", checkout_url: "https://pay/x" }));
    const gateway = createDodoGateway({ apiKey: "dodo_test_k", environment: "test_mode", fetchImpl });
    const url = await gateway.createCheckoutUrl({
      productId: "pdt_pro",
      userId: 4,
      email: "a@example.com",
      successUrl: "https://app/ok",
      returnUrl: "https://app/back",
      appUrl: "https://app",
    });
    expect(url).toBe("https://pay/x");
    const [calledUrl, init] = fetchImpl.mock.calls[0];
    expect(calledUrl).toBe("https://test.dodopayments.com/checkouts");
    expect(init.headers.authorization).toBe("Bearer dodo_test_k");
    expect(JSON.parse(init.body)).toEqual({
      product_cart: [{ product_id: "pdt_pro", quantity: 1 }],
      customer: { email: "a@example.com" },
      return_url: "https://app/ok",
      cancel_url: "https://app/back",
      metadata: { nodslotUserId: "4", nodslotApp: "https://app" },
    });
  });

  it("opens the customer portal for the stored Dodo customer", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ link: "https://portal/y" }));
    const gateway = createDodoGateway({ apiKey: "dodo_live_k", environment: "live_mode", fetchImpl });
    expect(await gateway.createPortalUrl({ userId: 4, customerId: "cus_1", returnUrl: "https://app/b" })).toBe(
      "https://portal/y"
    );
    expect(fetchImpl.mock.calls[0][0]).toBe(
      "https://live.dodopayments.com/customers/cus_1/customer-portal/session?return_url=https%3A%2F%2Fapp%2Fb"
    );
  });

  it("surfaces Dodo errors with the status code", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("bad product", { status: 422 }));
    const gateway = createDodoGateway({ apiKey: "k", environment: "test_mode", fetchImpl });
    await expect(
      gateway.createCheckoutUrl({ productId: "x", userId: 4, email: "a@b.c", successUrl: "s", returnUrl: "r", appUrl: "a" })
    ).rejects.toThrow(/422/);
  });
});

describe("Dodo webhooks", () => {
  it("verifies Standard Webhooks signatures with a whsec_ secret", () => {
    const secret = `whsec_${randomBytes(24).toString("base64")}`;
    const body = JSON.stringify(dodoEvent());
    const headers = signPolarWebhookForTest({ body, secret, scheme: "standard" });
    expect(verifyStandardWebhook({ body: Buffer.from(body), headers, secret })).toEqual(JSON.parse(body));
  });

  it("maps Dodo statuses and dates onto the plan event shape", () => {
    const mapped = toSubscriptionEvent(
      dodoSubscriptionEventSchema.parse(dodoEvent({ status: "on_hold", cancel_at_next_billing_date: true }))
    );
    expect(mapped.data).toMatchObject({
      id: "sub_dodo_1",
      status: "past_due",
      customer_id: "cus_1",
      current_period_end: "2026-12-20T10:00:00Z",
      cancel_at_period_end: true,
      modified_at: "2026-11-20T10:00:00Z",
      metadata: { nodslotUserId: "4", nodslotApp: "https://app" },
    });
  });

  it("puts the user on Pro when Dodo activates their subscription, and back on Free when it expires", async () => {
    let stored: StoredSubscription | null = null;
    const repository: IPlanSubscriptionRepository = {
      findByUserId: async (userId) => (stored?.userId === userId ? stored : null),
      upsertForUser: async (subscription) => {
        stored = subscription;
      },
      userExists: async (userId) => userId === 4,
      deleteForUser: async () => undefined,
      clearBrandingRemoval: vi.fn().mockResolvedValue(undefined),
    };
    const service = new PlanService({
      repository,
      gateway: null,
      productIds: { pro: "pdt_pro", team: "pdt_team" },
      webappUrl: "https://app",
      now: () => new Date("2026-11-21T00:00:00Z"),
    });
    const apply = (event: ReturnType<typeof dodoEvent>) =>
      service.applySubscriptionEvent(toSubscriptionEvent(dodoSubscriptionEventSchema.parse(event)));

    expect(await apply(dodoEvent())).toBe("applied");
    expect(await service.getEffectivePlan(4)).toBe(NodslotPlan.PRO);

    const expired = dodoEvent(
      { status: "expired", next_billing_date: "2026-11-20T12:00:00Z" },
      "subscription.expired"
    );
    expect(await apply({ ...expired, timestamp: "2026-11-20T12:00:00Z" })).toBe("applied");
    expect(await service.getEffectivePlan(4)).toBe(NodslotPlan.FREE);
  });
});

describe("checkout allow-list (test mode on the live site)", () => {
  it("lets only allowed emails open a checkout", async () => {
    const gateway = { createCheckoutUrl: vi.fn().mockResolvedValue("https://pay/x"), createPortalUrl: vi.fn() };
    const service = new PlanService({
      repository: {
        findByUserId: async () => null,
        upsertForUser: async () => undefined,
        userExists: async () => true,
        deleteForUser: async () => undefined,
      clearBrandingRemoval: async () => undefined,
      },
      gateway,
      productIds: { pro: "pdt_pro" },
      webappUrl: "https://app",
      canCheckout: (email) => email === "owner@example.com",
    });
    await expect(service.startCheckout({ userId: 1, email: "someone@example.com", plan: "pro" })).rejects.toThrow(
      /being tested/
    );
    expect(await service.startCheckout({ userId: 2, email: "owner@example.com", plan: "pro" })).toBe("https://pay/x");
  });
});

describe("14-day trial", () => {
  const build = (now: Date) => {
    let stored: StoredSubscription | null = null;
    const service = new PlanService({
      repository: {
        findByUserId: async (userId) => (stored?.userId === userId ? stored : null),
        upsertForUser: async (subscription) => {
          stored = subscription;
        },
        userExists: async () => true,
        deleteForUser: async () => undefined,
      clearBrandingRemoval: async () => undefined,
      },
      gateway: null,
      productIds: {},
      webappUrl: "https://app",
      now: () => now,
    });
    return service;
  };

  it("gives Pro for 14 days, once, then Free", async () => {
    const start = new Date("2026-11-20T00:00:00Z");
    const service = build(start);
    expect((await service.getPlanSummary(4)).trialAvailable).toBe(true);
    await service.startTrial(4);
    expect(await service.getEffectivePlan(4)).toBe(NodslotPlan.PRO);
    expect(await service.hasFeature(4, "waitlist")).toBe(true);
    expect((await service.getPlanSummary(4)).trialAvailable).toBe(false);
    await expect(service.startTrial(4)).rejects.toThrow(/only be used once/);
  });

  it("ends after 14 days", async () => {
    const start = new Date("2026-11-20T00:00:00Z");
    let now = start;
    let stored: StoredSubscription | null = null;
    const service = new PlanService({
      repository: {
        findByUserId: async () => stored,
        upsertForUser: async (subscription) => {
          stored = subscription;
        },
        userExists: async () => true,
        deleteForUser: async () => undefined,
      clearBrandingRemoval: async () => undefined,
      },
      gateway: null,
      productIds: {},
      webappUrl: "https://app",
      now: () => now,
    });
    await service.startTrial(4);
    now = new Date("2026-12-05T00:00:00Z");
    expect(await service.getEffectivePlan(4)).toBe(NodslotPlan.FREE);
  });
});

describe("confirming a checkout on return", () => {
  const setup = (subscription: ReturnType<typeof dodoEvent> | null) => {
    let stored: StoredSubscription | null = null;
    const service = new PlanService({
      repository: {
        findByUserId: async (userId) => (stored?.userId === userId ? stored : null),
        upsertForUser: async (s) => {
          stored = s;
        },
        deleteForUser: async () => undefined,
        userExists: async () => true,
        clearBrandingRemoval: async () => undefined,
      },
      gateway: {
        createCheckoutUrl: vi.fn(),
        createPortalUrl: vi.fn(),
        getSubscription: async () =>
          subscription ? toSubscriptionEvent(dodoSubscriptionEventSchema.parse(subscription)) : null,
      },
      productIds: { pro: "pdt_pro" },
      webappUrl: "https://app",
      now: () => new Date("2026-11-21T00:00:00Z"),
    });
    return service;
  };

  it("switches the plan straight away for the paying user", async () => {
    const service = setup(dodoEvent());
    const result = await service.confirmCheckout(4, "sub_dodo_1");
    expect(result.outcome).toBe("applied");
    expect(result.summary.plan).toBe(NodslotPlan.PRO);
  });

  it("refuses to apply someone else's payment", async () => {
    await expect(setup(dodoEvent()).confirmCheckout(5, "sub_dodo_1")).rejects.toThrow(/different account/);
  });
});
