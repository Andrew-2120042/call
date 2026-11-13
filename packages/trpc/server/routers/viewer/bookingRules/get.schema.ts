import { z } from "zod";

export const ZGetBookingRulesInputSchema = z.object({ eventTypeId: z.number().int().positive() });

export type TGetBookingRulesInputSchema = z.infer<typeof ZGetBookingRulesInputSchema>;
