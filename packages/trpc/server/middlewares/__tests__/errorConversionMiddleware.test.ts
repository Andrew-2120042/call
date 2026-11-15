import { ErrorWithCode } from "@calcom/lib/errors";
import { TRPCError } from "@trpc/server";
import { describe, expect, it } from "vitest";
import { createCallerFactory, procedure, router } from "../../trpc";
import { errorConversionMiddleware } from "../errorConversionMiddleware";

const testRouter = router({
  forbidden: procedure.use(errorConversionMiddleware).query(() => {
    throw ErrorWithCode.Factory.Forbidden("Not your team");
  }),
  notFound: procedure.use(errorConversionMiddleware).query(() => {
    throw ErrorWithCode.Factory.NotFound("No such team");
  }),
  plain: procedure.use(errorConversionMiddleware).query(() => {
    throw new TRPCError({ code: "CONFLICT", message: "Already exists" });
  }),
});

const caller = createCallerFactory(testRouter)({} as never);

describe("errorConversionMiddleware", () => {
  it("turns ErrorWithCode into the matching tRPC error instead of a 500", async () => {
    await expect(caller.forbidden()).rejects.toMatchObject({ code: "FORBIDDEN", message: "Not your team" });
    await expect(caller.notFound()).rejects.toMatchObject({ code: "NOT_FOUND", message: "No such team" });
  });

  it("leaves tRPC errors alone", async () => {
    await expect(caller.plain()).rejects.toMatchObject({ code: "CONFLICT", message: "Already exists" });
  });
});
