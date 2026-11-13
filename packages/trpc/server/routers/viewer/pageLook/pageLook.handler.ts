import { prisma } from "@calcom/prisma";
import type { TrpcSessionUser } from "@calcom/trpc/server/types";
import type { TUpdatePageLookInputSchema } from "./pageLook.schema";

type Ctx = { ctx: { user: NonNullable<TrpcSessionUser> } };

export const getHandler = async ({ ctx }: Ctx) => {
  const user = await prisma.user.findUnique({
    where: { id: ctx.user.id },
    select: { pageTheme: true, pageButtonShape: true, username: true },
  });
  return {
    pageTheme: user?.pageTheme ?? "paper",
    pageButtonShape: user?.pageButtonShape ?? "pill",
    username: user?.username ?? null,
  };
};

export const updateHandler = async ({ ctx, input }: Ctx & { input: TUpdatePageLookInputSchema }) => {
  const user = await prisma.user.update({
    where: { id: ctx.user.id },
    data: { pageTheme: input.pageTheme, pageButtonShape: input.pageButtonShape },
    select: { pageTheme: true, pageButtonShape: true },
  });
  return user;
};
