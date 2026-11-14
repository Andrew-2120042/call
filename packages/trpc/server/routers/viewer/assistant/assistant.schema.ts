import { z } from "zod";

export const ZAssistantChatInputSchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(2000) }))
    .min(1)
    .max(20),
});

export type TAssistantChatInputSchema = z.infer<typeof ZAssistantChatInputSchema>;
