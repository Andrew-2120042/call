import { createNextApiHandler } from "@calcom/trpc/server/createNextApiHandler";
import { homeRouter } from "@calcom/trpc/server/routers/viewer/home/_router";

export default createNextApiHandler(homeRouter);
