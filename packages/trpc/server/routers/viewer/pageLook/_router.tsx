import authedProcedure from "../../../procedures/authedProcedure";
import { router } from "../../../trpc";
import { ZUpdatePageLookInputSchema } from "./pageLook.schema";

export const pageLookRouter = router({
  get: authedProcedure.query(async ({ ctx }) => {
    const { getHandler } = await import("./pageLook.handler");
    return getHandler({ ctx });
  }),
  update: authedProcedure.input(ZUpdatePageLookInputSchema).mutation(async ({ ctx, input }) => {
    const { updateHandler } = await import("./pageLook.handler");
    return updateHandler({ ctx, input });
  }),
});
