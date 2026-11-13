import { createNextApiHandler } from "@calcom/trpc/server/createNextApiHandler";
import { waitlistRouter } from "@calcom/trpc/server/routers/viewer/waitlist/_router";

export default createNextApiHandler(waitlistRouter);
