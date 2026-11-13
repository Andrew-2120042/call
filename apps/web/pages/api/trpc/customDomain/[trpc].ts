import { createNextApiHandler } from "@calcom/trpc/server/createNextApiHandler";
import { customDomainRouter } from "@calcom/trpc/server/routers/viewer/customDomain/_router";

export default createNextApiHandler(customDomainRouter);
