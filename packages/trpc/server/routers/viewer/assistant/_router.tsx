import authedProcedure from "../../../procedures/authedProcedure";
import { router } from "../../../trpc";
import { ZAssistantChatInputSchema } from "./assistant.schema";

export const assistantRouter = router({
  status: authedProcedure.query(async () => {
    const { statusHandler } = await import("./assistant.handler");
    return statusHandler();
  }),
  chat: authedProcedure.input(ZAssistantChatInputSchema).mutation(async ({ ctx, input }) => {
    const { chatHandler } = await import("./assistant.handler");
    return chatHandler({ ctx, input });
  }),
});
