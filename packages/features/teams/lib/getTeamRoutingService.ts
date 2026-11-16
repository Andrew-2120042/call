import process from "node:process";
import Anthropic from "@anthropic-ai/sdk";
import { TeamRoutingService } from "../services/TeamRoutingService";
import { createClaudeTeamRouter } from "./claudeTeamRouter";
import { getTeamService } from "./getTeamService";

let service: TeamRoutingService | null = null;

/** Off (isEnabled false) unless ANTHROPIC_API_KEY is set. */
export function getTeamRoutingService(): TeamRoutingService {
  if (service) return service;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  service = new TeamRoutingService({
    getPublicPage: (slug) => getTeamService().getPublicPage(slug),
    router: apiKey
      ? createClaudeTeamRouter({ client: new Anthropic({ apiKey }), model: process.env.TEAM_ROUTING_MODEL })
      : null,
    findFreeMembers,
  });
  return service;
}

/** A member is free when one of their available ranges covers the whole window (same engine as the booking page). */
async function findFreeMembers({ memberIds, start, end }: { memberIds: number[]; start: Date; end: Date }) {
  const [{ default: dayjs }, { getUserAvailabilityService }, { findUsersForAvailabilityCheck }] =
    await Promise.all([
      import("@calcom/dayjs"),
      import("@calcom/features/di/containers/GetUserAvailability"),
      import("@calcom/features/availability/lib/findUsersForAvailabilityCheck"),
    ]);
  const availability = getUserAvailabilityService();
  const results = await Promise.all(
    memberIds.map(async (userId) => {
      try {
        const user = await findUsersForAvailabilityCheck({ where: { id: userId } });
        if (!user) return null;
        const { dateRanges } = await availability.getUserAvailability(
          {
            userId,
            dateFrom: dayjs(start).startOf("day"),
            dateTo: dayjs(end).endOf("day"),
            returnDateOverrides: false,
            silentlyHandleCalendarFailures: true,
          },
          { user }
        );
        const covered = dateRanges.some(
          (r) => r.start.valueOf() <= start.getTime() && r.end.valueOf() >= end.getTime()
        );
        return covered ? userId : null;
      } catch {
        return null;
      }
    })
  );
  return results.filter((id): id is number => id !== null);
}
