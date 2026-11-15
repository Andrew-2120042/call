"use client";

import dayjs from "@calcom/dayjs";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Icon } from "@calcom/ui/components/icon";
import { SettingsCardSkeleton } from "~/shell/skeletons";

const formatHour = (hour: number) => dayjs().hour(hour).minute(0).format("ha");

export function TeamCoverageCard({ teamId }: { teamId: number }) {
  const { t } = useLocale();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const query = trpc.viewer.teams.availability.useQuery({ teamId, timeZone });
  if (query.isPending) return <SettingsCardSkeleton />;
  if (!query.data) return null;
  const { days, members, gaps, firstHour, lastHour, unreadable } = query.data;
  const nameById = new Map(members.map((m) => [m.id, m.name]));
  const hours = Array.from({ length: lastHour - firstHour }, (_, i) => firstHour + i);
  const total = Math.max(1, members.length);

  return (
    <section className="border-subtle rounded-lg border" data-testid="team-coverage">
      <header className="border-subtle border-b px-5 py-4">
        <h3 className="text-emphasis text-sm font-medium">{t("team_coverage_title")}</h3>
        <p className="text-subtle mt-0.5 text-xs">
          {t("team_coverage_body", { timeZone, interpolation: { escapeValue: false } })}
        </p>
      </header>

      {unreadable.length > 0 && (
        <p
          className="border-subtle text-subtle border-b px-5 py-3 text-xs"
          data-testid="team-coverage-unreadable">
          {t("team_coverage_unreadable", {
            names: unreadable.map((m) => m.name).join(", "),
            interpolation: { escapeValue: false },
          })}
        </p>
      )}
      {gaps.length > 0 && (
        <ul className="border-subtle space-y-1.5 border-b px-5 py-3" data-testid="team-coverage-gaps">
          {gaps.map((gap) => (
            <li
              key={`${gap.date}-${gap.startHour}`}
              className="text-attention flex items-center gap-2 text-xs">
              <Icon name="triangle-alert" className="h-3.5 w-3.5 flex-none" />
              {t("team_coverage_gap", {
                day: dayjs(gap.date).format("dddd D MMM"),
                from: formatHour(gap.startHour),
                to: formatHour(gap.endHour),
                interpolation: { escapeValue: false },
              })}
            </li>
          ))}
        </ul>
      )}

      <div className="overflow-x-auto px-5 py-4">
        <table className="w-full min-w-[560px] table-fixed border-separate" style={{ borderSpacing: 3 }}>
          <thead>
            <tr>
              <th className="w-20" />
              {hours.map((h) => (
                <th key={h} scope="col" className="text-muted text-[10px] font-normal">
                  {h % 2 === 1 ? "" : formatHour(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day.date}>
                <th scope="row" className="text-subtle pr-2 text-left text-xs font-normal">
                  {dayjs(day.date).format("ddd D")}
                </th>
                {day.hours.map((slot) => {
                  const names = slot.free.map((id) => nameById.get(id) ?? "").join(", ");
                  const ratio = slot.free.length / total;
                  return (
                    <td
                      key={slot.hour}
                      title={
                        slot.free.length
                          ? `${formatHour(slot.hour)}: ${names}`
                          : `${formatHour(slot.hour)}: ${t("team_coverage_nobody")}`
                      }
                      className="h-6 rounded-[4px]"
                      style={{
                        background: slot.free.length
                          ? `rgba(37, 99, 235, ${0.18 + ratio * 0.72})`
                          : "var(--cal-bg-subtle)",
                      }}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-muted mt-3 text-[11px]">{t("team_coverage_legend", { count: members.length })}</p>
      </div>
    </section>
  );
}
