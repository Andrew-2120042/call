import { createNextApiHandler } from "@calcom/trpc/server/createNextApiHandler";
import { requestInsightsRouter } from "@calcom/trpc/server/routers/viewer/requestInsights/_router";

export default createNextApiHandler(requestInsightsRouter);
