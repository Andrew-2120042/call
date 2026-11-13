import { z } from "zod";

export const ZRemoveWaitlistEntryInputSchema = z.object({ uid: z.string().uuid() });

export type TRemoveWaitlistEntryInputSchema = z.infer<typeof ZRemoveWaitlistEntryInputSchema>;
