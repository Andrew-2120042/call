import authedProcedure from "../../../procedures/authedProcedure";
import { router } from "../../../trpc";
import { ZGetRequestInsightInputSchema } from "./get.schema";

export const requestInsightsRouter = router({
  get: authedProcedure.input(ZGetRequestInsightInputSchema).query(async ({ ctx, input }) => {
    const { getHandler } = await import("./get.handler");
    return getHandler({ ctx, input });
  }),
});
