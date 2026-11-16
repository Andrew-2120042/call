import { getBookingRequestInsightService } from "@calcom/features/booking-request-insights/lib/getBookingRequestInsightService";
import type { TrpcSessionUser } from "@calcom/trpc/server/types";
import type { TSendRequestReplyInputSchema } from "./sendReply.schema";

type SendReplyOptions = { ctx: { user: NonNullable<TrpcSessionUser> }; input: TSendRequestReplyInputSchema };

// The service only finds bookings hosted by ctx.user, so nobody can message another host's clients.
export const sendReplyHandler = async ({ ctx, input }: SendReplyOptions) =>
  getBookingRequestInsightService().sendReply({ ...input, userId: ctx.user.id });
