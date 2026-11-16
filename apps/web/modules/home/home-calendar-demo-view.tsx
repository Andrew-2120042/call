"use client";

import dayjs from "@calcom/dayjs";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Icon } from "@calcom/ui/components/icon";
import { RequestInsightLine } from "@calcom/web/modules/bookings/components/RequestInsightPanel";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const FIRST_HOUR = 7;
const LAST_HOUR = 21;
const HOUR_PX = 56;

type WeekBooking = {
  uid: string;
  title: string;
  startTime: Date | string;
  endTime: Date | string;
  status: string;
  attendees: { name: string }[];
};

/** Demo: a calendar-first Home. The week of bookings on the left, "your day" and what needs you on the right. */
export default function HomeCalendarDemoView() {
  const { t } = useLocale();
  const router = useRouter();
  const [weekStart, setWeekStart] = useState(() => dayjs().startOf("week"));
  const [now, setNow] = useState(() => dayjs());
  const [ask, setAsk] = useState("");
  // Dates, "now" and the greeting depend on the viewer's time zone, so they're only rendered in the browser.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    setWeekStart(dayjs().startOf("week"));
    setNow(dayjs());
  }, []);
  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const range = {
    afterStartDate: weekStart.toISOString(),
    beforeEndDate: weekStart.add(7, "day").toISOString(),
  };
  const query = (status: "upcoming" | "unconfirmed" | "past") =>
    trpc.viewer.bookings.get.useQuery({ limit: 100, offset: 0, filters: { statuses: [status], ...range } });
  const upcoming = query("upcoming");
  const unconfirmed = query("unconfirmed");
  const past = query("past");
  const me = trpc.viewer.me.get.useQuery();

  const bookings = useMemo(() => {
    const all = [
      ...(past.data?.bookings ?? []),
      ...(upcoming.data?.bookings ?? []),
      ...(unconfirmed.data?.bookings ?? []),
    ] as unknown as WeekBooking[];
    const seen = new Set<string>();
    return all.filter((b) => !seen.has(b.uid) && seen.add(b.uid) && b.status !== "CANCELLED" && b.status !== "REJECTED");
  }, [past.data, upcoming.data, unconfirmed.data]);

  const days = Array.from({ length: 7 }, (_, i) => weekStart.add(i, "day"));
  const hours = Array.from({ length: LAST_HOUR - FIRST_HOUR }, (_, i) => FIRST_HOUR + i);
  const requests = bookings.filter((b) => b.status === "PENDING" && dayjs(b.startTime).isAfter(now));
  const next = bookings
    .filter((b) => b.status !== "PENDING" && dayjs(b.startTime).isAfter(now))
    .sort((a, b) => dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf())[0];
  const todayCount = bookings.filter((b) => dayjs(b.startTime).isSame(now, "day")).length;
  const firstName = (me.data?.name ?? "").split(" ")[0];
  const greeting = now.hour() < 12 ? "home_good_morning" : now.hour() < 18 ? "home_good_afternoon" : "home_good_evening";

  if (!mounted) return <div className="h-[calc(100dvh-7rem)] min-h-[560px]" aria-hidden />;

  return (
    <div className="flex h-[calc(100dvh-7rem)] min-h-[560px] gap-4" data-testid="home-calendar-demo">
      <section className="border-subtle bg-default flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border">
        <header className="border-subtle flex items-center gap-2 border-b px-4 py-3">
          <button
            type="button"
            aria-label="Previous week"
            onClick={() => setWeekStart((w) => w.subtract(1, "week"))}
            className="hover:bg-subtle grid h-8 w-8 place-items-center rounded-lg">
            <Icon name="chevron-left" className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next week"
            onClick={() => setWeekStart((w) => w.add(1, "week"))}
            className="hover:bg-subtle grid h-8 w-8 place-items-center rounded-lg">
            <Icon name="chevron-right" className="h-4 w-4" />
          </button>
          <h1 className="text-emphasis ml-1 text-lg font-semibold">{weekStart.format("MMMM YYYY")}</h1>
          <button
            type="button"
            onClick={() => setWeekStart(dayjs().startOf("week"))}
            className="border-subtle text-default hover:bg-subtle ml-2 rounded-lg border px-2.5 py-1 text-xs">
            {t("today")}
          </button>
          <span className="text-subtle ml-auto flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500" /> {t("home_confirmed")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400" /> {t("service_kind_request")}
            </span>
          </span>
        </header>

        <div className="border-subtle grid grid-cols-[52px_repeat(7,1fr)] border-b">
          <div />
          {days.map((d) => {
            const isToday = d.isSame(now, "day");
            return (
              <div key={d.format("YYYY-MM-DD")} className="py-2 text-center text-xs">
                <span className={isToday ? "text-emphasis font-semibold" : "text-subtle"}>{d.format("ddd")} </span>
                <span
                  className={
                    isToday
                      ? "ml-0.5 inline-grid h-6 w-6 place-items-center rounded-full bg-blue-600 text-[11px] font-semibold text-white"
                      : "text-default"
                  }>
                  {d.format("D")}
                </span>
              </div>
            );
          })}
        </div>

        <div className="relative flex-1 overflow-y-auto">
          <div className="relative grid grid-cols-[52px_repeat(7,1fr)]" style={{ height: hours.length * HOUR_PX }}>
            <div>
              {hours.map((h) => (
                <div key={h} className="text-subtle pr-2 text-right text-[10px]" style={{ height: HOUR_PX }}>
                  {dayjs().hour(h).minute(0).format("ha")}
                </div>
              ))}
            </div>
            {days.map((d) => {
              const dayBookings = layoutLanes(bookings.filter((b) => dayjs(b.startTime).isSame(d, "day")));
              const isToday = d.isSame(now, "day");
              return (
                <div key={d.format("YYYY-MM-DD")} className="border-subtle relative border-l">
                  {hours.map((h) => (
                    <div key={h} className="border-subtle border-t" style={{ height: HOUR_PX }} />
                  ))}
                  {dayBookings.map(({ booking: b, lane, lanes }) => {
                    const start = dayjs(b.startTime);
                    const minutes = (start.hour() - FIRST_HOUR) * 60 + start.minute();
                    const length = Math.max(20, dayjs(b.endTime).diff(start, "minute"));
                    if (minutes < 0 || minutes > (LAST_HOUR - FIRST_HOUR) * 60) return null;
                    const isRequest = b.status === "PENDING";
                    return (
                      <Link
                        key={b.uid}
                        href={`/booking/${b.uid}`}
                        className={`absolute overflow-hidden rounded-md border-l-2 px-1.5 py-1 text-[11px] leading-tight transition hover:brightness-110 ${
                          isRequest
                            ? "border-amber-400 bg-amber-400/15 text-amber-100"
                            : "border-blue-500 bg-blue-500/20 text-blue-100"
                        }`}
                        style={{
                          top: (minutes / 60) * HOUR_PX + 1,
                          height: (length / 60) * HOUR_PX - 2,
                          left: `calc(${(lane / lanes) * 100}% + 3px)`,
                          width: `calc(${100 / lanes}% - 6px)`,
                        }}
                        title={b.title}>
                        <span className="block truncate font-medium">{b.attendees[0]?.name ?? b.title}</span>
                        <span className="block truncate opacity-80">{start.format("h:mma")}</span>
                      </Link>
                    );
                  })}
                  {isToday && now.hour() >= FIRST_HOUR && now.hour() < LAST_HOUR && (
                    <div
                      className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
                      style={{ top: ((now.hour() - FIRST_HOUR) * 60 + now.minute()) * (HOUR_PX / 60) }}>
                      <span className="-ml-1 h-2 w-2 rounded-full bg-red-500" />
                      <span className="h-px flex-1 bg-red-500" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <aside className="border-subtle bg-default hidden w-[340px] flex-none flex-col overflow-y-auto rounded-2xl border p-5 lg:flex">
        <p className="text-subtle text-xs">{now.format("dddd D MMMM")}</p>
        <h2 className="text-emphasis mt-1 text-xl font-semibold">{t(greeting, { name: firstName })}</h2>
        <p className="text-subtle mt-1 text-sm">{t("home_demo_today", { count: todayCount })}</p>

        <form
          className="border-subtle mt-4 flex items-center gap-2 rounded-xl border px-3 py-2"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(`/assistant${ask.trim() ? `?q=${encodeURIComponent(ask.trim())}` : ""}`);
          }}>
          <Icon name="sparkles" className="text-subtle h-4 w-4 flex-none" />
          <input
            value={ask}
            onChange={(e) => setAsk(e.target.value)}
            placeholder={t("home_demo_ask")}
            className="text-emphasis placeholder:text-subtle min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
          <button type="submit" aria-label={t("home_demo_ask")} className="text-subtle hover:text-emphasis">
            <Icon name="arrow-right" className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6">
          <p className="text-subtle text-xs font-medium uppercase tracking-wide">{t("home_next_booking")}</p>
          {next ? (
            <Link href={`/booking/${next.uid}`} className="border-subtle hover:bg-subtle mt-2 block rounded-xl border p-3">
              <p className="text-emphasis text-sm font-medium">{next.attendees[0]?.name ?? next.title}</p>
              <p className="text-subtle text-xs">{dayjs(next.startTime).format("ddd D MMM, h:mma")}</p>
            </Link>
          ) : (
            <p className="text-subtle mt-2 text-sm">{t("home_nothing_coming_up")}</p>
          )}
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-subtle text-xs font-medium uppercase tracking-wide">{t("home_demo_needs_you")}</p>
            <Link href="/bookings/unconfirmed" className="text-subtle text-xs hover:underline">
              {t("home_all_bookings")}
            </Link>
          </div>
          {requests.length === 0 ? (
            <p className="text-subtle mt-2 text-sm">{t("home_demo_all_clear")}</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {requests.slice(0, 5).map((b) => (
                <li key={b.uid}>
                  <Link href={`/booking/${b.uid}`} className="border-subtle hover:bg-subtle block rounded-xl border p-3">
                    <p className="text-emphasis text-sm font-medium">{b.attendees[0]?.name ?? b.title}</p>
                    <p className="text-subtle text-xs">{dayjs(b.startTime).format("ddd D MMM, h:mma")}</p>
                    <RequestInsightLine bookingUid={b.uid} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Link href="/home" className="text-subtle hover:text-emphasis mt-auto pt-6 text-xs underline">
          {t("home_demo_back")}
        </Link>
      </aside>
    </div>
  );
}

/** Puts overlapping bookings side by side: each gets a lane, and every booking in a cluster shares its lane count. */
function layoutLanes(dayBookings: WeekBooking[]) {
  const sorted = [...dayBookings].sort((a, b) => dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf());
  const placed: { booking: WeekBooking; lane: number; lanes: number }[] = [];
  let cluster: typeof placed = [];
  let laneEnds: number[] = [];
  let clusterEnd = 0;
  const closeCluster = () => {
    for (const item of cluster) item.lanes = laneEnds.length;
    cluster = [];
    laneEnds = [];
  };
  for (const booking of sorted) {
    const start = dayjs(booking.startTime).valueOf();
    const end = Math.max(dayjs(booking.endTime).valueOf(), start + 20 * 60_000);
    if (cluster.length && start >= clusterEnd) closeCluster();
    let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(end);
    } else {
      laneEnds[lane] = end;
    }
    const item = { booking, lane, lanes: 1 };
    cluster.push(item);
    placed.push(item);
    clusterEnd = cluster.length === 1 ? end : Math.max(clusterEnd, end);
  }
  closeCluster();
  return placed;
}
