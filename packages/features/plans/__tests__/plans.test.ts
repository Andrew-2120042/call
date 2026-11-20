import { NodslotPlan } from "@calcom/prisma/enums";
import { describe, expect, it, vi } from "vitest";
import { getEffectivePlan, getPlanLimits, planHasFeature } from "../lib/entitlements";
import { getEventTypePlanViolations } from "../lib/eventTypePlanGuard";
import {
  type IPlanSubscriptionRepository,
  PlanService,
  type SubscriptionEvent,
  type StoredSubscription,
} from "../services/PlanService";

const NOW = new Date("2026-11-13T12:00:00.000Z");
const LATER = new Date("2026-12-13T12:00:00.000Z");
const EARLIER = new Date("2026-11-01T12:00:00.000Z");

describe("entitlements", () => {
  it("gives Free approvals and questions, and keeps the income-protecting features for Pro", () => {
    expect(planHasFeature(NodslotPlan.FREE, "approvalRequests")).toBe(true);
    expect(planHasFeature(NodslotPlan.FREE, "waitlist")).toBe(false);
    expect(planHasFeature(NodslotPlan.FREE, "confirmOrRelease")).toBe(false);
    expect(planHasFeature(NodslotPlan.FREE, "customDomain")).toBe(false);
    expect(planHasFeature(NodslotPlan.PRO, "waitlist")).toBe(true);
    expect(planHasFeature(NodslotPlan.PRO, "teamScheduling")).toBe(false);
    expect(planHasFeature(NodslotPlan.TEAM, "teamScheduling")).toBe(true);
    expect(getPlanLimits(NodslotPlan.FREE)).toEqual({
      maxScreeningQuestionsPerService: 50,
      maxRemindersPerService: 1,
    });
  });

  it.each([
    [null, NodslotPlan.FREE],
    [{ plan: NodslotPlan.PRO, status: "active", currentPeriodEnd: LATER }, NodslotPlan.PRO],
    [{ plan: NodslotPlan.PRO, status: "trialing", currentPeriodEnd: null }, NodslotPlan.PRO],
    [{ plan: NodslotPlan.PRO, status: "canceled", currentPeriodEnd: LATER }, NodslotPlan.PRO],
    [{ plan: NodslotPlan.PRO, status: "canceled", currentPeriodEnd: EARLIER }, NodslotPlan.FREE],
    [{ plan: NodslotPlan.PRO, status: "past_due", currentPeriodEnd: LATER }, NodslotPlan.PRO],
    [{ plan: NodslotPlan.PRO, status: "past_due", currentPeriodEnd: EARLIER }, NodslotPlan.FREE],
    [{ plan: NodslotPlan.PRO, status: "revoked", currentPeriodEnd: LATER }, NodslotPlan.FREE],
    [{ plan: NodslotPlan.PRO, status: "unpaid", currentPeriodEnd: LATER }, NodslotPlan.FREE],
  ])("effective plan for %j is %s", (subscription, expected) => {
    expect(getEffectivePlan(subscription, NOW)).toBe(expected);
  });
});

describe("getEventTypePlanViolations", () => {
  const question = { editable: "user" };
  const system = { editable: "system" };

  it("blocks Free users from turning paid settings on", () => {
    const violations = getEventTypePlanViolations(
      NodslotPlan.FREE,
      {
        requiresConfirmation: true,
        waitlistEnabled: true,
        attendeeConfirmationHours: 24,
        attendeeReminderMinutes: [1440, 60],
      },
      { attendeeReminderMinutes: [1440] }
    );
    // Approval is free; the rest are Pro.
    expect(violations.map((v) => v.field)).toEqual([
      "waitlistEnabled",
      "attendeeConfirmationHours",
      "attendeeReminderMinutes",
    ]);
  });

  it("lets a downgraded user save unrelated changes and turn things off", () => {
    const current = {
      requiresConfirmation: true,
      waitlistEnabled: true,
      attendeeConfirmationHours: 24,
      attendeeReminderMinutes: [1440, 60],
    };
    expect(getEventTypePlanViolations(NodslotPlan.FREE, { ...current }, current)).toEqual([]);
    expect(
      getEventTypePlanViolations(
        NodslotPlan.FREE,
        { waitlistEnabled: false, attendeeConfirmationHours: null },
        current
      )
    ).toEqual([]);
  });

  it("caps custom screening questions at the plan limit and ignores system fields", () => {
    const tooMany = [system, ...Array.from({ length: 51 }, () => question)];
    expect(
      getEventTypePlanViolations(NodslotPlan.FREE, { bookingFields: tooMany }, { bookingFields: [] })
    ).toHaveLength(1);
    expect(
      getEventTypePlanViolations(
        NodslotPlan.FREE,
        { bookingFields: [system, system, question, question, question] },
        {}
      )
    ).toEqual([]);
    // Saving a service that is already over the limit is allowed as long as it doesn't grow.
    expect(
      getEventTypePlanViolations(NodslotPlan.FREE, { bookingFields: tooMany }, { bookingFields: tooMany })
    ).toEqual([]);
  });

  it("allows everything on Pro", () => {
    expect(
      getEventTypePlanViolations(
        NodslotPlan.PRO,
        {
          requiresConfirmation: true,
          waitlistEnabled: true,
          attendeeConfirmationHours: 12,
          attendeeReminderMinutes: [1440, 60, 15],
        },
        {}
      )
    ).toEqual([]);
  });
});

