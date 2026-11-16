import { getWaitlistService } from "@calcom/features/waitlist/lib/getWaitlistService";
import type { TrpcSessionUser } from "@calcom/trpc/server/types";

type ListOptions = { ctx: { user: NonNullable<TrpcSessionUser> } };

export const listHandler = async ({ ctx }: ListOptions) => {
  const entries = await getWaitlistService().listForHost(ctx.user.id);
  return entries.map((entry) => ({
    uid: entry.uid,
    name: entry.name,
    email: entry.email,
    status: entry.status,
    kind: entry.kind,
    rangeStart: entry.rangeStart,
    rangeEnd: entry.rangeEnd,
    offerStartTime: entry.offerStartTime,
    startTime: entry.startTime,
    endTime: entry.endTime,
    timeZone: entry.timeZone,
    offerExpiresAt: entry.offerExpiresAt,
    createdAt: entry.createdAt,
    eventType: entry.eventType,
  }));
};
