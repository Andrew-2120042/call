import { checkRateLimitAndThrowError } from "@calcom/lib/checkRateLimitAndThrowError";
import { HttpError } from "@calcom/lib/http-error";
import { TRPCError } from "@trpc/server";

/**
 * Rate limit inside a tRPC procedure. The shared helper throws an HttpError, which tRPC would report as a
 * generic 500; this turns it into a proper "too many requests" the client can show.
 */
export async function checkTrpcRateLimit(identifier: string) {
  try {
    await checkRateLimitAndThrowError({ rateLimitingType: "core", identifier });
  } catch (error) {
    if (error instanceof HttpError && error.statusCode === 429) {
      throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: error.message });
    }
    throw error;
  }
}
