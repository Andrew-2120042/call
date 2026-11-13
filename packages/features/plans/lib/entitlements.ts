import { SlotwisePlan } from "@calcom/prisma/enums";

export type PlanFeature =
  | "approvalRequests"
  | "waitlist"
  | "confirmOrRelease"
  | "aiRequestInsights"
  | "multipleReminders"
  | "unlimitedScreeningQuestions"
  | "removeBranding"
  | "customDomain"
  | "teamScheduling";

export type PlanLimits = {
  /** Custom (non-system) booking questions allowed per service. */
  maxScreeningQuestionsPerService: number;
  /** Reminder offsets allowed per service. */
  maxRemindersPerService: number;
};

const PRO_FEATURES: PlanFeature[] = [
  "approvalRequests",
  "waitlist",
  "confirmOrRelease",
  "aiRequestInsights",
  "multipleReminders",
  "unlimitedScreeningQuestions",
  "removeBranding",
  "customDomain",
];

const PLAN_FEATURES: Record<SlotwisePlan, ReadonlySet<PlanFeature>> = {
  [SlotwisePlan.FREE]: new Set(),
  [SlotwisePlan.PRO]: new Set(PRO_FEATURES),
  [SlotwisePlan.TEAM]: new Set<PlanFeature>([...PRO_FEATURES, "teamScheduling"]),
};

const PLAN_LIMITS: Record<SlotwisePlan, PlanLimits> = {
  [SlotwisePlan.FREE]: { maxScreeningQuestionsPerService: 2, maxRemindersPerService: 1 },
  [SlotwisePlan.PRO]: { maxScreeningQuestionsPerService: 50, maxRemindersPerService: 5 },
  [SlotwisePlan.TEAM]: { maxScreeningQuestionsPerService: 50, maxRemindersPerService: 5 },
};

export const planHasFeature = (plan: SlotwisePlan, feature: PlanFeature) => PLAN_FEATURES[plan].has(feature);

export const getPlanLimits = (plan: SlotwisePlan): PlanLimits => PLAN_LIMITS[plan];

export type SubscriptionSnapshot = {
  plan: SlotwisePlan;
  status: string;
  currentPeriodEnd: Date | null;
} | null;

/**
 * The plan a user is entitled to right now. Paid access continues while a subscription is active or
 * trialing, and until the paid period ends when it was cancelled or a renewal payment is failing.
 */
export const getEffectivePlan = (subscription: SubscriptionSnapshot, now: Date): SlotwisePlan => {
  if (!subscription) return SlotwisePlan.FREE;
  if (subscription.status === "active" || subscription.status === "trialing") return subscription.plan;
  const paidThrough = subscription.currentPeriodEnd?.getTime() ?? 0;
  const inPaidPeriod = paidThrough > now.getTime();
  if (inPaidPeriod && (subscription.status === "canceled" || subscription.status === "past_due")) {
    return subscription.plan;
  }
  return SlotwisePlan.FREE;
};
