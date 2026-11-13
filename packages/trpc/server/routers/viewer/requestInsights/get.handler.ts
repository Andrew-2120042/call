import { getBookingRequestInsightService } from "@calcom/features/booking-request-insights/lib/getBookingRequestInsightService";
import type { TrpcSessionUser } from "@calcom/trpc/server/types";
import type { TGetRequestInsightInputSchema } from "./get.schema";

type GetOptions = { ctx: { user: NonNullable<TrpcSessionUser> }; input: TGetRequestInsightInputSchema };

// Scoped to the host's own bookings in the repository query, so other users get null rather than data.
export const getHandler = async ({ ctx, input }: GetOptions) => {
  const service = getBookingRequestInsightService();
  const insight = await service.getForHost({ bookingUid: input.bookingUid, userId: ctx.user.id });
  return { enabled: service.isEnabled, insight };
};
