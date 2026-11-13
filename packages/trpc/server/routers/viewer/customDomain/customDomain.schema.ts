import { z } from "zod";

export const ZAddCustomDomainInputSchema = z.object({ domain: z.string().min(1).max(260) });

export type TAddCustomDomainInputSchema = z.infer<typeof ZAddCustomDomainInputSchema>;
