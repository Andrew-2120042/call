import { createNextApiHandler } from "@calcom/trpc/server/createNextApiHandler";
import { bookingRulesRouter } from "@calcom/trpc/server/routers/viewer/bookingRules/_router";

export default createNextApiHandler(bookingRulesRouter);
