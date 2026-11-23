import { ErrorCode } from "@calcom/lib/errorCodes";
import { ErrorWithCode } from "@calcom/lib/errors";
import { NodslotPlan } from "@calcom/prisma/enums";
import {
  TRIAL_DAYS,
  TRIAL_STATUS,
  getEffectivePlan,
  type PlanFeature,
  planHasFeature,
  type SubscriptionSnapshot,
} from "../lib/entitlements";

export type StoredSubscription = {
  userId: number;
  plan: NodslotPlan;
  status: string;
  polarSubscriptionId: string;
  polarCustomerId: string;
  polarProductId: string;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  polarModifiedAt: Date;
};

export interface IPlanSubscriptionRepository {
  findByUserId(userId: number): Promise<StoredSubscription | null>;
  upsertForUser(subscription: StoredSubscription): Promise<void>;
  deleteForUser(userId: number): Promise<void>;
  clearBrandingRemoval(userId: number): Promise<void>;
  userExists(userId: number): Promise<boolean>;
}

/** The payment provider (Polar or Dodo): hosted checkout and the customer's billing portal. */
export interface IBillingGateway {
  createCheckoutUrl(params: {
    productId: string;
    userId: number;
    email: string;
    successUrl: string;
    returnUrl: string;
    /** Which app started the checkout, echoed back in webhooks so another environment's payments are ignored. */
    appUrl: string;
  }): Promise<string>;
  /** Reads a subscription straight from the provider (used on return from checkout). Null if unsupported. */
  getSubscription?(subscriptionId: string): Promise<SubscriptionEvent | null>;
  /**
   * Moves an existing subscription to another product (Pro to Team), charging the prorated difference to the
   * saved card. Returns a payment page only when the provider needs the customer to pay there.
   */
  changePlan?(params: { subscriptionId: string; productId: string }): Promise<{ paymentUrl: string | null }>;
  createPortalUrl(params: { userId: number; customerId: string; returnUrl: string }): Promise<string>;
}

/**
 * A subscription change in Polar's webhook shape. Dodo events are mapped into it (see dodoWebhook.ts), and the
 * provider's ids are stored in the polar* columns whichever provider is active.
 */
export type SubscriptionEvent = {
  type: string;
  data: {
    id: string;
    status: string;
    product_id: string;
    customer_id: string;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    modified_at: string | null;
    created_at: string;
    customer?: { external_id?: string | null } | null;
    metadata?: Record<string, unknown> | null;
  };
};

export type PlanProductIds = { pro?: string; team?: string };

export interface IPlanServiceDeps {
  repository: IPlanSubscriptionRepository;
  gateway: IBillingGateway | null;
  productIds: PlanProductIds;
  webappUrl: string;
  /** Who may open a checkout. Used while the provider is in test mode on the live site, so only the owner can. */
  canCheckout?: (email: string) => boolean;
  now?: () => Date;
  logger?: { info: (...args: unknown[]) => void; warn: (...args: unknown[]) => void };
}

export type WebhookOutcome =
  | "applied"
  | "ignored_event"
  | "ignored_unknown_product"
  | "ignored_unknown_user"
  | "ignored_stale"
  | "ignored_other_app";

export class PlanService {
  private readonly now: () => Date;

  constructor(private readonly deps: IPlanServiceDeps) {
    this.now = deps.now ?? (() => new Date());
  }

  async getEffectivePlan(userId: number): Promise<NodslotPlan> {
    const subscription = await this.deps.repository.findByUserId(userId);
    return getEffectivePlan(subscription as SubscriptionSnapshot, this.now());
  }

  async hasFeature(userId: number, feature: PlanFeature): Promise<boolean> {
    return planHasFeature(await this.getEffectivePlan(userId), feature);
  }

  async getPlanSummary(userId: number) {
    const subscription = await this.deps.repository.findByUserId(userId);
    return {
      plan: getEffectivePlan(subscription as SubscriptionSnapshot, this.now()),
      status: subscription?.status ?? null,
      currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
      billingConfigured: this.deps.gateway !== null,
      // One trial per account: anyone who has had any subscription record (trial or paid) can't start another.
      trialAvailable: !subscription,
      onTrial: subscription?.status === TRIAL_STATUS,
    };
  }

