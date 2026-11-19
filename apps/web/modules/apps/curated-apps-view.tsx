"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Icon } from "@calcom/ui/components/icon";
import classNames from "classnames";
import Link from "next/link";
import Shell from "~/shell/Shell";

export type CuratedAppCard = {
  slug: string;
  name: string;
  logo: string | null;
  descriptionKey: string;
  status: "connected" | "available" | "unavailable";
  href: string;
};

type Group = { id: string; titleKey: string; subtitleKey: string; apps: CuratedAppCard[] };

export default function CuratedAppsView({ groups }: { groups: Group[] }) {
  const { t } = useLocale();
  return (
    <Shell heading={t("apps")} subtitle={t("apps_page_subtitle")}>
      <div className="mx-auto max-w-4xl space-y-10" data-testid="curated-apps">
        {groups.map((group) => (
          <section key={group.id} aria-labelledby={`apps-${group.id}`}>
            <h2 id={`apps-${group.id}`} className="text-emphasis text-[15px] font-semibold">
              {t(group.titleKey)}
            </h2>
            <p className="text-subtle mt-0.5 text-[13px]">{t(group.subtitleKey)}</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {group.apps.map((app) => (
                <li key={app.slug}>
                  <AppCard app={app} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Shell>
  );
}

function AppCard({ app }: { app: CuratedAppCard }) {
  const { t } = useLocale();
  const unavailable = app.status === "unavailable";
  const content = (
    <div
      className={classNames(
        "bg-default border-subtle flex h-full items-start gap-3 rounded-lg border p-4 transition-colors",
        unavailable ? "opacity-60" : "hover:border-emphasis"
      )}
      data-testid={`app-card-${app.slug}`}>
      <div className="bg-muted border-subtle grid h-9 w-9 flex-none place-items-center rounded-md border">
        {app.logo ? (
          // biome-ignore lint/performance/noImgElement: app logos are small static SVGs from the app store
          <img src={app.logo} alt="" className="h-6 w-6 object-contain" />
        ) : (
          <Icon name="webhook" className="text-emphasis h-5 w-5" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-emphasis truncate font-semibold">{app.name}</p>
          {app.status === "connected" ? (
            <span className="text-emphasis inline-flex flex-none items-center gap-1 text-xs font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {t("apps_connected")}
            </span>
          ) : unavailable ? (
            <span className="text-subtle flex-none text-xs">{t("apps_coming_soon")}</span>
          ) : (
            <span className="border-default text-emphasis flex-none rounded-md border px-2.5 py-1 text-[12px] font-medium">
              {t("apps_connect")}
            </span>
          )}
        </div>
        <p className="text-subtle mt-1 text-sm leading-snug">{t(app.descriptionKey)}</p>
      </div>
    </div>
  );
  if (unavailable) return content;
  return (
    <Link
      href={app.href}
      className="block h-full rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2">
      {content}
    </Link>
  );
}
