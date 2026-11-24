import { z } from "zod";

export const ZSetServicePricesInputSchema = z.object({
  prices: z
    .array(z.object({ eventTypeId: z.number().int(), price: z.number().int().min(1).max(100000).nullable() }))
    .max(200),
});
