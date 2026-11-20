import { getDefaultLocations } from "@calcom/app-store/_utils/getDefaultLocations";
import { isAssistantConfigured, runAssistantTurn } from "@calcom/features/assistant/lib/getAssistant";
import { AssistantActionsRepository } from "@calcom/features/assistant/repositories/AssistantActionsRepository";
import { getPlanService } from "@calcom/features/plans/lib/getPlanService";
import { checkTrpcRateLimit } from "../../../lib/checkTrpcRateLimit";
import { WEBAPP_URL } from "@calcom/lib/constants";
import logger from "@calcom/lib/logger";
import { prisma } from "@calcom/prisma";
import { TRPCError } from "@trpc/server";
import type { TAssistantChatInputSchema } from "./assistant.schema";
import { type AssistantCtx, createAssistantInbox } from "./assistantInbox";

const log = logger.getSubLogger({ prefix: ["[assistant]"] });

export const statusHandler = async ({ ctx }: { ctx: AssistantCtx }) => ({
  configured: isAssistantConfigured(),
  // The assistant is a Pro feature (it runs on a paid AI model); Free accounts see the trial offer instead.
  allowed: await getPlanService().hasFeature(ctx.user.id, "assistant"),
});

export const chatHandler = async ({
  ctx,
  input,
}: {
  ctx: AssistantCtx;
  input: TAssistantChatInputSchema;
}) => {
  if (!isAssistantConfigured()) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "The assistant isn't set up on this server yet.",
    });
  }
  if (!(await getPlanService().hasFeature(ctx.user.id, "assistant"))) {
    throw new TRPCError({ code: "FORBIDDEN", message: "The assistant is part of Pro. Start a free trial to use it." });
  }
  await checkTrpcRateLimit(`assistant:${ctx.user.id}`);
  if (input.messages[input.messages.length - 1].role !== "user") {
    throw new TRPCError({ code: "BAD_REQUEST", message: "The last message must be yours." });
  }

  const actions = new AssistantActionsRepository(prisma, {
    webappUrl: WEBAPP_URL,
    username: ctx.user.username,
    profileId: ctx.user.profile?.id ?? null,
    defaultLocations: await getDefaultLocations(ctx.user),
  });
  try {
    const result = await runAssistantTurn({
      actions,
      inbox: createAssistantInbox(ctx),
      userId: ctx.user.id,
      timeZone: ctx.user.timeZone,
      messages: input.messages,
    });
    if (!result) throw new Error("assistant not configured");
    return result;
  } catch (error) {
    log.error("assistant run failed", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "The assistant had a problem. Try again in a moment.",
    });
  }
};
