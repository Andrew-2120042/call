import { ErrorWithCode } from "@calcom/lib/errors";
import type { TRPCError } from "@trpc/server";
import { convertErrorWithCodeToTRPCError } from "../lib/toTRPCError";
import { middleware } from "../trpc";

/**
 * Converts ErrorWithCode thrown by services and repositories into a TRPCError with the matching status.
 * tRPC reports a failed resolver as an { ok: false } result rather than by throwing, so both paths are handled;
 * otherwise every ErrorWithCode would surface as a 500 Internal Server Error.
 */
export const errorConversionMiddleware = middleware(async ({ next }) => {
  try {
    const result = await next();
    if (!result.ok && result.error.cause instanceof ErrorWithCode) {
      return { ...result, error: convertErrorWithCodeToTRPCError(result.error.cause) as TRPCError };
    }
    return result;
  } catch (e) {
    throw convertErrorWithCodeToTRPCError(e);
  }
});
