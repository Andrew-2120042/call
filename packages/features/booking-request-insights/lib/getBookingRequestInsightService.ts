import process from "node:process";
import Anthropic from "@anthropic-ai/sdk";
import { getPlanService } from "@calcom/features/plans/lib/getPlanService";
import logger from "@calcom/lib/logger";
import { prisma } from "@calcom/prisma";
import { BookingRequestInsightRepository } from "../repositories/BookingRequestInsightRepository";
import { BookingRequestInsightService } from "../services/BookingRequestInsightService";
import { createClaudeInsightGenerator } from "./claudeInsightGenerator";

let service: BookingRequestInsightService | null = null;

/** The feature is off (a no-op) unless ANTHROPIC_API_KEY is set, so self-hosting needs no AI account. */
export function getBookingRequestInsightService(): BookingRequestInsightService {
  if (service) return service;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  service = new BookingRequestInsightService({
    repository: new BookingRequestInsightRepository(prisma),
    generate: apiKey
      ? createClaudeInsightGenerator({
          client: new Anthropic({ apiKey }),
          model: process.env.REQUEST_INSIGHTS_MODEL,
        })
      : null,
    logger: logger.getSubLogger({ prefix: ["[request-insights]"] }),
    isHostEntitled: (userId) => getPlanService().hasFeature(userId, "aiRequestInsights"),
    sendHostReply: async (reply) => {
      const [{ HostReplyEmail }, { getTranslation }] = await Promise.all([
        import("@calcom/emails/templates/host-reply-email"),
        import("@calcom/i18n/server"),
      ]);
      const t = await getTranslation(reply.to.locale || "en", "common");
      await new HostReplyEmail({ ...reply, t }).sendEmail();
    },
  });
  return service;
}
