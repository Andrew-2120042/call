import { BUTTON_SHAPES, PAGE_THEME_IDS } from "@calcom/features/booking-page-theme/themes";
import { z } from "zod";

export const ZUpdatePageLookInputSchema = z.object({
  pageTheme: z.enum(PAGE_THEME_IDS as [string, ...string[]]).optional(),
  pageButtonShape: z.enum(BUTTON_SHAPES as [string, ...string[]]).optional(),
  /** Validated again with parsePageStyle before saving. */
  pageStyle: z.record(z.unknown()).optional(),
});

export type TUpdatePageLookInputSchema = z.infer<typeof ZUpdatePageLookInputSchema>;
