import { z } from "zod";

export const ZGetRequestInsightInputSchema = z.object({ bookingUid: z.string().min(1).max(100) });

export type TGetRequestInsightInputSchema = z.infer<typeof ZGetRequestInsightInputSchema>;
