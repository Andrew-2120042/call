import { ErrorCode } from "@calcom/lib/errorCodes";
import { ErrorWithCode } from "@calcom/lib/errors";
import { SlotwisePlan } from "@calcom/prisma/enums";
import {
  getEffectivePlan,
  type PlanFeature,
  planHasFeature,
  type SubscriptionSnapshot,
} from "../lib/entitlements";

export type StoredSubscription = {
  userId: number;
  plan: SlotwisePlan;
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
  clearBrandingRemoval(userId: number): Promise<void>;
  userExists(userId: number): Promise<boolean>;
}

export interface IPolarGateway {
  createCheckoutUrl(params: {
    productId: string;
    userId: number;
    email: string;
    successUrl: string;
    returnUrl: string;
  }): Promise<string>;
  createPortalUrl(params: { userId: number; returnUrl: string }): Promise<string>;
}

/** The subset of a Polar subscription webhook payload this service relies on. */
export type PolarSubscriptionEvent = {
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
  polar: IPolarGateway | null;
  productIds: PlanProductIds;
  webappUrl: string;
  now?: () => Date;
  logger?: { info: (...args: unknown[]) => void; warn: (...args: unknown[]) => void };
}

export type WebhookOutcome =
  | "applied"
  | "ignored_event"
  | "ignored_unknown_product"
  | "ignored_unknown_user"
  | "ignored_stale";

export class PlanService {
  private readonly now: () => Date;

  constructor(private readonly deps: IPlanServiceDeps) {
    this.now = deps.now ?? (() => new Date());
  }

  async getEffectivePlan(userId: number): Promise<SlotwisePlan> {
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
      billingConfigured: this.deps.polar !== null,
    };
  }

  private planForProduct(productId: string): SlotwisePlan | null {
    if (productId && productId === this.deps.productIds.pro) return SlotwisePlan.PRO;
    if (productId && productId === this.deps.productIds.team) return SlotwisePlan.TEAM;
    return null;
  }

  async startCheckout(params: { userId: number; email: string; plan: "pro" | "team" }) {
    if (!this.deps.polar) throw new ErrorWithCode(ErrorCode.BadRequest, "Billing isn't configured");
    const productId = this.deps.productIds[params.plan];
    if (!productId) throw new ErrorWithCode(ErrorCode.BadRequest, `The ${params.plan} plan isn't available`);
    return this.deps.polar.createCheckoutUrl({
      productId,
      userId: params.userId,
      email: params.email,
      successUrl: `${this.deps.webappUrl}/settings/billing?checkout=success`,
      returnUrl: `${this.deps.webappUrl}/settings/billing`,
    });
  }

  async openPortal(userId: number) {
    if (!this.deps.polar) throw new ErrorWithCode(ErrorCode.BadRequest, "Billing isn't configured");
    const subscription = await this.deps.repository.findByUserId(userId);
    if (!subscription) throw new ErrorWithCode(ErrorCode.NotFound, "You don't have a subscription yet");
    return this.deps.polar.createPortalUrl({ userId, returnUrl: `${this.deps.webappUrl}/settings/billing` });
  }

  /** Applies a verified Polar subscription webhook. Idempotent and safe against out-of-order delivery. */
  async applySubscriptionEvent(event: PolarSubscriptionEvent): Promise<WebhookOutcome> {
    if (!event.type.startsWith("subscription.")) return "ignored_event";
    const { data } = event;

    const plan = this.planForProduct(data.product_id);
    if (!plan) {
      this.deps.logger?.warn("[plans] subscription for an unknown product", { productId: data.product_id });
      return "ignored_unknown_product";
    }

    const externalId = data.customer?.external_id ?? data.metadata?.slotwiseUserId;
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
      const existingStillPaid = getEffectivePlan(existing, this.now()) !== SlotwisePlan.FREE;
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
