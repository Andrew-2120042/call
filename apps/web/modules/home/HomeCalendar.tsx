"use client";

import dayjs from "@calcom/dayjs";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import type { RouterOutputs } from "@calcom/trpc/react";
import { trpc } from "@calcom/trpc/react";
import classNames from "@calcom/ui/classNames";
import { Icon } from "@calcom/ui/components/icon";
import Link from "next/link";
import type { ReactNode, RefObject } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePeek } from "~/peek/peekStore";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SHOWN_PER_DAY = 3;

type CalendarData = RouterOutputs["viewer"]["home"]["calendar"];

/** Every day of a month view, Monday first, padded with the days around it so the grid is whole weeks. */
function monthDays(month: string) {
  const monthStart = dayjs(`${month}-01`);
  const gridStart = monthStart.subtract((monthStart.day() + 6) % 7, "day");
  const monthEnd = monthStart.endOf("month");
  const gridEnd = monthEnd.add((7 - monthEnd.day()) % 7, "day");
  const days: string[] = [];
  for (let day = gridStart; !day.isAfter(gridEnd, "day"); day = day.add(1, "day"))
    days.push(day.format("YYYY-MM-DD"));
  return days;
}

function useClickOutside(ref: RefObject<HTMLElement | null>, open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose();
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [ref, open, onClose]);
}

