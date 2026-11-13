import authedProcedure from "../../../procedures/authedProcedure";
import { router } from "../../../trpc";
import { ZCalendlyPreviewInputSchema, ZCalendlyRunInputSchema } from "./calendlyImport.schema";

export const calendlyImportRouter = router({
  preview: authedProcedure.input(ZCalendlyPreviewInputSchema).mutation(async ({ ctx, input }) => {
    const { previewHandler } = await import("./calendlyImport.handler");
    return previewHandler({ ctx, input });
  }),
  run: authedProcedure.input(ZCalendlyRunInputSchema).mutation(async ({ ctx, input }) => {
    const { runHandler } = await import("./calendlyImport.handler");
    return runHandler({ ctx, input });
  }),
});
