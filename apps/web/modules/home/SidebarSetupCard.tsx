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
  const percent = Math.round((done / total) * 100);

  return (
    <Link
      href="/home"
      className="border-subtle hover:bg-subtle mb-3 hidden rounded-md border px-2.5 py-2 transition lg:block"
      data-testid="sidebar-setup">
      <span className="text-emphasis block text-[13px] font-medium">{t("setup_sidebar_title")}</span>
      <span className="bg-emphasis mt-2 block h-1 overflow-hidden rounded-full" aria-hidden>
        <span className="bg-inverted block h-full rounded-full" style={{ width: `${percent}%` }} />
      </span>
      <span className="text-subtle mt-1.5 block text-[11px]">{t("setup_percent_done", { percent })}</span>
    </Link>
  );
}