/** The host's month: who's booked, which are requests, and who is waiting for a spot on each day. */
export function HomeCalendar() {
  const { t } = useLocale();
  const openPeek = usePeek((state) => state.open);
  const [month, setMonth] = useState(() => dayjs().format("YYYY-MM"));
  const [picked, setPicked] = useState<string | null>(null);
  const { data, isPending } = trpc.viewer.home.calendar.useQuery(
    { month },
    { placeholderData: (previous) => previous }
  );

  const monthStart = dayjs(`${month}-01`);
  const today = data ? dayjs().tz(data.timeZone).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
  const isThisMonth = today.startsWith(month);
  const days = monthDays(month);

  const byDay = useMemo(() => {
    const map = new Map<string, DayItem[]>();
    const add = (day: string, item: DayItem) => map.set(day, [...(map.get(day) ?? []), item]);
    for (const booking of data?.bookings ?? []) add(booking.day, { type: "booking", ...booking });
    return map;
  }, [data]);
  const waitlistByDay = useMemo(() => {
    const map = new Map<string, DayItem[]>();
    for (const entry of data?.waitlist ?? [])
      map.set(entry.day, [...(map.get(entry.day) ?? []), { type: "waitlist", ...entry }]);
    return map;
  }, [data]);

  const monthBookings = (data?.bookings ?? []).filter((booking) => booking.day.startsWith(month));
  const requests = monthBookings.filter((booking) => booking.isRequest).length;
  const waiting = (data?.waitlist ?? []).filter((entry) => entry.day.startsWith(month)).length;

  const goTo = (day: string) => {
    setMonth(day.slice(0, 7));
    setPicked(day);
  };

  return (
    <section className="border-subtle overflow-hidden rounded-lg border" data-testid="home-calendar">
      <header className="border-subtle flex flex-wrap items-center gap-3 border-b px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={t("previous_month")}
            onClick={() => setMonth(monthStart.subtract(1, "month").format("YYYY-MM"))}
            className="text-subtle hover:text-emphasis hover:bg-subtle grid h-8 w-8 place-items-center rounded-md">
            <Icon name="chevron-left" className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={t("next_month")}
            onClick={() => setMonth(monthStart.add(1, "month").format("YYYY-MM"))}
            className="text-subtle hover:text-emphasis hover:bg-subtle grid h-8 w-8 place-items-center rounded-md">
            <Icon name="chevron-right" className="h-4 w-4" />
          </button>
          <DatePicker month={month} picked={picked} today={today} onPick={goTo} />
          <button
            type="button"
            onClick={() => goTo(today)}
            disabled={isThisMonth && picked === today}
            data-testid="home-calendar-today"
            className="border-subtle text-default hover:text-emphasis hover:bg-subtle ml-1 h-8 rounded-md border px-3 text-[12px] transition disabled:opacity-40">
            {t("today")}
          </button>
        </div>

        <p className="text-subtle min-w-0 flex-1 text-[12px]">
          {t("home_calendar_summary", { booked: monthBookings.length - requests, requests, waiting })}
        </p>

        <div className="text-subtle hidden items-center gap-3 text-[12px] lg:flex">
          <Legend className="bg-[var(--cal-text-emphasis)]" label={t("home_calendar_booked")} />
          <Legend className="bg-amber-400" label={t("home_calendar_request")} />
          <Legend className="bg-sky-400" label={t("home_calendar_waiting")} />
        </div>

        <AddBookingMenu data={data} day={picked && picked >= today ? picked : today} />
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
              const items = byDay.get(day) ?? [];
              const waitingHere = waitlistByDay.get(day) ?? [];
              return (
                <div
                  key={day}
                  onClick={() => setPicked(day)}
                  className={classNames(
                    "border-subtle group/day relative min-h-[118px] cursor-default border-b p-2",
                    index % 7 !== 6 && "border-r",
                    !inMonth && "bg-muted/40",
                    picked === day && "ring-inset ring-1 ring-[var(--cal-border-emphasis)]"
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
                    {day >= today && data && data.services.length > 0 && (
                      <AddBookingMenu data={data} day={day} compact />
                    )}
                  </div>
                  <ul className="mt-1.5 space-y-1">
                    {items.slice(0, SHOWN_PER_DAY).map((item) => (
                      <li key={item.uid} className="group/chip relative">
                        <Chip item={item} onOpen={() => openPeek({ kind: item.type, uid: item.uid })} />
                        <HoverCard item={item} day={day} />
                      </li>
                    ))}
                    {items.length > SHOWN_PER_DAY && (
                      <li>
                        <MoreItems
                          items={items.slice(SHOWN_PER_DAY)}
                          label={t("home_calendar_more", { count: items.length - SHOWN_PER_DAY })}
                          onOpen={(item) => openPeek({ kind: item.type, uid: item.uid })}
                        />
                      </li>
                    )}
                    {waitingHere.length > 0 && (
                      <li>
                        <MoreItems
                          items={waitingHere}
                          waitlist
                          label={t("home_calendar_waiting_count", { count: waitingHere.length })}
                          onOpen={(item) => openPeek({ kind: item.type, uid: item.uid })}
                        />
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

type DayItem =
  | ({ type: "booking" } & CalendarData["bookings"][number])
  | ({ type: "waitlist" } & CalendarData["waitlist"][number]);

function Chip({ item, onOpen }: { item: DayItem; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onOpen();
      }}
      data-testid={item.type === "waitlist" ? "home-calendar-waitlist-chip" : "home-calendar-chip"}
      className={classNames(
        "flex w-full items-center gap-1.5 rounded border px-1.5 py-0.5 text-left text-[11px] transition",
        item.type === "waitlist"
          ? "border-sky-400/30 bg-sky-400/10 text-sky-200 hover:bg-sky-400/20"
          : item.isRequest
            ? "border-amber-400/30 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20"
            : "border-subtle bg-subtle text-default hover:text-emphasis"
      )}>
      {item.type === "waitlist" && <Icon name="users" className="h-3 w-3 shrink-0 opacity-80" />}
      <span className="min-w-0 flex-1 truncate">
        {item.type === "waitlist" ? item.name : item.attendeeName}
      </span>
      <span className="shrink-0 opacity-70">{item.time}</span>
    </button>
  );
}

function HoverCard({ item, day }: { item: DayItem; day: string }) {
  const { t } = useLocale();
  const status =
    item.type === "waitlist"
      ? {
          text: t(item.offered ? "home_calendar_hover_offered" : "home_calendar_hover_waiting"),
          tone: "text-sky-300",
        }
      : item.isRequest
        ? { text: t("home_calendar_hover_request"), tone: "text-amber-300" }
        : { text: t("home_calendar_hover_booked"), tone: "text-emerald-300" };
  return (
    <div
      role="tooltip"
      className="bg-default border-subtle pointer-events-none absolute left-0 top-full z-20 mt-1 hidden w-56 rounded-md border p-2.5 shadow-xl group-hover/chip:block">
      <p className="text-emphasis text-[12px] font-medium">
        {item.type === "waitlist" ? item.name : item.attendeeName}
      </p>
      {item.type === "booking" && <p className="text-subtle text-[11px]">{item.service}</p>}
      <p className="text-default mt-1.5 text-[11px]">
        {dayjs(day).format("ddd D MMM")}, {item.time}
      </p>
      <p className={classNames("mt-1 text-[11px]", status.tone)}>{status.text}</p>
      <p className="text-subtle mt-1.5 text-[11px]">{t("home_calendar_hover_hint")}</p>
    </div>
  );
}

function MoreItems({
  items,
  label,
  waitlist,
  onOpen,
}: {
  items: DayItem[];
  label: string;
  waitlist?: boolean;
  onOpen: (item: DayItem) => void;
}) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, open, () => setOpen(false));
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          // One person waiting: straight to their details, like a booking.
          if (waitlist && items.length === 1) return onOpen(items[0]);
          setOpen((value) => !value);
        }}
        data-testid={waitlist ? "home-calendar-waitlist" : undefined}
        className={classNames(
          "text-[11px]",
          waitlist
            ? "flex w-full items-center gap-1.5 rounded border border-dashed border-sky-400/40 px-1.5 py-0.5 text-sky-300 hover:bg-sky-400/10"
            : "text-subtle hover:text-emphasis px-1.5"
        )}>
        {waitlist && <Icon name="users" className="h-3 w-3" />}
        {label}
      </button>
      {open && (
        <div className="bg-default border-subtle absolute left-0 top-full z-30 mt-1 w-56 space-y-1 rounded-md border p-1.5 shadow-xl">
          {waitlist && (
            <p className="text-subtle px-1 pb-0.5 text-[11px]">{t("home_calendar_waitlist_popover")}</p>
          )}
          {items.map((item) => (
            <Chip
              key={item.uid}
              item={item}
              onOpen={() => {
                setOpen(false);
                onOpen(item);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** The month name doubles as a date picker, so jumping to any date is one click instead of many arrow presses. */
function DatePicker({
  month,
  picked,
  today,
  onPick,
}: {
  month: string;
  picked: string | null;
  today: string;
  onPick: (day: string) => void;
}) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(month);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, open, () => setOpen(false));
  useEffect(() => setShown(month), [month]);
  const shownStart = dayjs(`${shown}-01`);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        data-testid="home-calendar-month"
        aria-expanded={open}
        className="text-emphasis hover:bg-subtle inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[15px] font-medium">
        {dayjs(`${month}-01`).format("MMMM YYYY")}
        <Icon name="chevron-down" className="text-subtle h-3.5 w-3.5" />
      </button>
      {open && (
        <div
          className="bg-default border-subtle absolute left-0 top-full z-30 mt-1 w-64 rounded-lg border p-3 shadow-2xl"
          data-testid="home-calendar-picker">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label={t("previous_month")}
              onClick={() => setShown(shownStart.subtract(1, "month").format("YYYY-MM"))}
              className="text-subtle hover:text-emphasis hover:bg-subtle grid h-7 w-7 place-items-center rounded-md">
              <Icon name="chevron-left" className="h-4 w-4" />
            </button>
            <span className="text-emphasis text-[13px] font-medium">{shownStart.format("MMMM YYYY")}</span>
            <button
              type="button"
              aria-label={t("next_month")}
              onClick={() => setShown(shownStart.add(1, "month").format("YYYY-MM"))}
              className="text-subtle hover:text-emphasis hover:bg-subtle grid h-7 w-7 place-items-center rounded-md">
              <Icon name="chevron-right" className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {DAY_NAMES.map((name) => (
              <span key={name} className="text-subtle py-1 text-[10px] uppercase">
                {name.slice(0, 2)}
              </span>
            ))}
            {monthDays(shown).map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => {
                  onPick(day);
                  setOpen(false);
                }}
                className={classNames(
                  "h-8 rounded-md text-[12px] tabular-nums transition",
                  day === picked
                    ? "bg-inverted text-inverted"
                    : day === today
                      ? "text-emphasis ring-1 ring-inset ring-[var(--cal-border-emphasis)]"
                      : day.startsWith(shown)
                        ? "text-default hover:bg-subtle"
                        : "text-muted hover:bg-subtle"
                )}>
                {dayjs(day).date()}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              onPick(today);
              setOpen(false);
            }}
            className="text-subtle hover:text-emphasis mt-2 w-full rounded-md py-1 text-[12px]">
            {t("home_calendar_jump_today")}
          </button>
        </div>
      )}
    </div>
  );
}

/** Adding a booking means booking your own page on the client's behalf, opened on the chosen day. */
function AddBookingMenu({
  data,
  day,
  compact,
}: {
  data: CalendarData | undefined;
  day: string;
  compact?: boolean;
}) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, open, () => setOpen(false));
  const services = data?.services ?? [];
  const link = (slug: string) => `${data?.bookingPageUrl}/${slug}?month=${day.slice(0, 7)}&date=${day}`;

  return (
    <div ref={ref} className="relative" onClick={(event) => event.stopPropagation()}>
      {compact ? (
        <button
          type="button"
          aria-label={t("home_calendar_add_on_day", { day: dayjs(day).format("D MMM") })}
          onClick={() => setOpen((value) => !value)}
          className={classNames(
            "text-subtle hover:text-emphasis hover:bg-emphasis grid h-5 w-5 place-items-center rounded transition",
            open ? "opacity-100" : "opacity-0 group-hover/day:opacity-100 focus:opacity-100"
          )}>
          <Icon name="plus" className="h-3.5 w-3.5" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          data-testid="home-calendar-add"
          className="bg-inverted text-inverted inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[12px] font-medium">
          <Icon name="plus" className="h-3.5 w-3.5" />
          {t("home_calendar_add")}
        </button>
      )}
      {open && (
        <div
          className={classNames(
            "bg-default border-subtle absolute top-full z-30 mt-1 w-64 rounded-lg border p-1.5 shadow-2xl",
            compact ? "left-0" : "right-0"
          )}>
          <p className="text-subtle px-2 pb-1.5 pt-1 text-[11px]">
            {t("home_calendar_add_hint", { day: dayjs(day).format("ddd D MMM") })}
          </p>
          {services.length === 0 ? (
            <MenuLink href={`/event-types?dialog=new&eventPage=${data?.username ?? ""}`}>
              {t("home_calendar_add_first_service")}
            </MenuLink>
          ) : (
            services.map((service) => (
              <MenuLink key={service.id} href={link(service.slug)} external>
                <span className="min-w-0 flex-1 truncate">{service.title}</span>
                <span className="text-subtle shrink-0 text-[11px]">{service.length} min</span>
              </MenuLink>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function MenuLink({ href, external, children }: { href: string; external?: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      className="text-default hover:bg-subtle hover:text-emphasis flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px]">
      {children}
    </Link>
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
