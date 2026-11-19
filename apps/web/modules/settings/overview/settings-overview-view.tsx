"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import classNames from "@calcom/ui/classNames";
import type { IconName } from "@calcom/ui/components/icon";
import { Icon } from "@calcom/ui/components/icon";
import { SkeletonText } from "@calcom/ui/components/skeleton";
import Link from "next/link";
import { useEffect, useState } from "react";

type HealthRow = { id: string; ok: boolean; status: string; href: string; action: string };

const AREAS: { id: string; icon: IconName; links: { label: string; href: string }[] }[] = [
  {
    id: "personal",
    icon: "user",
    links: [
      { label: "profile", href: "/settings/my-account/profile" },
      { label: "general", href: "/settings/my-account/general" },
      { label: "appearance", href: "/settings/my-account/appearance" },
      { label: "out_of_office", href: "/settings/my-account/out-of-office" },
    ],
  },
  {
    id: "calendars",
    icon: "calendar",
    links: [
      { label: "calendars", href: "/settings/my-account/calendars" },
      { label: "conferencing", href: "/settings/my-account/conferencing" },
    ],
  },
  {
    id: "billing",
    icon: "credit-card",
    links: [
      { label: "billing_page_title", href: "/settings/billing" },
      { label: "custom_domain_page_title", href: "/settings/domain" },
    ],
  },
  {
    id: "security",
    icon: "shield",
    links: [
      { label: "password", href: "/settings/security/password" },
      { label: "2fa_auth", href: "/settings/security/two-factor-auth" },
    ],
  },
  {
    id: "import",
    icon: "download",
    links: [{ label: "calendly_import_page_title", href: "/settings/import" }],
  },
  {
    id: "developer",
    icon: "terminal",
    links: [{ label: "webhooks", href: "/settings/developer/webhooks" }],
  },
];

/** One page that says what still needs setting up, then links into every settings area. */
export default function SettingsOverviewView() {
  const { t } = useLocale();
  const { data: home } = trpc.viewer.home.get.useQuery(undefined, { staleTime: 60_000 });
  const { data: me } = trpc.viewer.me.get.useQuery();
  const [plan, setPlan] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/billing/plan")
      .then((res) => (res.ok ? res.json() : null))
      .then((summary) => setPlan(summary?.plan ?? "FREE"))
      .catch(() => setPlan("FREE"));
  }, []);

  const step = (id: string) => home?.setup.find((s) => s.id === id)?.done ?? false;
  const rows: HealthRow[] | null =
    home && me
      ? [
          {
            id: "calendar",
            ok: step("calendar"),
            status: step("calendar") ? t("overview_connected") : t("overview_not_connected"),
            href: "/apps/categories/calendar",
            action: t("setup_action_calendar"),
          },
          {
            id: "video",
            ok: step("video"),
            status: step("video") ? t("overview_connected") : t("overview_not_connected"),
            href: "/apps/categories/conferencing",
            action: t("setup_action_video"),
          },
          {
            id: "profile",
            ok: step("photo") && step("bio"),
            status: step("photo") && step("bio") ? t("overview_complete") : t("overview_incomplete"),
            href: "/settings/my-account/profile",
            action: t("overview_finish_profile"),
          },
          {
            id: "two_factor",
            ok: !!me.twoFactorEnabled,
            status: me.twoFactorEnabled ? t("overview_on") : t("overview_off"),
            href: "/settings/security/two-factor-auth",
            action: t("overview_turn_on"),
          },
          {
            id: "plan",
            ok: plan === "PRO" || plan === "TEAM",
            status: plan ? t(`overview_plan_${plan.toLowerCase()}`) : "…",
            href: "/settings/billing",
            action: t("upgrade"),
          },
        ]
      : null;
  const needSetup = rows?.filter((row) => !row.ok).length ?? 0;

  return (
    <div className="space-y-8" data-testid="settings-overview">
      <section>
        <div className="flex items-center gap-4">
          <Ring done={rows ? rows.length - needSetup : 0} total={rows?.length ?? 5} />
          <div>
            <p className="text-emphasis text-[15px] font-semibold">
              {rows ? (needSetup ? t("overview_items_need_setup", { count: needSetup }) : t("overview_all_set")) : <SkeletonText className="w-40" />}
            </p>
            <p className="text-subtle text-[13px]">{t("overview_health_hint")}</p>
          </div>
        </div>
        <ul className="border-subtle mt-4 rounded-lg border">
          {(rows ?? []).map((row) => (
            <li key={row.id} className="border-subtle flex items-center gap-3 border-b px-4 py-2.5 last:border-b-0">
              <Icon
                name={row.ok ? "circle-check" : "circle-alert"}
                className={classNames("h-4 w-4 shrink-0", row.ok ? "text-success" : "text-subtle")}
              />
              <span className="text-default flex-1 text-[12px] font-medium uppercase tracking-[0.06em]">
                {t(`overview_row_${row.id}`)}
              </span>
              <span className={classNames("text-[12px]", row.ok ? "text-success" : "text-subtle")}>{row.status}</span>
              {!row.ok && (
                <Link
                  href={row.href}
                  className="border-subtle text-default hover:bg-subtle inline-flex h-7 items-center rounded-md border px-2.5 text-[12px] font-medium">
                  {row.action}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-subtle mb-3 text-[13px] font-medium">{t("overview_all_settings")}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {AREAS.map((area) => (
            <div key={area.id} className="border-subtle rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Icon name={area.icon} className="text-subtle h-4 w-4" />
                <p className="text-emphasis text-sm font-semibold">{t(`settings_group_${area.id}`)}</p>
              </div>
              <p className="text-subtle mt-1 text-[12px]">{t(`overview_area_${area.id}_hint`)}</p>
              <ul className="mt-3 space-y-1.5">
                {area.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-default hover:text-emphasis text-[13px] hover:underline">
                      {t(link.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Ring({ done, total }: { done: number; total: number }) {
  const percent = total ? Math.round((done / total) * 100) : 0;
  return (
    <div
      className="grid h-12 w-12 shrink-0 place-items-center rounded-full"
      style={{ background: `conic-gradient(var(--cal-text-emphasis) ${percent * 3.6}deg, var(--cal-bg-emphasis) 0)` }}
      aria-hidden>
      <div className="bg-default text-emphasis grid h-10 w-10 place-items-center rounded-full text-[11px] font-semibold">
        {done}/{total}
      </div>
    </div>
  );
}
