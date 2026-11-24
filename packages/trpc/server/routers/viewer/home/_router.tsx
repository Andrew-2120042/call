import authedProcedure from "../../../procedures/authedProcedure";
import { router } from "../../../trpc";
import { ZApplySetupInputSchema } from "./applySetup.schema";
import { ZHomeCalendarInputSchema } from "./calendar.schema";
import { ZPeekInputSchema } from "./peek.schema";
import { ZSetServicePricesInputSchema } from "./setServicePrices.schema";

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
  notifications: authedProcedure.query(async ({ ctx }) => {
    const { notificationsHandler } = await import("./notifications.handler");
    return notificationsHandler({ ctx });
  }),
  moneySaved: authedProcedure.query(async ({ ctx }) => {
    const { getMoneySavedService } = await import("@calcom/features/money-saved/lib/getMoneySavedService");
    return getMoneySavedService().getSummary(ctx.user.id);
  }),
  setServicePrices: authedProcedure.input(ZSetServicePricesInputSchema).mutation(async ({ ctx, input }) => {
    const { getMoneySavedService } = await import("@calcom/features/money-saved/lib/getMoneySavedService");
    await getMoneySavedService().setServicePrices(ctx.user.id, input.prices);
    return { ok: true };
  }),
  applySetup: authedProcedure.input(ZApplySetupInputSchema).mutation(async ({ ctx, input }) => {
    const { applySetupHandler } = await import("./applySetup.handler");
    return applySetupHandler({ ctx, input });
  }),
});
