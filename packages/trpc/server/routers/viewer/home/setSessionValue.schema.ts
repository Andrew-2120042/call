import { z } from "zod";

export const ZSetSessionValueInputSchema = z.object({ value: z.number().int().min(1).max(100000).nullable() });
