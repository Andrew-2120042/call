import authedProcedure from "../../../procedures/authedProcedure";
import { router } from "../../../trpc";
import { ZRemoveWaitlistEntryInputSchema } from "./remove.schema";

export const waitlistRouter = router({
  list: authedProcedure.query(async ({ ctx }) => {
    const { listHandler } = await import("./list.handler");
    return listHandler({ ctx });
  }),
  remove: authedProcedure.input(ZRemoveWaitlistEntryInputSchema).mutation(async ({ ctx, input }) => {
    const { removeHandler } = await import("./remove.handler");
    return removeHandler({ ctx, input });
  }),
});
