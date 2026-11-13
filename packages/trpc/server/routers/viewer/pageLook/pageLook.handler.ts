import { getPlanService } from "@calcom/features/plans/lib/getPlanService";
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
    pageTheme: user?.pageTheme ?? "fog",
    pageButtonShape: user?.pageButtonShape ?? "rounded",
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

/** Everything the booking page editor shows, in the same service order as the live page. */
export const editorHandler = async ({ ctx }: Ctx) => {
  const userId = ctx.user.id;
  const [user, services, canRemoveBranding] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        bio: true,
        username: true,
        avatarUrl: true,
        pageTheme: true,
        pageButtonShape: true,
        hideBranding: true,
      },
    }),
    prisma.eventType.findMany({
      where: { userId, teamId: null, parentId: null },
      orderBy: [{ position: "desc" }, { id: "asc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        length: true,
        price: true,
        currency: true,
        requiresConfirmation: true,
        hidden: true,
      },
    }),
    getPlanService().hasFeature(userId, "removeBranding"),
  ]);
  return {
    name: user?.name ?? "",
    bio: user?.bio ?? "",
    username: user?.username ?? null,
    avatarUrl: user?.avatarUrl ?? null,
    pageTheme: user?.pageTheme ?? "fog",
    pageButtonShape: user?.pageButtonShape ?? "rounded",
    brandingHidden: !!user?.hideBranding && canRemoveBranding,
    services,
  };
};
