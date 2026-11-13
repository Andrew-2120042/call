import { createNextApiHandler } from "@calcom/trpc/server/createNextApiHandler";
import { calendlyImportRouter } from "@calcom/trpc/server/routers/viewer/calendlyImport/_router";

export default createNextApiHandler(calendlyImportRouter);
