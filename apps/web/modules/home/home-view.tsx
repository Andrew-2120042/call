"use client";

import dayjs from "@calcom/dayjs";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Button } from "@calcom/ui/components/button";
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

  return (
    <div className="mx-auto max-w-3xl" data-testid="home">
      <h1 className="text-emphasis text-[28px] font-bold tracking-[-0.02em]">
        {t(greetingKey(new Date().getHours()), { name: firstName })}
      </h1>

      <SetupChecklist steps={data.setup} />

      <section className="bg-default border-subtle mt-6 flex flex-wrap items-center gap-4 rounded-3xl border p-5">
        <div className="min-w-0 flex-1">
          <p className="text-subtle text-sm">{t("home_your_page")}</p>
          <a
            href={data.pageUrl}
            target="_blank"
            rel="noreferrer"
            className="text-emphasis mt-1 block truncate text-lg font-semibold hover:underline"
            data-testid="home-page-url">
            {pageLabel}
          </a>
          <p className="text-subtle mt-1 text-sm">{t("home_service_count", { count: data.serviceCount })}</p>
        </div>
        <div className="flex gap-2">
          <Button color="secondary" onClick={copyLink}>
            {t("home_copy_link")}
          </Button>
          <Link href="/page-editor">
            <Button color="secondary">{t("home_edit_look")}</Button>
          </Link>
          <a href={data.pageUrl} target="_blank" rel="noreferrer">
            <Button>{t("home_open_page")}</Button>
          </a>
        </div>
      </section>

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
          testId="home-stat-bookings"
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
                        ? "rounded-full bg-[#ffe1d6] px-2.5 py-1 text-[11px] font-semibold text-[#b8350f]"
                        : "rounded-full bg-[#dff3ea] px-2.5 py-1 text-[11px] font-semibold text-[#14694f]"
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
      <p className="text-emphasis mt-2 text-[34px] font-bold leading-none">{props.value}</p>
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

function SetupChecklist(props: { steps: readonly { id: string; done: boolean; href: string }[] }) {
  const { t } = useLocale();
  const done = props.steps.filter((step) => step.done).length;
  if (done === props.steps.length) return null;
  const percent = Math.round((done / props.steps.length) * 100);
  return (
    <section className="bg-default border-subtle mt-6 rounded-3xl border p-5" data-testid="setup-checklist">
      <div className="flex items-center gap-4">
        <div
          className="grid h-14 w-14 flex-none place-items-center rounded-full"
          style={{ background: `conic-gradient(#ff5a36 ${percent * 3.6}deg, var(--cal-bg-emphasis) 0)` }}
          aria-hidden>
          <div className="bg-default text-emphasis grid h-11 w-11 place-items-center rounded-full text-sm font-bold">
            {percent}%
          </div>
        </div>
        <div>
          <h2 className="text-emphasis font-semibold">{t("setup_title")}</h2>
          <p className="text-subtle text-sm">{t("setup_progress", { done, total: props.steps.length })}</p>
        </div>
      </div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {props.steps.map((step) => (
          <li key={step.id}>
            <Link
              href={step.href}
              className={
                step.done
                  ? "text-subtle flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm line-through"
                  : "text-emphasis hover:bg-subtle flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium"
              }
              data-testid={`setup-step-${step.id}`}>
              <span
                className={
                  step.done
                    ? "grid h-5 w-5 flex-none place-items-center rounded-full bg-[#ff5a36] text-[11px] text-white"
                    : "border-emphasis h-5 w-5 flex-none rounded-full border-2"
                }>
                {step.done ? "✓" : null}
              </span>
              {t(`setup_step_${step.id}`)}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
