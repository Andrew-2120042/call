"use client";

import dayjs from "@calcom/dayjs";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import classNames from "@calcom/ui/classNames";
import { Icon } from "@calcom/ui/components/icon";
import Link from "next/link";
import { useMemo, useState } from "react";
import { usePeek } from "~/peek/peekStore";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SHOWN_PER_DAY = 3;

/** The host's month: who's booked, which are requests, and how many people wait for each day. */
export function HomeCalendar() {
  const { t } = useLocale();
  const openPeek = usePeek((state) => state.open);
  const [month, setMonth] = useState(() => dayjs().format("YYYY-MM"));
  const { data, isPending } = trpc.viewer.home.calendar.useQuery({ month }, { placeholderData: (previous) => previous });

  const monthStart = dayjs(`${month}-01`);
  const today = data ? dayjs().tz(data.timeZone).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
  // Weeks start on Monday; the grid runs from the Monday on/before the 1st to the Sunday on/after the last day.
  const gridStart = monthStart.subtract((monthStart.day() + 6) % 7, "day");
  const monthEnd = monthStart.endOf("month");
  const gridEnd = monthEnd.add((7 - monthEnd.day()) % 7, "day");
  const days: string[] = [];
  for (let day = gridStart; !day.isAfter(gridEnd, "day"); day = day.add(1, "day")) days.push(day.format("YYYY-MM-DD"));

  const byDay = useMemo(() => {
    const map = new Map<string, NonNullable<typeof data>["bookings"]>();
    for (const booking of data?.bookings ?? []) {
      const list = map.get(booking.day) ?? [];
      list.push(booking);
      map.set(booking.day, list);
    }
    return map;
  }, [data]);

  const monthBookings = (data?.bookings ?? []).filter((booking) => booking.day.startsWith(month));
  const requests = monthBookings.filter((booking) => booking.isRequest).length;
  const waiting = Object.entries(data?.waitlistByDay ?? {})
    .filter(([day]) => day.startsWith(month))
    .reduce((sum, [, count]) => sum + count, 0);

  return (
    <section className="border-subtle overflow-hidden rounded-lg border" data-testid="home-calendar">
      <header className="border-subtle flex flex-wrap items-center gap-4 border-b px-5 py-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-emphasis text-[15px] font-medium">{monthStart.format("MMMM YYYY")}</h2>
          <p className="text-subtle mt-0.5 text-[12px]">
            {t("home_calendar_summary", { booked: monthBookings.length - requests, requests, waiting })}
          </p>
        </div>
        <div className="text-subtle flex items-center gap-3 text-[12px]">
          <Legend className="bg-[var(--cal-text-emphasis)]" label={t("home_calendar_booked")} />
          <Legend className="bg-amber-400" label={t("home_calendar_request")} />
          <Legend className="bg-sky-400" label={t("home_calendar_waiting")} />
        </div>
        <div className="border-subtle flex items-center rounded-md border">
          <button
            type="button"
            aria-label={t("previous_month")}
            onClick={() => setMonth(monthStart.subtract(1, "month").format("YYYY-MM"))}
            className="text-subtle hover:text-emphasis grid h-7 w-7 place-items-center">
            <Icon name="arrow-left" className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setMonth(dayjs().format("YYYY-MM"))}
            className="border-subtle text-default hover:text-emphasis h-7 border-x px-2.5 text-[12px]">
            {t("today")}
          </button>
          <button
            type="button"
            aria-label={t("next_month")}
            onClick={() => setMonth(monthStart.add(1, "month").format("YYYY-MM"))}
            className="text-subtle hover:text-emphasis grid h-7 w-7 place-items-center">
            <Icon name="arrow-right" className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="border-subtle grid grid-cols-7 border-b">
            {DAY_NAMES.map((name) => (
              <div key={name} className="text-subtle px-3 py-2 text-[11px] uppercase tracking-[0.06em]">
                {name}
              </div>
            ))}
          </div>
          <div className={classNames("grid grid-cols-7", isPending && !data && "opacity-50")}>
            {days.map((day, index) => {
              const inMonth = day.startsWith(month);
              const list = byDay.get(day) ?? [];
              const waitingCount = data?.waitlistByDay[day] ?? 0;
              return (
                <div
                  key={day}
                  className={classNames(
                    "border-subtle min-h-[112px] border-b p-2",
                    index % 7 !== 6 && "border-r",
                    !inMonth && "bg-muted/40"
                  )}
                  data-testid={`home-calendar-day-${day}`}>
                  <div className="flex items-center justify-between">
                    <span
                      className={classNames(
                        "grid h-5 min-w-5 place-items-center rounded px-1 text-[12px] tabular-nums",
                        day === today ? "bg-inverted text-inverted" : inMonth ? "text-emphasis" : "text-muted"
                      )}>
                      {dayjs(day).date()}
                    </span>
                    {waitingCount > 0 && (
                      <Link
                        href="/waitlist"
                        className="text-sky-300 hover:text-sky-200 inline-flex items-center gap-1 text-[11px]"
                        title={t("home_calendar_waiting_title", { count: waitingCount })}>
                        <Icon name="users" className="h-3 w-3" />
                        {waitingCount}
                      </Link>
                    )}
                  </div>
                  <ul className="mt-1.5 space-y-1">
                    {list.slice(0, SHOWN_PER_DAY).map((booking) => (
                      <li key={booking.uid} className="group/chip relative">
                        <button
                          type="button"
                          onClick={() => openPeek({ kind: "booking", uid: booking.uid })}
                          data-testid="home-calendar-chip"
                          className={classNames(
                            "w-full text-left",
                            "flex items-center gap-1.5 rounded border px-1.5 py-0.5 text-[11px] transition",
                            booking.isRequest
                              ? "border-amber-400/30 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20"
                              : "border-subtle bg-subtle text-default hover:text-emphasis"
                          )}>
                          <span className="min-w-0 flex-1 truncate">{booking.attendeeName}</span>
                          <span className="shrink-0 opacity-70">{booking.time}</span>
                        </button>
                        {/* Hover card: a quick look before opening the full panel. */}
                        <div
                          role="tooltip"
                          className="bg-default border-subtle pointer-events-none absolute left-0 top-full z-20 mt-1 hidden w-56 rounded-md border p-2.5 shadow-xl group-hover/chip:block">
                          <p className="text-emphasis text-[12px] font-medium">{booking.attendeeName}</p>
                          <p className="text-subtle text-[11px]">{booking.service}</p>
                          <p className="text-default mt-1.5 text-[11px]">
                            {dayjs(day).format("ddd D MMM")}, {booking.time}
                          </p>
                          <p className={classNames("mt-1 text-[11px]", booking.isRequest ? "text-amber-300" : "text-emerald-300")}>
                            {t(booking.isRequest ? "home_calendar_hover_request" : "home_calendar_hover_booked")}
                          </p>
                          <p className="text-subtle mt-1.5 text-[11px]">{t("home_calendar_hover_hint")}</p>
                        </div>
                      </li>
                    ))}
                    {list.length > SHOWN_PER_DAY && (
                      <li>
                        <Link href="/bookings/upcoming" className="text-subtle hover:text-emphasis px-1.5 text-[11px]">
                          {t("home_calendar_more", { count: list.length - SHOWN_PER_DAY })}
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={classNames("h-1.5 w-1.5 rounded-full", className)} />
      {label}
    </span>
  );
}
