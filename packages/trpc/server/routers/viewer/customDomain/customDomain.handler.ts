import { getCustomDomainService } from "@calcom/features/custom-domains/lib/getCustomDomainService";
import { getPlanService } from "@calcom/features/plans/lib/getPlanService";
import { ErrorCode } from "@calcom/lib/errorCodes";
import { ErrorWithCode } from "@calcom/lib/errors";
import type { TrpcSessionUser } from "@calcom/trpc/server/types";
import { TRPCError } from "@trpc/server";
import type { TAddCustomDomainInputSchema } from "./customDomain.schema";

type Ctx = { ctx: { user: NonNullable<TrpcSessionUser> } };

const TRPC_CODES: Partial<Record<ErrorCode, TRPCError["code"]>> = {
  [ErrorCode.Forbidden]: "FORBIDDEN",
  [ErrorCode.BadRequest]: "BAD_REQUEST",
  [ErrorCode.NotFound]: "NOT_FOUND",
};

async function run<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof ErrorWithCode && TRPC_CODES[error.code]) {
      throw new TRPCError({
        code: TRPC_CODES[error.code] ?? "INTERNAL_SERVER_ERROR",
        message: error.message,
      });
    }
    throw error;
  }
}

export const getHandler = async ({ ctx }: Ctx) => {
  const [domain, entitled] = await Promise.all([
    getCustomDomainService().get(ctx.user.id),
    getPlanService().hasFeature(ctx.user.id, "customDomain"),
  ]);
  return { domain, entitled, username: ctx.user.username };
};

export const addHandler = ({ ctx, input }: Ctx & { input: TAddCustomDomainInputSchema }) =>
  run(() => getCustomDomainService().add(ctx.user.id, input.domain));

export const verifyHandler = ({ ctx }: Ctx) => run(() => getCustomDomainService().verify(ctx.user.id));

export const removeHandler = ({ ctx }: Ctx) =>
  run(async () => {
    await getCustomDomainService().remove(ctx.user.id);
    return { ok: true };
  });
