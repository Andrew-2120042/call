import authedProcedure from "../../../procedures/authedProcedure";
import { router } from "../../../trpc";
import { ZGetRequestInsightInputSchema } from "./get.schema";
import { ZSendRequestReplyInputSchema } from "./sendReply.schema";

export const requestInsightsRouter = router({
  get: authedProcedure.input(ZGetRequestInsightInputSchema).query(async ({ ctx, input }) => {
    const { getHandler } = await import("./get.handler");
    return getHandler({ ctx, input });
  }),
  sendReply: authedProcedure.input(ZSendRequestReplyInputSchema).mutation(async ({ ctx, input }) => {
    const { sendReplyHandler } = await import("./sendReply.handler");
    return sendReplyHandler({ ctx, input });
  }),
});
