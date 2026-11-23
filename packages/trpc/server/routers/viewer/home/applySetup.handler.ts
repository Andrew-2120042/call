import { planHasFeature } from "@calcom/features/plans/lib/entitlements";
import { getPlanService } from "@calcom/features/plans/lib/getPlanService";
import { prisma } from "@calcom/prisma";
import type { Prisma } from "@calcom/prisma/client";
import type { TrpcSessionUser } from "@calcom/trpc/server/types";
import type { TApplySetupInputSchema } from "./applySetup.schema";

type Options = { ctx: { user: NonNullable<TrpcSessionUser> }; input: TApplySetupInputSchema };

const SERVICE_TITLE: Record<TApplySetupInputSchema["work"], string> = {
  coach: "Coaching session",
  therapist: "Therapy session",
  tutor: "Tutoring session",
  fitness: "Training session",
  consultant: "Consultation",
  creative: "Project call",
  other: "Session",
};

// rrule's Frequency.WEEKLY.
const WEEKLY = 2;

const slugOf = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function locationsFor(input: TApplySetupInputSchema) {
  switch (input.location) {
    case "meet":
      return [{ type: "integrations:google:meet" }];
    case "zoom":
      return [{ type: "integrations:zoom" }];
    case "phone":
      return [{ type: "phone" }];
    case "in_person":
      return input.address?.trim() ? [{ type: "inPerson", address: input.address.trim() }] : [];
    default:
      return [];
  }
}

/**
 * Turns the onboarding answers into the person's real services, so they finish setup with a booking page that
 * already works the way they described. Paid-plan answers are only applied when the plan includes them.
 */
export const applySetupHandler = async ({ ctx, input }: Options) => {
  const userId = ctx.user.id;
  const plan = await getPlanService().getEffectivePlan(userId);
  const canWaitlist = planHasFeature(plan, "waitlist");
  const canConfirm = planHasFeature(plan, "confirmOrRelease");
  const canApprove = planHasFeature(plan, "approvalRequests");
  const locations = locationsFor(input) as Prisma.InputJsonValue;
  const reminders = input.reminderHours ? [input.reminderHours * 60] : [];

  const services: { title: string; length: number; main: boolean }[] = [
    { title: SERVICE_TITLE[input.work], length: input.length, main: true },
  ];
  if (input.introCall) services.unshift({ title: "Free intro call", length: 15, main: false });

  const created: { id: number; title: string }[] = [];
  for (let index = 0; index < services.length; index++) {
    const service = services[index];
    const slug = slugOf(service.title);
    const data = {
      title: service.title,
      length: service.length,
      locations,
      position: services.length - index,
      attendeeReminderMinutes: reminders,
      // An intro call is a quick yes; only the main session follows the approval and series answers.
      requiresConfirmation: service.main && input.approval && canApprove,
      requiresConfirmationWillBlockSlot: service.main && input.approval && canApprove,
      recurringEvent:
        service.main && input.series
          ? ({ freq: WEEKLY, count: input.series, interval: 1 } as Prisma.InputJsonValue)
          : undefined,
      waitlistEnabled: service.main && input.waitlist && canWaitlist,
      attendeeConfirmationHours: service.main && input.confirm && canConfirm ? 24 : null,
      releaseUnconfirmedBookings: service.main && input.confirm && canConfirm,
    };
    const existing = await prisma.eventType.findFirst({ where: { userId, slug }, select: { id: true } });
    const saved = existing
      ? await prisma.eventType.update({ where: { id: existing.id }, data, select: { id: true, title: true } })
      : await prisma.eventType.create({
          data: { ...data, slug, owner: { connect: { id: userId } }, users: { connect: { id: userId } } },
          select: { id: true, title: true },
        });
    created.push(saved);
  }

  return {
    services: created,
    skipped: {
      approval: input.approval && !canApprove,
      waitlist: input.waitlist && !canWaitlist,
      confirm: input.confirm && !canConfirm,
    },
  };
};