  private planForProduct(productId: string): NodslotPlan | null {
    if (productId && productId === this.deps.productIds.pro) return NodslotPlan.PRO;
    if (productId && productId === this.deps.productIds.team) return NodslotPlan.TEAM;
    return null;
  }

  async startCheckout(params: { userId: number; email: string; plan: "pro" | "team" }) {
    if (!this.deps.gateway) throw new ErrorWithCode(ErrorCode.BadRequest, "Billing isn't configured");
    const summary = await this.getPlanSummary(params.userId);
    const isPaid = summary.plan !== NodslotPlan.FREE && !summary.onTrial;
    // A paying Pro customer can move up to Team; any other paid-to-paid move goes through Billing.
    const isProToTeam = isPaid && summary.plan === NodslotPlan.PRO && params.plan === "team";
    if (isPaid && !isProToTeam) {
      throw new ErrorWithCode(ErrorCode.BadRequest, "You're already on a paid plan. Manage it from Billing.");
    }
    if (this.deps.canCheckout && !this.deps.canCheckout(params.email)) {
      throw new ErrorWithCode(ErrorCode.BadRequest, "Payments are being tested. Upgrading opens soon.");
    }
    const productId = this.deps.productIds[params.plan];
    if (!productId) throw new ErrorWithCode(ErrorCode.BadRequest, `The ${params.plan} plan isn't available`);
    // The success page waits for this plan, so a Pro customer moving to Team isn't greeted as "Pro" again.
    const successUrl = `${this.deps.webappUrl}/upgrade/success?plan=${params.plan}`;
    if (isProToTeam) return this.switchToTeam(params.userId, productId, successUrl);
    return this.deps.gateway.createCheckoutUrl({
      productId,
      userId: params.userId,
      email: params.email,
      successUrl,
      returnUrl: `${this.deps.webappUrl}/upgrade`,
      appUrl: this.deps.webappUrl,
    });
  }

  private async switchToTeam(userId: number, productId: string, successUrl: string) {
    const subscription = await this.deps.repository.findByUserId(userId);
    if (!subscription || !this.deps.gateway?.changePlan) {
      throw new ErrorWithCode(ErrorCode.BadRequest, "Switch to Team from Settings → Billing.");
    }
    const { paymentUrl } = await this.deps.gateway.changePlan({
      subscriptionId: subscription.polarSubscriptionId,
      productId,
    });
    return paymentUrl ?? `${successUrl}&subscription_id=${encodeURIComponent(subscription.polarSubscriptionId)}`;
  }

  /**
   * Called when the customer lands back from checkout: asks the provider directly, so the plan switches at once
   * (and works where webhooks can't reach, like a developer's machine). Only for the signed-in user's own payment.
   */
  async confirmCheckout(userId: number, subscriptionId: string) {
    const event = await this.deps.gateway?.getSubscription?.(subscriptionId);
    if (!event) return { outcome: "pending" as const, summary: await this.getPlanSummary(userId) };
    if (String(event.data.metadata?.nodslotUserId ?? "") !== String(userId)) {
      throw new ErrorWithCode(ErrorCode.Forbidden, "That payment belongs to a different account.");
    }
    const outcome = await this.applySubscriptionEvent(event);
    return { outcome, summary: await this.getPlanSummary(userId) };
  }

  async openPortal(userId: number) {
    if (!this.deps.gateway) throw new ErrorWithCode(ErrorCode.BadRequest, "Billing isn't configured");
    const subscription = await this.deps.repository.findByUserId(userId);
    if (!subscription) throw new ErrorWithCode(ErrorCode.NotFound, "You don't have a subscription yet");
    return this.deps.gateway.createPortalUrl({
      userId,
      customerId: subscription.polarCustomerId,
      returnUrl: `${this.deps.webappUrl}/settings/billing`,
    });
  }

