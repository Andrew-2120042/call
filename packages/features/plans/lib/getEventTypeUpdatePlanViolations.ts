import { prisma } from "@calcom/prisma";
import {
  type EventTypePlanSettings,
  getEventTypePlanViolations,
  type PlanViolation,
} from "./eventTypePlanGuard";
import { getPlanService } from "./getPlanService";

/** Lists the settings in an event type update that the user's plan doesn't include (empty when allowed). */
export async function getEventTypeUpdatePlanViolations(params: {
  userId: number;
  eventTypeId: number;
  update: EventTypePlanSettings;
}): Promise<PlanViolation[]> {
  const touchesPaidSettings =
    params.update.requiresConfirmation !== undefined ||
    params.update.waitlistEnabled !== undefined ||
    params.update.attendeeConfirmationHours !== undefined ||
    params.update.attendeeReminderMinutes !== undefined ||
    params.update.bookingFields !== undefined;
  if (!touchesPaidSettings) return [];

  const current = await prisma.eventType.findUnique({
    where: { id: params.eventTypeId },
    select: {
      requiresConfirmation: true,
      waitlistEnabled: true,
      attendeeConfirmationHours: true,
      attendeeReminderMinutes: true,
      bookingFields: true,
    },
  });
  if (!current) return [];

  const plan = await getPlanService().getEffectivePlan(params.userId);
  return getEventTypePlanViolations(plan, params.update, current);
}
