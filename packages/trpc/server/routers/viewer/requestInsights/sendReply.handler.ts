import { getBookingRequestInsightService } from "@calcom/features/booking-request-insights/lib/getBookingRequestInsightService";
import { checkRateLimitAndThrowError } from "@calcom/lib/checkRateLimitAndThrowError";
import type { TrpcSessionUser } from "@calcom/trpc/server/types";
import type { TSendRequestReplyInputSchema } from "./sendReply.schema";

type SendReplyOptions = { ctx: { user: NonNullable<TrpcSessionUser> }; input: TSendRequestReplyInputSchema };

// The service only finds bookings hosted by ctx.user, so nobody can message another host's clients.
export const sendReplyHandler = async ({ ctx, input }: SendReplyOptions) => {
  // This sends email from our domain to an address the booker typed, so it must not be usable as a spam relay.
  await checkRateLimitAndThrowError({ rateLimitingType: "core", identifier: `requestReply:${ctx.user.id}` });
  return getBookingRequestInsightService().sendReply({ ...input, userId: ctx.user.id });
};