  /** Starts the one-time 14-day Pro trial. No card; when it ends the account is simply back on Free. */
  async startTrial(userId: number) {
    const existing = await this.deps.repository.findByUserId(userId);
    if (existing) {
      throw new ErrorWithCode(ErrorCode.BadRequest, "The free trial can only be used once per account.");
    }
    const now = this.now();
    const endsAt = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
    await this.deps.repository.upsertForUser({
      userId,
      plan: NodslotPlan.PRO,
      status: TRIAL_STATUS,
      polarSubscriptionId: `trial_${userId}`,
      polarCustomerId: `trial_${userId}`,
      polarProductId: "trial",
      currentPeriodEnd: endsAt,
      cancelAtPeriodEnd: true,
      polarModifiedAt: now,
    });
    return { plan: NodslotPlan.PRO, endsAt };
  }

  /**
   * Local testing only (the API route refuses outside development): puts the user on a plan without paying.
   * Free removes the record entirely, so the account looks brand new (and can try the trial again).
   */
  async setPlanForTesting(userId: number, plan: NodslotPlan) {
    const now = this.now();
    const paid = plan !== NodslotPlan.FREE;
    if (!paid) {
      await this.deps.repository.deleteForUser(userId);
      await this.deps.repository.clearBrandingRemoval(userId);
      return;
    }
    await this.deps.repository.upsertForUser({
      userId,
      plan: paid ? plan : NodslotPlan.PRO,
      status: paid ? "active" : "expired",
      polarSubscriptionId: `debug_${userId}`,
      polarCustomerId: `debug_${userId}`,
      polarProductId: "debug",
      currentPeriodEnd: paid ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) : new Date(now.getTime() - 1000),
      cancelAtPeriodEnd: false,
      polarModifiedAt: now,
    });
    if (!paid) await this.deps.repository.clearBrandingRemoval(userId);
  }

  /** Applies a verified subscription webhook (Polar, or Dodo mapped to the same shape). Idempotent and safe against out-of-order delivery. */
  async applySubscriptionEvent(event: SubscriptionEvent): Promise<WebhookOutcome> {
    if (!event.type.startsWith("subscription.")) return "ignored_event";
    const { data } = event;

    const plan = this.planForProduct(data.product_id);
    if (!plan) {
      this.deps.logger?.warn("[plans] subscription for an unknown product", { productId: data.product_id });
      return "ignored_unknown_product";
    }

    // Test and live share one provider account: a payment started from another copy of the app (a developer's
    // machine, a preview) carries that app's address and must never change an account here.
    if (data.metadata?.nodslotApp !== this.deps.webappUrl) {
      this.deps.logger?.warn("[plans] subscription from another app ignored", { subscriptionId: data.id });
      return "ignored_other_app";
    }

    const externalId = data.customer?.external_id ?? data.metadata?.nodslotUserId;
    const userId = Number(externalId);
    if (!Number.isInteger(userId) || userId <= 0 || !(await this.deps.repository.userExists(userId))) {
      this.deps.logger?.warn("[plans] subscription for an unknown user", {
        externalId,
        subscriptionId: data.id,
      });
      return "ignored_unknown_user";
    }

    const modifiedAt = new Date(data.modified_at ?? data.created_at);
    const existing = await this.deps.repository.findByUserId(userId);
    if (existing) {
      const sameSubscription = existing.polarSubscriptionId === data.id;
      if (sameSubscription && existing.polarModifiedAt.getTime() >= modifiedAt.getTime())
        return "ignored_stale";
      // A late event about an old subscription must not replace the user's current, still-paid one.
      const existingStillPaid = getEffectivePlan(existing, this.now()) !== NodslotPlan.FREE;
      const incomingIsPaid = data.status === "active" || data.status === "trialing";
      if (!sameSubscription && existingStillPaid && !incomingIsPaid) return "ignored_stale";
    }

    await this.deps.repository.upsertForUser({
      userId,
      plan,
      status: data.status,
      polarSubscriptionId: data.id,
      polarCustomerId: data.customer_id,
      polarProductId: data.product_id,
      currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : null,
      cancelAtPeriodEnd: data.cancel_at_period_end,
      polarModifiedAt: modifiedAt,
    });
    const effectivePlan = await this.getEffectivePlan(userId);
    // Pro settings with no ongoing cost to us are switched off on downgrade, so pages show our branding again.
    if (!planHasFeature(effectivePlan, "removeBranding"))
      await this.deps.repository.clearBrandingRemoval(userId);
    this.deps.logger?.info("[plans] subscription updated", { userId, plan, status: data.status });
    return "applied";
  }
}
