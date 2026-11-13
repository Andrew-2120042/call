import authedProcedure from "../../../procedures/authedProcedure";
import { router } from "../../../trpc";
import { ZGetBookingRulesInputSchema } from "./get.schema";

export const bookingRulesRouter = router({
  get: authedProcedure.input(ZGetBookingRulesInputSchema).query(async ({ ctx, input }) => {
    const { getHandler } = await import("./get.handler");
    return getHandler({ ctx, input });
  }),
});
