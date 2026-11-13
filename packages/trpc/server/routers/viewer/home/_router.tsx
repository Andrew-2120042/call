import authedProcedure from "../../../procedures/authedProcedure";
import { router } from "../../../trpc";

export const homeRouter = router({
  get: authedProcedure.query(async ({ ctx }) => {
    const { getHandler } = await import("./home.handler");
    return getHandler({ ctx });
  }),
});
