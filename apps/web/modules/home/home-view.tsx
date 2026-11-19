"use client";

import dayjs from "@calcom/dayjs";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import type { RouterOutputs } from "@calcom/trpc/react";
import { trpc } from "@calcom/trpc/react";
import classNames from "@calcom/ui/classNames";
import { Icon } from "@calcom/ui/components/icon";
import { showToast } from "@calcom/ui/components/toast";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import type { PeekTarget } from "~/peek/peekStore";
import { usePeek } from "~/peek/peekStore";
import { HomeSkeleton } from "~/shell/skeletons";
import { HomeCalendar } from "./HomeCalendar";
import { SetupChecklist } from "./SetupChecklist";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams?.get("view") === "calendar" ? "calendar" : "overview";
  const { data } = trpc.viewer.home.get.useQuery();
  if (!data) return <HomeSkeleton />;

  const setView = (next: "overview" | "calendar") =>
    router.replace(next === "overview" ? (pathname ?? "/home") : `${pathname}?view=calendar`, { scroll: false });

  return (
    <div className="mx-auto max-w-6xl" data-testid="home">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-emphasis text-xl font-medium tracking-[-0.01em]">{t("home_overview_title")}</h1>
        <div className="flex items-center gap-2">
          <div className="border-subtle flex rounded-md border p-0.5" role="tablist" data-testid="home-view-switch">
            {(["overview", "calendar"] as const).map((option) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={view === option}
                onClick={() => setView(option)}
                className={classNames(
                  "rounded px-2.5 py-1 text-[12px] transition",
                  view === option ? "bg-emphasis text-emphasis" : "text-subtle hover:text-emphasis"
                )}>
                {t(`home_view_${option}`)}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => copy(data.pageUrl, t("home_link_copied"))}
            className="border-subtle text-default hover:text-emphasis inline-flex h-7 max-w-[260px] items-center gap-1.5 rounded-md border px-2.5 text-[12px] transition"
            data-testid="home-page-url"
            title={t("home_copy_link")}>
            <span className="truncate">{data.pageUrl.replace(/^https?:\/\//, "")}</span>
            <Icon name="copy" className="h-3 w-3 flex-none" />
          </button>
        </div>
      </header>

      <div className="mt-6">
        <SetupChecklist setup={data.setup} pageUrl={data.pageUrl} />
      </div>

      {view === "calendar" ? <HomeCalendar /> : <Overview data={data} />}
    </div>
  );
}

type HomeData = RouterOutputs["viewer"]["home"]["get"];

function Overview({ data }: { data: HomeData }) {
  const { t } = useLocale();
  const tz = data.timeZone;
  const fmt = (date: Date | string, pattern = "ddd D MMM, h:mma") => dayjs(date).tz(tz).format(pattern);
  const next = data.upcoming[0];
  const weeks = data.weekly.slice(-5).reverse();
  const weekMax = Math.max(1, ...weeks.map((week) => week.count));
  const booked30 = data.services.reduce((sum, service) => sum + service.bookedLast30Days, 0);
  const topServices = [...data.services].sort((a, b) => b.bookedLast30Days - a.bookedLast30Days).slice(0, 5);
  const weekdayOrder = [1, 2, 3, 4, 5, 6, 0];
  const dayMax = Math.max(1, ...data.byWeekday);
  const busiest = data.byWeekday.indexOf(Math.max(...data.byWeekday));

  return (
    <div className="space-y-6" data-testid="home-overview">
      <Grid>
        <Cell
          title={t("home_cell_bookings")}
          href="/bookings/upcoming"
          value={String(weeks[0]?.count ?? 0)}
          caption={t("home_this_week")}
          testId="home-stat-week">
          {weeks.map((week, index) => (
            <BarRow
              key={week.weekStart}
              label={index === 0 ? t("home_this_week_short") : fmt(week.weekStart, "D MMM")}
              ratio={week.count / weekMax}
              value={String(week.count)}
              strong={index === 0}
            />
          ))}
        </Cell>
        <Cell
          title={t("home_cell_requests")}
          href="/bookings/unconfirmed"
          value={String(data.waitingApproval)}
          caption={t("home_waiting_for_you")}
          testId="home-stat-requests"
          empty={!data.requests.length && <Empty title={t("home_no_requests")} body={t("home_no_requests_body")} />}>
          {data.requests.map((request) => (
            <ListRow
              key={request.uid}
              peek={{ kind: "booking", uid: request.uid }}
              name={request.attendeeName ?? t("unknown")}
              value={fmt(request.startTime, "ddd D MMM")}
            />
          ))}
        </Cell>
        <Cell
          title={t("home_cell_waitlist")}
          href="/waitlist"
          value={String(data.waitlistCount)}
          caption={t("home_people_waiting")}
          testId="home-stat-waitlist"
          empty={!data.waitlistPreview.length && <Empty title={t("home_no_waitlist")} body={t("home_no_waitlist_body")} />}>
          {data.waitlistPreview.map((entry) => (
            <ListRow
              key={entry.id}
              peek={{ kind: "waitlist", uid: entry.uid }}
              name={entry.name}
              detail={entry.offered ? t("home_offered") : entry.serviceTitle}
              value={fmt(entry.startTime, "ddd D MMM")}
            />
          ))}
        </Cell>
      </Grid>

      <Grid>
        <Cell
          title={t("home_cell_next")}
          href="/bookings/upcoming"
          value={next ? fmt(next.startTime, "ddd h:mma") : "–"}
          caption={next?.attendeeName ?? undefined}
          testId="home-stat-next"
          empty={!data.upcoming.length && <Empty title={t("home_nothing_booked")} body={t("home_nothing_booked_body")} />}>
          {data.upcoming.slice(1).map((booking) => (
            <ListRow
              key={booking.uid}
              peek={{ kind: "booking", uid: booking.uid }}
              name={booking.attendeeName ?? booking.title}
              detail={booking.isRequest ? t("home_request") : undefined}
              value={fmt(booking.startTime, "ddd D, h:mma")}
            />
          ))}
        </Cell>
        <Cell
          title={t("home_cell_services")}
          href="/event-types"
          value={String(booked30)}
          caption={t("home_booked_30_days")}
          testId="home-stat-services">
          {topServices.map((service) => (
            <ListRow
              key={service.id}
              href={`/event-types/${service.id}`}
              name={service.title}
              detail={`${service.length} min`}
              value={String(service.bookedLast30Days)}
            />
          ))}
        </Cell>
        <Cell
          title={t("home_cell_busiest")}
          value={data.byWeekday.some(Boolean) ? WEEKDAYS[busiest] : "–"}
          caption={t("home_busiest_day")}
          testId="home-stat-days">
          {weekdayOrder.map((day) => (
            <BarRow
              key={day}
              label={WEEKDAYS[day]}
              ratio={data.byWeekday[day] / dayMax}
              value={String(data.byWeekday[day])}
              strong={day === busiest}
            />
          ))}
        </Cell>
      </Grid>
    </div>
  );
}

/** Cells share hairline borders, like one sheet divided into panes. */
function Grid({ children }: { children: ReactNode }) {
  return (
    <div className="border-subtle grid overflow-hidden rounded-lg border md:grid-cols-3 [&>*]:border-subtle [&>*:not(:first-child)]:border-t md:[&>*:not(:first-child)]:border-l md:[&>*:not(:first-child)]:border-t-0">
      {children}
    </div>
  );
}

function Cell(props: {
  title: string;
  href?: string;
  value: string;
  caption?: string;
  testId: string;
  empty?: ReactNode;
  children?: ReactNode;
}) {
  const { t } = useLocale();
  return (
    <section className="flex min-h-[300px] min-w-0 flex-col p-6" data-testid={props.testId}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-emphasis text-[13px]">{props.title}</h2>
        {props.href && (
          <Link
            href={props.href}
            className="text-subtle hover:text-emphasis inline-flex items-center gap-1 text-[12px] transition">
            {t("view_all")}
            <Icon name="arrow-right" className="h-3 w-3" />
          </Link>
        )}
      </div>
      <p className="mt-3 flex min-w-0 items-baseline gap-2">
        <span className="text-emphasis truncate text-[32px] font-light leading-none tracking-[-0.02em]">{props.value}</span>
        {props.caption && <span className="text-subtle truncate text-[13px]">{props.caption}</span>}
      </p>
      <div className="mt-6 flex flex-1 flex-col gap-3">{props.empty || props.children}</div>
    </section>
  );
}

function BarRow({ label, ratio, value, strong }: { label: string; ratio: number; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center gap-3 text-[13px]">
      <span className={classNames("w-14 shrink-0", strong ? "text-emphasis" : "text-subtle")}>{label}</span>
      <span className="relative h-[2px] flex-1 rounded-full bg-[var(--cal-border-subtle)]">
        <span
          className={classNames("absolute inset-y-0 left-0 rounded-full", strong ? "bg-inverted" : "bg-[var(--cal-text-subtle)]")}
          style={{ width: `${Math.round(ratio * 100)}%` }}
        />
      </span>
      <span className={classNames("w-8 shrink-0 text-right tabular-nums", strong ? "text-emphasis" : "text-subtle")}>{value}</span>
    </div>
  );
}

function ListRow({
  name,
  detail,
  value,
  href,
  peek,
}: {
  name: string;
  detail?: string;
  value: string;
  href?: string;
  peek?: PeekTarget;
}) {
  const openPeek = usePeek((state) => state.open);
  const body = (
    <>
      <span className="text-emphasis truncate">{name}</span>
      {detail && <span className="text-subtle truncate">{detail}</span>}
      <span className="text-default ml-auto shrink-0 tabular-nums">{value}</span>
    </>
  );
  if (peek)
    return (
      <button
        type="button"
        onClick={() => openPeek(peek)}
        className="hover:text-emphasis -mx-1.5 flex min-w-0 items-baseline gap-2 rounded px-1.5 text-left text-[13px] hover:bg-subtle">
        {body}
      </button>
    );
  return href ? (
    <Link href={href} className="hover:text-emphasis flex min-w-0 items-baseline gap-2 text-[13px]">
      {body}
    </Link>
  ) : (
    <div className="flex min-w-0 items-baseline gap-2 text-[13px]">{body}</div>
  );
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-auto">
      <p className="text-emphasis text-[13px]">{title}</p>
      <p className="text-subtle mt-0.5 text-[13px]">{body}</p>
    </div>
  );
}
