import authedProcedure from "../../../procedures/authedProcedure";
import { router } from "../../../trpc";
import { ZHomeCalendarInputSchema } from "./calendar.schema";

export const homeRouter = router({
  get: authedProcedure.query(async ({ ctx }) => {
    const { getHandler } = await import("./home.handler");
    return getHandler({ ctx });
  }),
  calendar: authedProcedure.input(ZHomeCalendarInputSchema).query(async ({ ctx, input }) => {
    const { calendarHandler } = await import("./calendar.handler");
    return calendarHandler({ ctx, input });
  }),
});
