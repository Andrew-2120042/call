import { getPlanLimits, planHasFeature } from "@calcom/features/plans/lib/entitlements";
import { getPlanService } from "@calcom/features/plans/lib/getPlanService";
import prisma from "@calcom/prisma";
import type { TrpcSessionUser } from "@calcom/trpc/server/types";
import { TRPCError } from "@trpc/server";
import type { TGetBookingRulesInputSchema } from "./get.schema";

type GetOptions = { ctx: { user: NonNullable<TrpcSessionUser> }; input: TGetBookingRulesInputSchema };

export const getHandler = async ({ ctx, input }: GetOptions) => {
  const eventType = await prisma.eventType.findFirst({
    where: { id: input.eventTypeId, userId: ctx.user.id },
    select: {
      waitlistEnabled: true,
      attendeeConfirmationHours: true,
      releaseUnconfirmedBookings: true,
      attendeeReminderMinutes: true,
    },
  });
  if (!eventType) throw new TRPCError({ code: "NOT_FOUND", message: "Service not found" });

  const plan = await getPlanService().getEffectivePlan(ctx.user.id);
  return {
    ...eventType,
    plan,
    limits: getPlanLimits(plan),
    features: {
      waitlist: planHasFeature(plan, "waitlist"),
      confirmOrRelease: planHasFeature(plan, "confirmOrRelease"),
      multipleReminders: planHasFeature(plan, "multipleReminders"),
    },
  };
};
