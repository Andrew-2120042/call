import { z } from "zod";

export const ZPeekInputSchema = z.object({
  kind: z.enum(["booking", "waitlist"]),
  uid: z.string().min(1).max(100),
});

export type TPeekInputSchema = z.infer<typeof ZPeekInputSchema>;
