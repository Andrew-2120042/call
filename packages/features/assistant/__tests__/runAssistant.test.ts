import { describe, expect, it, vi } from "vitest";
import { runAssistant } from "../lib/runAssistant";
import type { IAssistantActions } from "../lib/types";

// A stand-in for client.beta.messages.toolRunner: calls the tools the "model" picked, like the SDK does.
function fakeClient(script: { tool: string; input: Record<string, unknown> }[], reply: string) {
  const toolRunner = vi.fn(
    async (params: { tools: { name: string; run: (input: never) => Promise<string> }[] }) => {
      for (const step of script) {
        const tool = params.tools.find((t) => t.name === step.tool);
        if (!tool) throw new Error(`unknown tool ${step.tool}`);
        await tool.run(step.input as never);
      }
      return { stop_reason: "end_turn", content: [{ type: "text", text: reply }] };
    }
  );
  return { client: { beta: { messages: { toolRunner } } } as never, toolRunner };
}

function fakeActions(): IAssistantActions & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    getPage: vi.fn(async () => ({
      name: "Sam",
      bio: "",
      theme: "fog",
      buttonShape: "rounded",
      services: [],
    })),
    createService: vi.fn(async (userId, input) => {
      calls.push(`create:${userId}:${input.title}`);
      return {
        id: 1,
        title: input.title,
        minutes: input.minutes,
        description: null,
        needsApproval: input.needsApproval,
        hidden: false,
        url: "http://x/sam/intro",
      };
    }),
    updateService: vi.fn(async (userId, id) =>
      id === 1
        ? {
            id: 1,
            title: "Intro",
            minutes: 20,
            description: null,
            needsApproval: false,
            hidden: false,
            url: "u",
          }
        : null
    ),
    updateProfile: vi.fn(async () => undefined),
    setLook: vi.fn(async () => undefined),
  };
}

describe("runAssistant", () => {
  it("uses Haiku with low effort and returns the reply plus what it changed", async () => {
    const actions = fakeActions();
    const { client, toolRunner } = fakeClient(
      [
        { tool: "get_page", input: {} },
        { tool: "create_service", input: { title: "Intro call", minutes: 20, needsApproval: false } },
        { tool: "update_profile", input: { bio: "I help new managers lead." } },
        { tool: "set_page_look", input: { theme: "sky" } },
      ],
      "Added an intro call and wrote your bio."
    );
    const result = await runAssistant({
      client,
      actions,
      userId: 7,
      messages: [{ role: "user", content: "I coach new managers" }],
    });

    expect(toolRunner.mock.calls[0][0]).toMatchObject({
      model: "claude-haiku-5-5",
      output_config: { effort: "low" },
    });
    expect(actions.calls).toEqual(["create:7:Intro call"]);
    expect(result.reply).toBe("Added an intro call and wrote your bio.");
    expect(result.actions).toEqual([
      { type: "service_created", title: "Intro call", minutes: 20, url: "http://x/sam/intro" },
      { type: "profile_updated", fields: ["bio"] },
      { type: "look_updated", theme: "sky" },
    ]);
  });

  it("reports a missing service instead of claiming a change", async () => {
    const actions = fakeActions();
    const { client } = fakeClient(
      [{ tool: "update_service", input: { serviceId: 99, hidden: true } }],
      "Couldn't find it."
    );
    const result = await runAssistant({
      client,
      actions,
      userId: 7,
      messages: [{ role: "user", content: "hide it" }],
    });
    expect(result.actions).toEqual([]);
  });

  it("handles a refusal politely", async () => {
    const client = {
      beta: { messages: { toolRunner: vi.fn(async () => ({ stop_reason: "refusal", content: [] })) } },
    } as never;
    const result = await runAssistant({
      client,
      actions: fakeActions(),
      userId: 1,
      messages: [{ role: "user", content: "x" }],
    });
    expect(result.reply).toMatch(/can't help/);
  });
});
