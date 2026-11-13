import { getWaitlistService } from "@calcom/features/waitlist/lib/getWaitlistService";
import type { TrpcSessionUser } from "@calcom/trpc/server/types";
import type { TRemoveWaitlistEntryInputSchema } from "./remove.schema";

type RemoveOptions = {
  ctx: { user: NonNullable<TrpcSessionUser> };
  input: TRemoveWaitlistEntryInputSchema;
};

export const removeHandler = async ({ ctx, input }: RemoveOptions) => {
  return getWaitlistService().removeForHost({ userId: ctx.user.id, uid: input.uid });
};
