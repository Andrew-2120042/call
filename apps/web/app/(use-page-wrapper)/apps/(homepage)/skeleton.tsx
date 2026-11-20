"use client";

import { CURATED_APP_GROUPS } from "@calcom/features/apps-curation/curatedApps";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { SkeletonContainer, SkeletonText } from "@calcom/ui/components/skeleton";
import Shell from "~/shell/Shell";

/** Mirrors curated-apps-view: the same groups, card grid and card shape, so the page doesn't jump on load. */
export function AppHomePageSkeleton() {
  const { t } = useLocale();
  return (
    <Shell heading={t("apps")} subtitle={t("apps_page_subtitle")}>
      <SkeletonContainer>
        <div className="mx-auto max-w-4xl space-y-10">
          {CURATED_APP_GROUPS.map((group) => (
            <section key={group.id}>
              <SkeletonText className="h-4 w-28" />
              <SkeletonText className="mt-2 h-3 w-72" />
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {group.apps.map((app) => (
                  <li
                    key={app.slug}
                    className="bg-default border-subtle flex h-[86px] items-start gap-3 rounded-lg border p-4">
                    <div className="bg-muted border-subtle h-9 w-9 flex-none rounded-md border" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <SkeletonText className="h-4 w-24" />
                        <SkeletonText className="h-6 w-16" />
                      </div>
                      <SkeletonText className="mt-2 h-3 w-full" />
                      <SkeletonText className="mt-1.5 h-3 w-2/3" />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </SkeletonContainer>
    </Shell>
  );
}
