import { NodslotPlan } from "@calcom/prisma/enums";

export type PlanFeature =
  | "approvalRequests"
  | "waitlist"
  | "confirmOrRelease"
  | "aiRequestInsights"
  | "multipleReminders"
  | "unlimitedScreeningQuestions"
  | "removeBranding"
  | "customDomain"
  | "teamScheduling"
  | "rebookFollowUp";

export type PlanLimits = {
  /** Custom (non-system) booking questions allowed per service. */
  maxScreeningQuestionsPerService: number;
  /** Reminder offsets allowed per service. */
  maxRemindersPerService: number;
};

// Free matches what individuals expect from any scheduling tool (approvals, unlimited questions).
// Pro is what protects income: filling cancellations, stopping no-shows, AI triage, and your own brand.
const FREE_FEATURES: PlanFeature[] = ["approvalRequests", "unlimitedScreeningQuestions"];

const PRO_FEATURES: PlanFeature[] = [
  ...FREE_FEATURES,
  "waitlist",
  "confirmOrRelease",
  "aiRequestInsights",
  "multipleReminders",
  "removeBranding",
  "customDomain",
  "rebookFollowUp",
];

const PLAN_FEATURES: Record<NodslotPlan, ReadonlySet<PlanFeature>> = {
  [NodslotPlan.FREE]: new Set(FREE_FEATURES),
  [NodslotPlan.PRO]: new Set(PRO_FEATURES),
  [NodslotPlan.TEAM]: new Set<PlanFeature>([...PRO_FEATURES, "teamScheduling"]),
};

const PLAN_LIMITS: Record<NodslotPlan, PlanLimits> = {
  [NodslotPlan.FREE]: { maxScreeningQuestionsPerService: 50, maxRemindersPerService: 1 },
  [NodslotPlan.PRO]: { maxScreeningQuestionsPerService: 50, maxRemindersPerService: 5 },
  [NodslotPlan.TEAM]: { maxScreeningQuestionsPerService: 50, maxRemindersPerService: 5 },
};

export const planHasFeature = (plan: NodslotPlan, feature: PlanFeature) => PLAN_FEATURES[plan].has(feature);

export const getPlanLimits = (plan: NodslotPlan): PlanLimits => PLAN_LIMITS[plan];

export type SubscriptionSnapshot = {
  plan: NodslotPlan;
  status: string;
  currentPeriodEnd: Date | null;
} | null;

/**
 * The plan a user is entitled to right now. Paid access continues while a subscription is active or
 * trialing, and until the paid period ends when it was cancelled or a renewal payment is failing.
 */
export const getEffectivePlan = (subscription: SubscriptionSnapshot, now: Date): NodslotPlan => {
  if (!subscription) return NodslotPlan.FREE;
  if (subscription.status === "active" || subscription.status === "trialing") return subscription.plan;
  const paidThrough = subscription.currentPeriodEnd?.getTime() ?? 0;
  const inPaidPeriod = paidThrough > now.getTime();
  if (inPaidPeriod && (subscription.status === "canceled" || subscription.status === "past_due")) {
    return subscription.plan;
  }
  return NodslotPlan.FREE;
};
