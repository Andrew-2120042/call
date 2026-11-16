"use client";

import dayjs from "@calcom/dayjs";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Icon } from "@calcom/ui/components/icon";
import { showToast } from "@calcom/ui/components/toast";
import Link from "next/link";
import { HomeSkeleton } from "~/shell/skeletons";

const greetingKey = (hour: number) =>
  hour < 12 ? "home_good_morning" : hour < 18 ? "home_good_afternoon" : "home_good_evening";

const copy = async (text: string, done: string) => {
  try {
    await navigator.clipboard.writeText(text);
    showToast(done, "success");
  } catch {
    showToast(text, "warning");
  }
};

export default function HomeView() {
  const { t } = useLocale();
  const { data } = trpc.viewer.home.get.useQuery();
  if (!data) return <HomeSkeleton />;

  const firstName = data.name.split(" ")[0];
  const delta = data.bookingsThisWeek - data.bookingsLastWeek;
  const pageLabel = data.pageUrl.replace(/^https?:\/\//, "");
  const next = data.upcoming[0];

  return (
    <div className="mx-auto max-w-6xl" data-testid="home">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-emphasis text-2xl font-medium">
            {t(greetingKey(new Date().getHours()), { name: firstName })}
          </h1>
          <p className="text-subtle mt-1 text-sm">{t("home_subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => copy(data.pageUrl, t("home_link_copied"))}
          className="bg-subtle text-emphasis hover:bg-emphasis inline-flex max-w-full items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors"
          data-testid="home-page-url"
          title={t("home_copy_link")}>
          <span className="truncate">{pageLabel}</span>
          <Icon name="share-2" className="h-4 w-4 flex-none" />
        </button>
      </header>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon="calendar"
          label={t("home_bookings_week")}
          value={String(data.bookingsThisWeek)}
          note={
            delta === 0
              ? t("home_same_as_last_week")
              : t(delta > 0 ? "home_more_than_last_week" : "home_fewer_than_last_week", { count: Math.abs(delta) })
          }
          tone={delta > 0 ? "up" : delta < 0 ? "down" : undefined}
          testId="home-stat-week"
        />
        <Stat
          icon="mail"
          label={t("home_waiting_approval")}
          value={String(data.waitingApproval)}
          href="/bookings/unconfirmed"
          note={t("home_review")}
          testId="home-stat-requests"
        />
        <Stat
          icon="users"
          label={t("home_waitlist")}
          value={String(data.waitlistCount)}
          href="/waitlist"
          note={t("home_view_waitlist")}
          testId="home-stat-waitlist"
        />
        <Stat
          icon="clock"
          label={t("home_next_booking")}
          value={next ? dayjs(next.startTime).format("ddd h:mma") : "–"}
          href={next ? `/booking/${next.uid}` : "/bookings/upcoming"}
          note={next ? (next.attendeeName ?? next.title) : t("home_nothing_coming_up")}
          testId="home-stat-next"
        />
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[1.6fr_1fr]">
        <section className="bg-default border-subtle rounded-2xl border p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-emphasis font-semibold">{t("home_bookings_chart")}</h2>
            <span className="text-subtle text-xs">{t("home_last_8_weeks")}</span>
          </div>
          <WeeklyChart weeks={data.weekly} />
          <div className="border-subtle mt-5 border-t pt-4">
            <p className="text-subtle text-xs font-medium">{t("home_busiest_days")}</p>
            <WeekdayBars counts={data.byWeekday} />
          </div>
        </section>

        <section className="bg-default border-subtle rounded-2xl border p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-emphasis font-semibold">{t("home_coming_up")}</h2>
            <Link href="/bookings/upcoming" className="text-subtle text-sm hover:underline">
              {t("home_all_bookings")}
            </Link>
          </div>
          {data.upcoming.length === 0 ? (
            <p className="text-subtle mt-3 text-sm">{t("home_nothing_coming_up")}</p>
          ) : (
            <ul className="mt-2 divide-y divide-[var(--cal-border-subtle)]">
              {data.upcoming.map((booking) => (
                <li key={booking.uid}>
                  <Link href={`/booking/${booking.uid}`} className="flex items-center gap-3 py-3">
                    <span className="bg-subtle text-emphasis grid h-9 w-9 flex-none place-items-center rounded-full text-xs font-semibold">
                      {(booking.attendeeName ?? "?").slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-emphasis block truncate text-sm font-medium">
                        {booking.attendeeName ?? booking.title}
                      </span>
                      <span className="text-subtle block text-xs">
                        {dayjs(booking.startTime).format("ddd D MMM, h:mma")}
                      </span>
                    </span>
                    <span
                      className={
                        booking.isRequest
                          ? "rounded-full bg-orange-500/15 px-2.5 py-1 text-[11px] font-medium text-orange-300"
                          : "text-subtle border-subtle rounded-full border px-2.5 py-1 text-[11px] font-medium"
                      }>
                      {booking.isRequest ? t("service_kind_request") : t("home_confirmed")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-emphasis text-lg font-medium">{t("home_your_services")}</h2>
          <Link href="/event-types" className="text-subtle text-sm hover:underline">
            {t("home_manage_services")}
          </Link>
        </div>
        {data.services.length === 0 ? (
          <Link
            href="/event-types"
            className="border-subtle text-subtle mt-4 block rounded-2xl border border-dashed p-8 text-center text-sm hover:text-emphasis">
            {t("home_add_first_service")}
          </Link>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-testid="home-services">
            {data.services.map((service) => {
              const link = `${data.pageUrl}/${service.slug}`;
              return (
                <div
                  key={service.id}
                  className="bg-default border-subtle group flex flex-col rounded-2xl border p-5 transition hover:border-[var(--cal-border-emphasis)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-emphasis truncate font-medium">{service.title}</p>
                      <p className="text-subtle mt-0.5 truncate text-xs">/{service.slug}</p>
                    </div>
                    {service.hidden && (
                      <span className="text-subtle border-subtle rounded-full border px-2 py-0.5 text-[11px]">
                        {t("hidden")}
                      </span>
                    )}
                  </div>
                  <div className="text-subtle mt-4 flex flex-wrap gap-2 text-xs">
                    <span className="bg-subtle inline-flex items-center gap-1 rounded-md px-2 py-1">
                      <Icon name="clock" className="h-3 w-3" />
                      {t("home_minutes", { count: service.length })}
                    </span>
                    {service.requiresConfirmation && (
                      <span className="bg-subtle inline-flex items-center gap-1 rounded-md px-2 py-1">
                        <Icon name="check" className="h-3 w-3" />
                        {t("home_needs_approval")}
                      </span>
                    )}
                  </div>
                  <div className="mt-5 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-emphasis text-2xl leading-none">{service.bookedLast30Days}</p>
                      <p className="text-subtle mt-1 text-xs">{t("home_booked_30_days")}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => copy(link, t("home_link_copied"))}
                        className="border-subtle text-default hover:bg-subtle grid h-8 w-8 place-items-center rounded-lg border transition"
                        title={t("home_copy_link")}>
                        <Icon name="link" className="h-3.5 w-3.5" />
                      </button>
                      <Link
                        href={`/event-types/${service.id}?tabName=setup`}
                        className="border-subtle text-default hover:bg-subtle grid h-8 w-8 place-items-center rounded-lg border transition"
                        title={t("edit")}>
                        <Icon name="pencil" className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function WeeklyChart({ weeks }: { weeks: { weekStart: string; count: number }[] }) {
  const max = Math.max(1, ...weeks.map((w) => w.count));
  const total = weeks.reduce((sum, w) => sum + w.count, 0);
  return (
    <div className="mt-4">
      <p className="text-emphasis text-3xl leading-none">{total}</p>
      <div className="mt-5 flex h-36 items-end gap-2" role="img" aria-label={`${total} bookings in 8 weeks`}>
        {weeks.map((week, i) => {
          const isCurrent = i === weeks.length - 1;
          return (
            <div key={week.weekStart} className="group flex h-full flex-1 flex-col justify-end gap-1.5">
              <span className="text-subtle text-center text-[10px] opacity-0 transition group-hover:opacity-100">
                {week.count}
              </span>
              <div
                className={`w-full rounded-md transition-all ${isCurrent ? "bg-blue-500" : "bg-[var(--cal-bg-emphasis)] group-hover:bg-blue-500/60"}`}
                style={{ height: `${Math.max(4, (week.count / max) * 100)}%` }}
              />
              <span className="text-subtle text-center text-[10px]">{dayjs(week.weekStart).format("D MMM")}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekdayBars({ counts }: { counts: number[] }) {
  const max = Math.max(1, ...counts);
  // Monday first, which is how people read a working week.
  const order = [1, 2, 3, 4, 5, 6, 0];
  return (
    <div className="mt-3 grid grid-cols-7 gap-2">
      {order.map((day) => (
        <div key={day} className="flex flex-col items-center gap-1.5">
          <div className="bg-subtle flex h-14 w-full items-end overflow-hidden rounded-md">
            <div
              className="w-full rounded-md bg-blue-500/70"
              style={{ height: `${(counts[day] / max) * 100}%` }}
              title={String(counts[day])}
            />
          </div>
          <span className="text-subtle text-[10px]">{dayjs().day(day).format("dd")}</span>
        </div>
      ))}
    </div>
  );
}

function Stat(props: {
  icon: "calendar" | "mail" | "users" | "clock";
  label: string;
  value: string;
  note: string;
  href?: string;
  tone?: "up" | "down";
  testId: string;
}) {
  const body = (
    <div className="bg-default border-subtle h-full rounded-2xl border p-5" data-testid={props.testId}>
      <div className="flex items-center justify-between">
        <p className="text-subtle text-sm">{props.label}</p>
        <Icon name={props.icon} className="text-subtle h-4 w-4" />
      </div>
      <p className="text-emphasis mt-3 truncate text-3xl font-normal leading-none">{props.value}</p>
      <p
        className={`mt-2 truncate text-xs ${props.tone === "up" ? "text-emerald-400" : props.tone === "down" ? "text-orange-300" : "text-subtle"}`}>
        {props.note}
      </p>
    </div>
  );
  return props.href ? (
    <Link href={props.href} className="block transition-transform hover:scale-[1.01]">
      {body}
    </Link>
  ) : (
    body
  );
}
