import { z } from "zod";

export const ZAssistantChatInputSchema = z.object({
  messages: z
    .array(z.union([
        z.object({ role: z.literal("user"), content: z.string().min(1).max(2000) }),
        // Assistant replies can carry a hidden plan marker (a confirmed list of booking changes) on top of the text.
        z.object({ role: z.literal("assistant"), content: z.string().min(1).max(8000) }),
      ]))
    .min(1)
    .max(20),
});

export type TAssistantChatInputSchema = z.infer<typeof ZAssistantChatInputSchema>;
