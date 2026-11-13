import { createNextApiHandler } from "@calcom/trpc/server/createNextApiHandler";
import { pageLookRouter } from "@calcom/trpc/server/routers/viewer/pageLook/_router";

export default createNextApiHandler(pageLookRouter);
