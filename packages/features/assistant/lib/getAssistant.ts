import process from "node:process";
import Anthropic from "@anthropic-ai/sdk";
import { runAssistant } from "./runAssistant";
import type { ChatMessage, IAssistantActions, IAssistantInbox } from "./types";

export const isAssistantConfigured = () => !!process.env.ANTHROPIC_API_KEY;

/** Runs one assistant turn with the server's key. Returns null when no key is configured. */
export async function runAssistantTurn(params: {
  actions: IAssistantActions;
  inbox?: IAssistantInbox;
  userId: number;
  messages: ChatMessage[];
}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return runAssistant({
    client: new Anthropic({ apiKey }),
    model: process.env.ASSISTANT_MODEL || undefined,
    ...params,
  });
}