describe("PlanService", () => {
  const setup = (opts: { existing?: StoredSubscription; polar?: boolean } = {}) => {
    let stored: StoredSubscription | null = opts.existing ?? null;
    const repository: IPlanSubscriptionRepository = {
      findByUserId: async (userId) => (stored?.userId === userId ? stored : null),
      upsertForUser: async (subscription) => {
        stored = subscription;
      },
      userExists: async (userId) => userId === 4,
      clearBrandingRemoval: vi.fn().mockResolvedValue(undefined),
    };
    const polar = opts.polar
      ? {
          createCheckoutUrl: vi.fn().mockResolvedValue("https://polar.test/checkout/abc"),
          createPortalUrl: vi.fn().mockResolvedValue("https://polar.test/portal/xyz"),
        }
      : null;
    const service = new PlanService({
      repository,
      gateway: polar,
      productIds: { pro: "prod_pro", team: "prod_team" },
      webappUrl: "https://app.test",
      now: () => NOW,
    });
    return {
      service,
      polar,
      repository,
      get stored() {
        return stored;
      },
    };
  };

  const event = (
    overrides: Partial<SubscriptionEvent["data"]> = {},
    type = "subscription.active"
  ): SubscriptionEvent => ({
    type,
    data: {
      id: "sub_1",
      status: "active",
      product_id: "prod_pro",
      customer_id: "cus_1",
      current_period_end: LATER.toISOString(),
      cancel_at_period_end: false,
      modified_at: "2026-11-13T10:00:00.000Z",
      created_at: "2026-11-13T09:00:00.000Z",
      customer: { external_id: "4" },
      ...overrides,
    },
  });

  it("upgrades a user to Pro on an active subscription", async () => {
    const ctx = setup();
    expect(await ctx.service.applySubscriptionEvent(event())).toBe("applied");
    expect(await ctx.service.getEffectivePlan(4)).toBe(NodslotPlan.PRO);
    expect(await ctx.service.hasFeature(4, "waitlist")).toBe(true);
  });

  it("ignores stale and duplicate deliveries", async () => {
    const ctx = setup();
    await ctx.service.applySubscriptionEvent(
      event({ status: "canceled", modified_at: "2026-11-13T11:00:00.000Z" }, "subscription.canceled")
    );
    expect(await ctx.service.applySubscriptionEvent(event())).toBe("ignored_stale");
    expect(ctx.stored?.status).toBe("canceled");
  });

  it("drops to Free when the subscription is revoked", async () => {
    const ctx = setup();
    await ctx.service.applySubscriptionEvent(event());
    await ctx.service.applySubscriptionEvent(
      event({ status: "revoked", modified_at: "2026-11-13T11:00:00.000Z" }, "subscription.revoked")
    );
    expect(await ctx.service.getEffectivePlan(4)).toBe(NodslotPlan.FREE);
  });

  it("switches branding removal back off on downgrade but not while paid", async () => {
    const ctx = setup();
    await ctx.service.applySubscriptionEvent(event());
    expect(ctx.repository.clearBrandingRemoval).not.toHaveBeenCalled();
    await ctx.service.applySubscriptionEvent(
      event({ status: "revoked", modified_at: "2026-11-13T11:00:00.000Z" }, "subscription.revoked")
    );
    expect(ctx.repository.clearBrandingRemoval).toHaveBeenCalledWith(4);
  });

  it("ignores unknown products, unknown users and non-subscription events", async () => {
    const ctx = setup();
    expect(await ctx.service.applySubscriptionEvent(event({ product_id: "prod_other" }))).toBe(
      "ignored_unknown_product"
    );
    expect(await ctx.service.applySubscriptionEvent(event({ customer: { external_id: "999" } }))).toBe(
      "ignored_unknown_user"
    );
    expect(await ctx.service.applySubscriptionEvent(event({ customer: { external_id: "abc" } }))).toBe(
      "ignored_unknown_user"
    );
    expect(await ctx.service.applySubscriptionEvent({ ...event(), type: "order.created" })).toBe(
      "ignored_event"
    );
  });

  it("keeps a current paid subscription when a late event about an old one arrives", async () => {
    const ctx = setup();
    await ctx.service.applySubscriptionEvent(event({ id: "sub_new" }));
    expect(
      await ctx.service.applySubscriptionEvent(
        event(
          { id: "sub_old", status: "revoked", modified_at: "2026-11-13T12:00:00.000Z" },
          "subscription.revoked"
        )
      )
    ).toBe("ignored_stale");
    expect(await ctx.service.getEffectivePlan(4)).toBe(NodslotPlan.PRO);
  });

  it("creates checkout and portal links only when billing is configured", async () => {
    const off = setup();
    await expect(off.service.startCheckout({ userId: 4, email: "a@b.c", plan: "pro" })).rejects.toThrow(
      /isn't configured/
    );

    const on = setup({ polar: true });
    expect(await on.service.startCheckout({ userId: 4, email: "a@b.c", plan: "pro" })).toBe(
      "https://polar.test/checkout/abc"
    );
    expect(on.polar?.createCheckoutUrl).toHaveBeenCalledWith(
      expect.objectContaining({ productId: "prod_pro", userId: 4 })
    );
    await expect(on.service.openPortal(4)).rejects.toThrow(/don't have a subscription/);
    await on.service.applySubscriptionEvent(event());
    expect(await on.service.openPortal(4)).toBe("https://polar.test/portal/xyz");
  });
});
