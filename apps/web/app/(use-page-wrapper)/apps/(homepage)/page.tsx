import { getAppFromSlug } from "@calcom/app-store/utils";
import { CURATED_APP_GROUPS, CURATED_APP_SLUGS } from "@calcom/features/apps-curation/curatedApps";
import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import prisma from "@calcom/prisma";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { _generateMetadata } from "app/_utils";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import CuratedAppsView, { type CuratedAppCard } from "~/apps/curated-apps-view";

export const generateMetadata = async () => {
  return await _generateMetadata(
    (t) => t("apps"),
    (t) => t("apps_page_subtitle"),
    undefined,
    undefined,
    "/apps"
  );
};

const ServerPage = async () => {
  const req = buildLegacyRequest(await headers(), await cookies());
  const session = await getServerSession({ req });
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=/apps");
  const userId = session.user.id;

  const [dbApps, credentials] = await Promise.all([
    prisma.app.findMany({
      where: { slug: { in: CURATED_APP_SLUGS } },
      select: { slug: true, enabled: true, categories: true },
    }),
    prisma.credential.findMany({
      where: { userId, appId: { in: CURATED_APP_SLUGS } },
      select: { appId: true },
    }),
  ]);
  const connected = new Set(credentials.map((credential) => credential.appId));
  const webhookCount = await prisma.webhook.count({ where: { userId } });

  const groups = CURATED_APP_GROUPS.map((group) => ({
    id: group.id,
    titleKey: group.titleKey,
    subtitleKey: group.subtitleKey,
    apps: group.apps
      .map((curated): CuratedAppCard | null => {
        if (curated.href) {
          return {
            slug: curated.slug,
            name: curated.name ?? curated.slug,
            logo: null,
            descriptionKey: curated.descriptionKey,
            status: webhookCount > 0 ? "connected" : "available",
            href: curated.href,
          };
        }
        const meta = getAppFromSlug(curated.slug);
        const db = dbApps.find((app) => app.slug === curated.slug);
        if (!meta) return null;
        const category = db?.categories[0] ?? meta.categories?.[0] ?? "other";
        const isConnected = connected.has(curated.slug);
        return {
          slug: curated.slug,
          name: curated.name ?? meta.name,
          logo: meta.logo,
          descriptionKey: curated.descriptionKey,
          status: isConnected
            ? "connected"
            : db?.enabled && !curated.comingSoon
              ? "available"
              : "unavailable",
          href: isConnected ? `/apps/installed/${category}` : `/apps/${curated.slug}`,
        };
      })
      .filter((app): app is CuratedAppCard => app !== null),
  }));

  return <CuratedAppsView groups={groups} />;
};

export default ServerPage;
