import { z } from "zod";

export const ZHomeCalendarInputSchema = z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) });

export type THomeCalendarInput = z.infer<typeof ZHomeCalendarInputSchema>;
