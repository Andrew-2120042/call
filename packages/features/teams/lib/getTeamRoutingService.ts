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
  });
  return service;
}
