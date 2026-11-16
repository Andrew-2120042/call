import { z } from "zod";

export const ZSendRequestReplyInputSchema = z.object({
  bookingUid: z.string().min(1).max(100),
  message: z.string().min(1).max(4000),
});

export type TSendRequestReplyInputSchema = z.infer<typeof ZSendRequestReplyInputSchema>;
