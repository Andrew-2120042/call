import { getRebookOfferService } from "@calcom/features/rebook/lib/getRebookOfferService";
import logger from "@calcom/lib/logger";
import { z } from "zod";

const log = logger.getSubLogger({ prefix: ["sendRebookOfferEmail"] });

export const sendRebookOfferEmailPayloadSchema = z.object({
  bookingUid: z.string(),
  followUp: z.boolean().optional(),
});

export async function sendRebookOfferEmail(payload: string): Promise<void> {
  const { bookingUid, followUp } = sendRebookOfferEmailPayloadSchema.parse(JSON.parse(payload));
  const result = await getRebookOfferService().offer(bookingUid, new Date(), { followUp });
  log.debug(`Rebook offer for ${bookingUid}`, result);
}
