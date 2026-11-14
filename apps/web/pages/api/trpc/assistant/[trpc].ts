import { createNextApiHandler } from "@calcom/trpc/server/createNextApiHandler";
import { assistantRouter } from "@calcom/trpc/server/routers/viewer/assistant/_router";

export default createNextApiHandler(assistantRouter);
