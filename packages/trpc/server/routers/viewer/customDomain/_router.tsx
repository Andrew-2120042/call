import authedProcedure from "../../../procedures/authedProcedure";
import { router } from "../../../trpc";
import { ZAddCustomDomainInputSchema } from "./customDomain.schema";

export const customDomainRouter = router({
  get: authedProcedure.query(async ({ ctx }) => {
    const { getHandler } = await import("./customDomain.handler");
    return getHandler({ ctx });
  }),
  add: authedProcedure.input(ZAddCustomDomainInputSchema).mutation(async ({ ctx, input }) => {
    const { addHandler } = await import("./customDomain.handler");
    return addHandler({ ctx, input });
  }),
  verify: authedProcedure.mutation(async ({ ctx }) => {
    const { verifyHandler } = await import("./customDomain.handler");
    return verifyHandler({ ctx });
  }),
  remove: authedProcedure.mutation(async ({ ctx }) => {
    const { removeHandler } = await import("./customDomain.handler");
    return removeHandler({ ctx });
  }),
});
