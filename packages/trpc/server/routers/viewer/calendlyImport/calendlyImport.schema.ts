import { z } from "zod";

const token = z.string().trim().min(20).max(4000);

export const ZCalendlyPreviewInputSchema = z.object({ token });
export const ZCalendlyRunInputSchema = z.object({
  token,
  serviceUris: z.array(z.string().max(500)).max(200),
  scheduleUri: z.string().max(500).nullable(),
  makeScheduleDefault: z.boolean(),
});

export type TCalendlyPreviewInputSchema = z.infer<typeof ZCalendlyPreviewInputSchema>;
export type TCalendlyRunInputSchema = z.infer<typeof ZCalendlyRunInputSchema>;
