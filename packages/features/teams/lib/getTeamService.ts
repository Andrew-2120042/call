import { sendTeamInviteEmail } from "@calcom/emails/organization-email-service";
import { getTranslation } from "@calcom/i18n/server";
import { WEBAPP_URL } from "@calcom/lib/constants";
import { prisma } from "@calcom/prisma";
import { getPlanService } from "../../plans/lib/getPlanService";
import { TeamManagementRepository } from "../repositories/TeamManagementRepository";
import { TeamService } from "../services/TeamService";

let service: TeamService | null = null;

export function getTeamService(): TeamService {
  if (service) return service;
  service = new TeamService({
    repository: new TeamManagementRepository(prisma),
    hasPlanFeature: (userId, feature) => getPlanService().hasFeature(userId, feature),
    webappUrl: WEBAPP_URL,
    sendInvite: async (message) => {
      const language = await getTranslation(message.locale ?? "en", "common");
      await sendTeamInviteEmail({
        language,
        from: message.inviterName,
        to: message.to,
        teamName: message.teamName,
        joinLink: message.joinLink,
        isCalcomMember: message.isExistingUser,
        isAutoJoin: false,
        isOrg: false,
        parentTeamName: undefined,
        isExistingUserMovedToOrg: false,
        prevLink: null,
        newLink: null,
      });
    },
  });
  return service;
}
