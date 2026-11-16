import process from "node:process";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@calcom/prisma";
import { RebookRepository } from "../repositories/RebookRepository";
import { RebookSuggestionService } from "../services/RebookSuggestionService";
import { createClaudeRebookPicker } from "./claudeRebookPicker";

let service: RebookSuggestionService | null = null;

/** Without ANTHROPIC_API_KEY the suggestions still work, picked near the original time of day. */
export function getRebookSuggestionService(): RebookSuggestionService {
  if (service) return service;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  service = new RebookSuggestionService({
    repository: new RebookRepository(prisma),
    pick: apiKey
      ? createClaudeRebookPicker({ client: new Anthropic({ apiKey }), model: process.env.REBOOK_MODEL })
      : null,
  });
  return service;
}
