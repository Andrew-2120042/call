"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import Link from "next/link";

/** Compact setup progress at the bottom of the sidebar; disappears once everything is done. */
export function SidebarSetupCard() {
  const { t } = useLocale();
  const { data } = trpc.viewer.home.get.useQuery(undefined, { staleTime: 60_000 });
  if (!data) return null;
  const done = data.setup.filter((step) => step.done).length;
  const total = data.setup.length;
  if (done === total) return null;
  const next = data.setup.find((step) => !step.done);
  const percent = Math.round((done / total) * 100);

  return (
    <div className="bg-default mx-0 mb-3 hidden rounded-2xl p-4 lg:block" data-testid="sidebar-setup">
      <div
        className="grid h-12 w-12 place-items-center rounded-full"
        style={{
          background: `conic-gradient(var(--cal-text-emphasis) ${percent * 3.6}deg, var(--cal-bg-emphasis) 0)`,
        }}
        aria-hidden>
        <div className="bg-default text-emphasis grid h-[40px] w-[40px] place-items-center rounded-full text-xs font-semibold">
          {percent}%
        </div>
      </div>
      <p className="text-emphasis mt-3 text-sm font-semibold">{t("setup_sidebar_title")}</p>
      <p className="text-subtle text-xs">{t("setup_progress", { done, total })}</p>
      {next && (
        <Link
          href={next.href}
          className="bg-inverted text-inverted mt-3 block rounded-full px-4 py-2 text-center text-sm font-medium">
          {t(`setup_step_${next.id}`)}
        </Link>
      )}
    </div>
  );
}
