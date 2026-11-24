import { NodslotPlan } from "@calcom/prisma/enums";

export type PlanFeature =
  | "approvalRequests"
  | "waitlist"
  | "waitlistEveryone"
  | "confirmOrRelease"
  | "aiRequestInsights"
  | "multipleReminders"
  | "unlimitedScreeningQuestions"
  | "removeBranding"
  | "customDomain"
  | "teamScheduling"
  | "rebookFollowUp"
  | "assistant";

export type PlanLimits = {
  /** Custom (non-system) booking questions allowed per service. */
  maxScreeningQuestionsPerService: number;
  /** Reminder offsets allowed per service. */
  maxRemindersPerService: number;
  /** Services that can have the waitlist on at once; null means no limit. */
  maxWaitlistServices: number | null;
};

// Free covers everything needed to run a calendar, including approvals, several reminders and the waitlist on
// one service, so people feel a cancellation get refilled before they pay. Pro is the full income-protecting
// engine: the waitlist everywhere and in every mode, confirm-or-release, AI triage and your own brand.
const FREE_FEATURES: PlanFeature[] = ["unlimitedScreeningQuestions", "approvalRequests", "multipleReminders", "waitlist"];

const PRO_FEATURES: PlanFeature[] = [
  ...FREE_FEATURES,
  "waitlistEveryone",
  "confirmOrRelease",
  "aiRequestInsights",
  "removeBranding",
  "customDomain",
  "rebookFollowUp",
  "assistant",
];

const PLAN_FEATURES: Record<NodslotPlan, ReadonlySet<PlanFeature>> = {
  [NodslotPlan.FREE]: new Set(FREE_FEATURES),
  [NodslotPlan.PRO]: new Set(PRO_FEATURES),
  [NodslotPlan.TEAM]: new Set<PlanFeature>([...PRO_FEATURES, "teamScheduling"]),
};

const PLAN_LIMITS: Record<NodslotPlan, PlanLimits> = {
  [NodslotPlan.FREE]: { maxScreeningQuestionsPerService: 50, maxRemindersPerService: 5, maxWaitlistServices: 1 },
  [NodslotPlan.PRO]: { maxScreeningQuestionsPerService: 50, maxRemindersPerService: 5, maxWaitlistServices: null },
  [NodslotPlan.TEAM]: { maxScreeningQuestionsPerService: 50, maxRemindersPerService: 5, maxWaitlistServices: null },
};

/** Status of the in-app 14-day Pro trial (no card). Distinct from a provider's "trialing" subscription. */
export const TRIAL_STATUS = "trial";
export const TRIAL_DAYS = 14;

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
  // Our own no-card trial: paid features until the trial period ends, then Free.
  if (subscription.status === TRIAL_STATUS) {
    return (subscription.currentPeriodEnd?.getTime() ?? 0) > now.getTime() ? subscription.plan : NodslotPlan.FREE;
  }
  if (subscription.status === "active" || subscription.status === "trialing") return subscription.plan;
  const paidThrough = subscription.currentPeriodEnd?.getTime() ?? 0;
  const inPaidPeriod = paidThrough > now.getTime();
  if (inPaidPeriod && (subscription.status === "canceled" || subscription.status === "past_due")) {
    return subscription.plan;
  }
  return NodslotPlan.FREE;
};
