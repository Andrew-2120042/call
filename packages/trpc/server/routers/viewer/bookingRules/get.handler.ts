import { getPlanLimits, planHasFeature } from "@calcom/features/plans/lib/entitlements";
import { getPlanService } from "@calcom/features/plans/lib/getPlanService";
import { getServicePlanAccountId } from "@calcom/features/plans/lib/getServicePlanAccount";
import { MembershipRole } from "@calcom/prisma/enums";
import prisma from "@calcom/prisma";
import type { TrpcSessionUser } from "@calcom/trpc/server/types";
import { TRPCError } from "@trpc/server";
import type { TGetBookingRulesInputSchema } from "./get.schema";

type GetOptions = { ctx: { user: NonNullable<TrpcSessionUser> }; input: TGetBookingRulesInputSchema };

export const getHandler = async ({ ctx, input }: GetOptions) => {
  // Your own services, or team services where you're an owner or admin.
  const eventType = await prisma.eventType.findFirst({
    where: {
      id: input.eventTypeId,
      OR: [
        { userId: ctx.user.id },
        {
          team: {
            members: {
              some: {
                userId: ctx.user.id,
                accepted: true,
                role: { in: [MembershipRole.OWNER, MembershipRole.ADMIN] },
              },
            },
          },
        },
      ],
    },
    select: {
      waitlistEnabled: true,
      attendeeConfirmationHours: true,
      releaseUnconfirmedBookings: true,
      attendeeReminderMinutes: true,
    },
  });
  if (!eventType) throw new TRPCError({ code: "NOT_FOUND", message: "Service not found" });

  const planAccountId = (await getServicePlanAccountId(input.eventTypeId)) ?? ctx.user.id;
  const plan = await getPlanService().getEffectivePlan(planAccountId);
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
