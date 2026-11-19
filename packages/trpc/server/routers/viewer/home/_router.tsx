import authedProcedure from "../../../procedures/authedProcedure";
import { router } from "../../../trpc";
import { ZHomeCalendarInputSchema } from "./calendar.schema";
import { ZPeekInputSchema } from "./peek.schema";
import { ZApplySetupInputSchema } from "./applySetup.schema";

export const homeRouter = router({
  get: authedProcedure.query(async ({ ctx }) => {
    const { getHandler } = await import("./home.handler");
    return getHandler({ ctx });
  }),
  calendar: authedProcedure.input(ZHomeCalendarInputSchema).query(async ({ ctx, input }) => {
    const { calendarHandler } = await import("./calendar.handler");
    return calendarHandler({ ctx, input });
  }),
  peek: authedProcedure.input(ZPeekInputSchema).query(async ({ ctx, input }) => {
    const { peekHandler } = await import("./peek.handler");
    return peekHandler({ ctx, input });
  }),
  applySetup: authedProcedure.input(ZApplySetupInputSchema).mutation(async ({ ctx, input }) => {
    const { applySetupHandler } = await import("./applySetup.handler");
    return applySetupHandler({ ctx, input });
  }),
});
