"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Avatar } from "@calcom/ui/components/avatar";
import { SettingsCardSkeleton } from "~/shell/skeletons";

export function TeamInsightsCard({ teamId }: { teamId: number }) {
  const { t } = useLocale();
  const query = trpc.viewer.teams.insights.useQuery({ teamId });
  if (query.isPending) return <SettingsCardSkeleton />;
  if (!query.data) return null;
  const { bookings, perMember, waitlist, attendance, periodDays } = query.data;
  const stats = [
    {
      label: t("team_insights_bookings"),
      value: bookings.accepted,
      hint: t("team_insights_pending", { count: bookings.pending }),
    },
    {
      label: t("team_insights_refilled"),
      value: waitlist.refilled,
      hint: t("team_insights_waiting_now", { count: waitlist.waitingNow }),
    },
    {
      label: t("team_insights_hours_recovered"),
      value: waitlist.hoursRecovered,
      hint: t("team_insights_from_waitlist"),
    },
    {
      label: t("team_insights_confirmed"),
      value: attendance.confirmed,
      hint: t("team_insights_missed", { count: attendance.missed }),
    },
  ];
  const max = Math.max(1, ...perMember.map((m) => m.bookings));

  return (
    <section className="border-subtle rounded-lg border" data-testid="team-insights">
      <header className="border-subtle border-b px-5 py-4">
        <h3 className="text-emphasis text-sm font-medium">{t("team_insights_title")}</h3>
        <p className="text-subtle mt-0.5 text-xs">{t("team_insights_period", { count: periodDays })}</p>
      </header>
      <div className="divide-subtle grid grid-cols-2 divide-x divide-y sm:grid-cols-4 sm:divide-y-0">
        {stats.map((s) => (
          <div key={s.label} className="px-5 py-4">
            <p className="text-subtle text-xs">{s.label}</p>
            <p className="text-emphasis mt-1 text-2xl font-medium tabular-nums">{s.value}</p>
            <p className="text-muted mt-0.5 text-xs">{s.hint}</p>
          </div>
        ))}
      </div>
      <div className="border-subtle border-t px-5 py-4">
        <p className="text-subtle mb-3 text-xs">{t("team_insights_by_member")}</p>
        <ul className="space-y-2.5">
          {perMember.map((m) => (
            <li key={m.userId} className="flex items-center gap-3">
              <Avatar size="xs" imageSrc={m.avatarUrl} alt={m.name} />
              <span className="text-default w-36 truncate text-xs">{m.name}</span>
              <span className="bg-subtle relative h-2 flex-1 overflow-hidden rounded-full">
                <span
                  className="bg-brand-default absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${(m.bookings / max) * 100}%` }}
                />
              </span>
              <span className="text-subtle w-16 text-right text-xs tabular-nums">
                {m.bookings} · {m.share}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
