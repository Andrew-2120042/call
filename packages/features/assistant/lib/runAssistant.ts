import type Anthropic from "@anthropic-ai/sdk";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import * as z from "zod/v4";
import type { AssistantAction, ChatMessage, IAssistantActions } from "./types";

export const DEFAULT_ASSISTANT_MODEL = "claude-haiku-5-5";
const MAX_TOOL_ROUNDS = 8;

const SYSTEM_PROMPT = `You are the setup assistant inside Nodslot, a booking page for coaches, creators, consultants and other solo service providers. You set things up for the owner instead of explaining how to.

What you can do with tools: read their page, create services, edit services (title, length, description, needs-approval, hide/show), and update their display name and bio.

How to work:
- Call get_page first when you need to know what exists, so you don't create duplicates.
- When the owner describes their work, propose and create a sensible starter set in one go (usually a short free intro call plus their main paid session), then summarise what you made in one or two sentences.
- Service titles are short and plain ("Intro call", "Coaching session"). Lengths are realistic (15-90 minutes unless they say otherwise).
- Use needsApproval=true for high-value, long or first-time sessions where the owner would want to screen people; false for quick intro calls.
- Bios are one or two sentences in the first person, specific about who they help. No hashtags, no emoji unless they use them.
- Prices: payments aren't available yet. If they mention a price, put it in the service description ("$150 per session") and say payments come later.
- You can't change availability, calendars, billing or how the page looks. Point them to Availability, Apps or Billing in one sentence.
- Keep replies short and concrete. Ask at most one question, and only when you truly can't make a reasonable choice.
- Write plain sentences. No markdown: no asterisks, no bullet characters, no headings.
- Only say you checked or confirmed something after you actually called get_page in this turn.`;

export async function runAssistant(options: {
  client: Anthropic;
  model?: string;
  actions: IAssistantActions;
  userId: number;
  messages: ChatMessage[];
}): Promise<{ reply: string; actions: AssistantAction[] }> {
  const { actions, userId } = options;
  const performed: AssistantAction[] = [];

  const tools = [
    betaZodTool({
      name: "get_page",
      description: "Read the owner's booking page: name, bio and all services (including hidden ones).",
      inputSchema: z.object({}),
      run: async () => JSON.stringify(await actions.getPage(userId)),
    }),
    betaZodTool({
      name: "create_service",
      description: "Create a new bookable service on the owner's page.",
      inputSchema: z.object({
        title: z.string().min(1).max(80).describe("Short service name, e.g. 'Intro call'"),
        minutes: z.number().int().min(5).max(480).describe("Length in minutes"),
        description: z.string().max(500).optional().describe("One or two sentences shown to clients"),
        needsApproval: z.boolean().describe("True if the owner approves each request before it is booked"),
      }),
      run: async (input) => {
        const service = await actions.createService(userId, input);
        performed.push({
          type: "service_created",
          title: service.title,
          minutes: service.minutes,
          url: service.url,
        });
        return JSON.stringify(service);
      },
    }),
    betaZodTool({
      name: "update_service",
      description: "Change an existing service. Only the fields you pass are changed.",
      inputSchema: z.object({
        serviceId: z.number().int().describe("id from get_page"),
        title: z.string().min(1).max(80).optional(),
        minutes: z.number().int().min(5).max(480).optional(),
        description: z.string().max(500).optional(),
        needsApproval: z.boolean().optional(),
        hidden: z.boolean().optional().describe("True hides it from the public page"),
      }),
      run: async ({ serviceId, ...patch }) => {
        const service = await actions.updateService(userId, serviceId, patch);
        if (!service) return "No service with that id on this page.";
        performed.push({ type: "service_updated", title: service.title });
        return JSON.stringify(service);
      },
    }),
    betaZodTool({
      name: "update_profile",
      description: "Update the owner's display name and/or bio shown at the top of their page.",
      inputSchema: z.object({
        name: z.string().min(1).max(80).optional(),
        bio: z.string().max(300).optional().describe("One or two sentences, first person"),
      }),
      run: async (patch) => {
        await actions.updateProfile(userId, patch);
        performed.push({ type: "profile_updated", fields: Object.keys(patch) });
        return "Saved.";
      },
    }),
  ];

  const finalMessage = await options.client.beta.messages.toolRunner({
    model: options.model || DEFAULT_ASSISTANT_MODEL,
    max_tokens: 4000,
    max_iterations: MAX_TOOL_ROUNDS,
    output_config: { effort: "low" },
    system: SYSTEM_PROMPT,
    tools,
    messages: options.messages.map((message) => ({ role: message.role, content: message.content })),
  });

  if (finalMessage.stop_reason === "refusal") {
    return {
      reply: "I can't help with that one. Try asking me to set up your services or bio.",
      actions: performed,
    };
  }
  const reply = finalMessage.content
    .filter((block): block is Extract<typeof block, { type: "text" }> => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
  return { reply: reply || "Done.", actions: performed };
}
