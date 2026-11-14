"use client";

import dayjs from "@calcom/dayjs";
import { resolvePageTheme } from "@calcom/features/booking-page-theme/themes";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Button } from "@calcom/ui/components/button";
import { Icon } from "@calcom/ui/components/icon";
import { showToast } from "@calcom/ui/components/toast";
import Link from "next/link";

const greetingKey = (hour: number) =>
  hour < 12 ? "home_good_morning" : hour < 18 ? "home_good_afternoon" : "home_good_evening";

export default function HomeView() {
  const { t } = useLocale();
  const { data } = trpc.viewer.home.get.useQuery();
  if (!data) return null;

  const firstName = data.name.split(" ")[0];
  const delta = data.bookingsThisWeek - data.bookingsLastWeek;
  const pageLabel = data.pageUrl.replace(/^https?:\/\//, "");

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(data.pageUrl);
      showToast(t("home_link_copied"), "success");
    } catch {
      showToast(data.pageUrl, "warning");
    }
  };

  const theme = resolvePageTheme(data.pageTheme);

  return (
    <div className="mx-auto max-w-5xl" data-testid="home">
      <header className="border-subtle flex flex-wrap items-center justify-between gap-4 border-b pb-6">
        <h1 className="text-emphasis text-[30px] font-semibold tracking-[-0.025em]">
          {t(greetingKey(new Date().getHours()), { name: firstName })}
        </h1>
        <button
          type="button"
          onClick={copyLink}
          className="bg-subtle text-emphasis hover:bg-emphasis inline-flex max-w-full items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors"
          data-testid="home-page-url"
          title={t("home_copy_link")}>
          <span className="truncate">{pageLabel}</span>
          <Icon name="share-2" className="h-4 w-4 flex-none" />
        </button>
      </header>

      <h2 className="text-emphasis mt-8 text-[22px] font-semibold tracking-[-0.02em]">
        {t("home_your_page")}
      </h2>
      <div
        className="mt-4 flex w-[280px] flex-col rounded-3xl p-4"
        style={{ background: theme.bg, color: theme.fg }}
        data-testid="home-page-card">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-[#121212]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {t("home_live")}
        </span>
        <div className="mx-auto mt-4 h-[148px] w-[148px] overflow-hidden rounded-full bg-white/60">
          {data.avatarUrl ? (
            // biome-ignore lint/performance/noImgElement: user avatar from our own storage
            <img src={data.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-4xl font-semibold opacity-60">
              {(data.name || "?").slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <div className="mt-5 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{data.name}</p>
            <p className="text-sm opacity-60">{t("home_service_count", { count: data.serviceCount })}</p>
          </div>
          <div className="flex flex-none gap-1.5">
            <a
              href={data.pageUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={t("home_open_page")}
              className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#121212]">
              <Icon name="external-link" className="h-4 w-4" />
            </a>
            <Link
              href="/page-editor"
              className="grid h-10 place-items-center rounded-full bg-white px-4 text-sm font-medium text-[#121212]">
              {t("edit")}
            </Link>
          </div>
        </div>
      </div>

      <h2 className="text-emphasis mt-10 text-[22px] font-semibold tracking-[-0.02em]">
        {t("home_last_week")}
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Stat
          label={t("home_bookings_week")}
          value={data.bookingsThisWeek}
          note={
            delta === 0
              ? t("home_same_as_last_week")
              : t(delta > 0 ? "home_more_than_last_week" : "home_fewer_than_last_week", {
                  count: Math.abs(delta),
                })
          }
          testId="home-stat-week"
        />
        <Stat
          label={t("home_waiting_approval")}
          value={data.waitingApproval}
          href="/bookings/unconfirmed"
          note={t("home_review")}
          testId="home-stat-requests"
        />
        <Stat
          label={t("home_waitlist")}
          value={data.waitlistCount}
          href="/waitlist"
          note={t("home_view_waitlist")}
          testId="home-stat-waitlist"
        />
      </div>

      <section className="bg-default border-subtle mt-4 rounded-3xl border p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-emphasis font-semibold">{t("home_coming_up")}</h2>
          <Link href="/bookings/upcoming" className="text-subtle text-sm hover:underline">
            {t("home_all_bookings")}
          </Link>
        </div>
        {data.upcoming.length === 0 ? (
          <p className="text-subtle mt-3 text-sm">{t("home_nothing_coming_up")}</p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--cal-border-subtle)]">
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
                        ? "bg-subtle text-emphasis rounded-full px-2.5 py-1 text-[11px] font-medium"
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
  );
}

function Stat(props: { label: string; value: number; note: string; href?: string; testId: string }) {
  const body = (
    <div className="bg-default border-subtle h-full rounded-3xl border p-5" data-testid={props.testId}>
      <p className="text-subtle text-sm">{props.label}</p>
      <p className="text-emphasis mt-2 text-[32px] font-semibold leading-none tracking-[-0.02em]">
        {props.value}
      </p>
      <p className="text-subtle mt-2 text-xs">{props.note}</p>
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
