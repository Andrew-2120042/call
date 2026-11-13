import process from "node:process";
import { getDefaultLocations } from "@calcom/app-store/_utils/getDefaultLocations";
import { createCalendlyClient } from "@calcom/features/calendly-import/lib/calendlyClient";
import { CalendlyImportRepository } from "@calcom/features/calendly-import/repositories/CalendlyImportRepository";
import { CalendlyImportService } from "@calcom/features/calendly-import/services/CalendlyImportService";
import { checkRateLimitAndThrowError } from "@calcom/lib/checkRateLimitAndThrowError";
import { ErrorCode } from "@calcom/lib/errorCodes";
import { ErrorWithCode } from "@calcom/lib/errors";
import { prisma } from "@calcom/prisma";
import type { TrpcSessionUser } from "@calcom/trpc/server/types";
import { TRPCError } from "@trpc/server";
import type { TCalendlyPreviewInputSchema, TCalendlyRunInputSchema } from "./calendlyImport.schema";

type User = NonNullable<TrpcSessionUser>;

const TRPC_CODES: Partial<Record<ErrorCode, TRPCError["code"]>> = {
  [ErrorCode.BadRequest]: "BAD_REQUEST",
  [ErrorCode.NotFound]: "NOT_FOUND",
};

async function buildService(user: User) {
  const locations = await getDefaultLocations(user);
  return new CalendlyImportService({
    repository: new CalendlyImportRepository(prisma, { profileId: user.profile?.id ?? null, locations }),
    // CALENDLY_API_BASE_URL exists only so the import can be exercised against a local fake API.
    clientFor: (token) => createCalendlyClient(token, fetch, process.env.CALENDLY_API_BASE_URL || undefined),
  });
}

async function run<T>(user: User, fn: (service: CalendlyImportService) => Promise<T>): Promise<T> {
  await checkRateLimitAndThrowError({ rateLimitingType: "core", identifier: `calendlyImport:${user.id}` });
  try {
    return await fn(await buildService(user));
  } catch (error) {
    if (error instanceof ErrorWithCode) {
      throw new TRPCError({
        code: TRPC_CODES[error.code] ?? "INTERNAL_SERVER_ERROR",
        message: error.message,
      });
    }
    throw error;
  }
}

export const previewHandler = ({ ctx, input }: { ctx: { user: User }; input: TCalendlyPreviewInputSchema }) =>
  run(ctx.user, (service) => service.preview(ctx.user.id, input.token));

export const runHandler = ({ ctx, input }: { ctx: { user: User }; input: TCalendlyRunInputSchema }) =>
  run(ctx.user, (service) =>
    service.run(ctx.user.id, input.token, {
      serviceUris: input.serviceUris,
      scheduleUri: input.scheduleUri,
      makeScheduleDefault: input.makeScheduleDefault,
    })
  );
