import { SupportFeedbackEmail } from "@calcom/emails/templates/support-feedback-email";
import logger from "@calcom/lib/logger";
import { prisma } from "@calcom/prisma";
import { FeedbackRepository } from "../repositories/FeedbackRepository";
import { FeedbackService } from "../services/FeedbackService";

let service: FeedbackService | null = null;

export function getFeedbackService(): FeedbackService {
  if (service) return service;
  service = new FeedbackService({
    repository: new FeedbackRepository(prisma),
    sendToSupport: async (email) => {
      await new SupportFeedbackEmail(email).sendEmail();
    },
    logger: logger.getSubLogger({ prefix: ["[feedback]"] }),
  });
  return service;
}
