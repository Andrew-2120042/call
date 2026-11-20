import { RebookOfferEmail } from "@calcom/emails/templates/rebook-offer-email";
import { getAvailableSlotsService } from "@calcom/features/di/containers/AvailableSlots";
import { getTranslation } from "@calcom/i18n/server";
import { getPlanService } from "@calcom/features/plans/lib/getPlanService";
import { WEBAPP_URL } from "@calcom/lib/constants";
import { prisma } from "@calcom/prisma";
import { RebookRepository } from "../repositories/RebookRepository";
import { RebookOfferService } from "../services/RebookOfferService";
import { getRebookSuggestionService } from "./getRebookSuggestionService";

let service: RebookOfferService | null = null;

export function getRebookOfferService(): RebookOfferService {
  if (service) return service;
  service = new RebookOfferService({
    repository: new RebookRepository(prisma),
    suggestions: getRebookSuggestionService(),
    findOpenTimes: async ({ eventTypeId, timeZone, from, to }) => {
      const { slots } = await getAvailableSlotsService().getAvailableSlots({
        input: {
          eventTypeId,
          timeZone,
          startTime: from.toISOString(),
          endTime: to.toISOString(),
          isTeamEvent: false,
          orgSlug: null,
        },
      });
      return Object.values(slots)
        .flat()
        .filter((slot) => !slot.away)
        .map((slot) => slot.time);
    },
    send: async ({ to, ...email }) => {
      const t = await getTranslation(to.locale || "en", "common");
      await new RebookOfferEmail({ ...email, to, t }).sendEmail();
    },
    isFollowUpEntitled: (userId) => getPlanService().hasFeature(userId, "rebookFollowUp"),
    appUrl: WEBAPP_URL,
  });
  return service;
}
