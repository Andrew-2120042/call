import type { SlotwisePlan } from "@calcom/prisma/enums";
import { getPlanLimits, planHasFeature } from "./entitlements";

export type EventTypePlanSettings = {
  requiresConfirmation?: boolean;
  waitlistEnabled?: boolean;
  attendeeConfirmationHours?: number | null;
  attendeeReminderMinutes?: number[];
  bookingFields?: unknown;
};

export type PlanViolation = { field: string; message: string };

type FieldLike = { editable?: string };

// Questions the owner added themselves; system fields (name, email, location...) don't count.
const countCustomQuestions = (bookingFields: unknown) =>
  Array.isArray(bookingFields)
    ? (bookingFields as FieldLike[]).filter((f) => f?.editable === "user" || f?.editable === "user-readonly")
        .length
    : 0;

/**
 * Compares the update with what's stored and only flags turning a paid setting on or growing past a limit.
 * The settings form sends every field on each save, so a downgraded user must still be able to save
 * unrelated changes and turn paid settings off.
 */
export const getEventTypePlanViolations = (
  plan: SlotwisePlan,
  update: EventTypePlanSettings,
  current: EventTypePlanSettings
): PlanViolation[] => {
  const violations: PlanViolation[] = [];
  const limits = getPlanLimits(plan);

  if (
    update.requiresConfirmation === true &&
    !current.requiresConfirmation &&
    !planHasFeature(plan, "approvalRequests")
  ) {
    violations.push({
      field: "requiresConfirmation",
      message: "Approving bookings before they're confirmed is a Pro feature",
    });
  }
  if (update.waitlistEnabled === true && !current.waitlistEnabled && !planHasFeature(plan, "waitlist")) {
    violations.push({ field: "waitlistEnabled", message: "The waitlist is a Pro feature" });
  }
  if (
    update.attendeeConfirmationHours != null &&
    current.attendeeConfirmationHours == null &&
    !planHasFeature(plan, "confirmOrRelease")
  ) {
    violations.push({
      field: "attendeeConfirmationHours",
      message: "Asking clients to confirm is a Pro feature",
    });
  }
  if (update.attendeeReminderMinutes) {
    const next = update.attendeeReminderMinutes.length;
    const before = current.attendeeReminderMinutes?.length ?? 0;
    if (next > limits.maxRemindersPerService && next > before) {
      violations.push({
        field: "attendeeReminderMinutes",
        message: `Your plan allows ${limits.maxRemindersPerService} reminder per service`,
      });
    }
  }
  if (update.bookingFields !== undefined) {
    const next = countCustomQuestions(update.bookingFields);
    const before = countCustomQuestions(current.bookingFields);
    if (next > limits.maxScreeningQuestionsPerService && next > before) {
      violations.push({
        field: "bookingFields",
        message: `Your plan allows ${limits.maxScreeningQuestionsPerService} screening questions per service`,
      });
    }
  }
  return violations;
};
