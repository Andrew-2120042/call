"use client";

import dayjs from "@calcom/dayjs";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import type { RouterOutputs } from "@calcom/trpc/react";
import { trpc } from "@calcom/trpc/react";
import classNames from "@calcom/ui/classNames";
import { Icon } from "@calcom/ui/components/icon";
import { showToast } from "@calcom/ui/components/toast";
import { useMemo, useState } from "react";
import { usePeek } from "~/peek/peekStore";
import { ListSkeleton } from "~/shell/skeletons";

type Entry = RouterOutputs["viewer"]["waitlist"]["list"][number];
type Slot = { key: string; label: string; sortAt: number; service: string; entries: Entry[] };
type Day = { key: string; date: dayjs.Dayjs; slots: Slot[]; people: number };

/** Where an entry sits: the day it wants, and the time (or range) it is queueing for. */
function placeOf(entry: Entry, t: (key: string, values?: Record<string, string>) => string) {
  if (entry.kind === "ANY_TIME_ON_DAY" && entry.rangeStart) {
    const day = dayjs(entry.rangeStart);
    return { day, slotKey: "any", label: t("waitlist_slot_any_time"), sortAt: day.startOf("day").valueOf() - 1 };
  }
  if (entry.kind === "EARLIER_THAN_BOOKING" && entry.rangeEnd) {
    const end = dayjs(entry.rangeEnd);
    return {
      day: end,
      slotKey: `earlier-${end.valueOf()}`,
      label: t("waitlist_slot_earlier_than", { time: end.format("h:mma") }),
      sortAt: end.valueOf(),
    };
  }
  const at = dayjs(entry.startTime);
  return { day: at, slotKey: `at-${at.valueOf()}`, label: at.format("h:mma"), sortAt: at.valueOf() };
}

export default function WaitlistView() {
  const { t } = useLocale();
  const utils = trpc.useUtils();
  const list = trpc.viewer.waitlist.list.useQuery();
  const [filter, setFilter] = useState<"all" | "offered">("all");
  const openPeek = usePeek((state) => state.open);
  const remove = trpc.viewer.waitlist.remove.useMutation({
    onSuccess: async () => {
      showToast(t("waitlist_removed"), "success");
      await utils.viewer.waitlist.list.invalidate();
    },
    onError: (error) => showToast(error.message, "error"),
  });

  const entries = list.data ?? [];
  const days = useMemo(() => {
    const byDay = new Map<string, Day>();
    for (const entry of entries) {
      if (filter === "offered" && entry.status !== "OFFERED") continue;
      const place = placeOf(entry, t);
      const dayKey = place.day.format("YYYY-MM-DD");
      const day = byDay.get(dayKey) ?? { key: dayKey, date: place.day.startOf("day"), slots: [], people: 0 };
      const slotKey = `${place.slotKey}-${entry.eventType.title}`;
      let slot = day.slots.find((s) => s.key === slotKey);
      if (!slot) {
        slot = { key: slotKey, label: place.label, sortAt: place.sortAt, service: entry.eventType.title, entries: [] };
        day.slots.push(slot);
      }
      slot.entries.push(entry);
      day.people++;
      byDay.set(dayKey, day);
    }
    return Array.from(byDay.values())
      .sort((a, b) => a.date.valueOf() - b.date.valueOf())
      .map((day) => ({ ...day, slots: day.slots.sort((a, b) => a.sortAt - b.sortAt) }));
  }, [entries, filter, t]);

  if (list.isPending) return <ListSkeleton rows={4} />;
  if (!entries.length) {
    return (
      <div className="border-subtle rounded-lg border p-10 text-center">
        <p className="text-emphasis text-[13px] font-medium">{t("waitlist_empty_title")}</p>
        <p className="text-subtle mt-1 text-[13px]">{t("waitlist_empty_body")}</p>
      </div>
    );
  }

  const offered = entries.filter((entry) => entry.status === "OFFERED").length;
  const slotCount = days.reduce((sum, day) => sum + day.slots.length, 0);

  return (
    <div className="space-y-6" data-testid="waitlist">
      <div className="border-subtle grid overflow-hidden rounded-lg border sm:grid-cols-3 [&>*:not(:first-child)]:border-subtle [&>*:not(:first-child)]:border-t sm:[&>*:not(:first-child)]:border-l sm:[&>*:not(:first-child)]:border-t-0">
        <Summary label={t("waitlist_sum_waiting")} value={entries.length} caption={t("waitlist_sum_people")} />
        <Summary label={t("waitlist_sum_offered")} value={offered} caption={t("waitlist_sum_offered_caption")} />
        <Summary label={t("waitlist_sum_slots")} value={slotCount} caption={t("waitlist_sum_slots_caption")} />
      </div>

      <div className="flex items-center justify-between">
        <div className="border-subtle flex rounded-md border p-0.5" role="tablist">
          {(["all", "offered"] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={filter === option}
              onClick={() => setFilter(option)}
              className={classNames(
                "rounded px-2.5 py-1 text-[12px] transition",
                filter === option ? "bg-emphasis text-emphasis" : "text-subtle hover:text-emphasis"
              )}>
              {t(`waitlist_filter_${option}`)}
            </button>
          ))}
        </div>
        <p className="text-subtle hidden text-[12px] sm:block">{t("waitlist_order_hint")}</p>
      </div>

      {days.map((day) => (
        <section key={day.key} className="border-subtle overflow-hidden rounded-lg border" data-testid={`waitlist-day-${day.key}`}>
          <header className="border-subtle flex items-baseline justify-between border-b px-4 py-2.5">
            <h2 className="text-emphasis text-[13px] font-medium">{day.date.format("dddd, D MMMM")}</h2>
            <span className="text-subtle text-[12px]">{t("waitlist_day_count", { count: day.people })}</span>
          </header>
          <ul>
            {day.slots.map((slot) => (
              <li key={slot.key} className="border-subtle flex flex-col gap-3 border-b px-4 py-3 last:border-b-0 sm:flex-row">
                <div className="w-44 shrink-0">
                  <p className="text-emphasis text-[13px] tabular-nums">{slot.label}</p>
                  <p className="text-subtle text-[12px]">{slot.service}</p>
                </div>
                <ol className="flex min-w-0 flex-1 flex-wrap gap-2">
                  {slot.entries.map((entry, index) => (
                    <li
                      key={entry.uid}
                      title={entry.email}
                      className={classNames(
                        "group flex items-center gap-2 rounded-md border py-1 pl-1 pr-1.5 text-[12px]",
                        entry.status === "OFFERED" ? "border-sky-400/40 bg-sky-400/10" : "border-subtle"
                      )}>
                      <span
                        className={classNames(
                          "grid h-5 w-5 place-items-center rounded text-[11px] tabular-nums",
                          entry.status === "OFFERED" ? "bg-sky-400 text-black" : "bg-emphasis text-default"
                        )}>
                        {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => openPeek({ kind: "waitlist", uid: entry.uid })}
                        className="text-emphasis hover:underline"
                        data-testid="waitlist-person">
                        {entry.name}
                      </button>
                      {entry.status === "OFFERED" && entry.offerExpiresAt && (
                        <span className="text-sky-200">
                          {t("waitlist_chip_offered", {
                            time: dayjs(entry.offerExpiresAt).format("h:mma"),
                            slot: entry.offerStartTime && entry.kind !== "EXACT_TIME" ? ` ${dayjs(entry.offerStartTime).format("h:mma")}` : "",
                          }).trim()}
                        </span>
                      )}
                      <button
                        type="button"
                        aria-label={t("waitlist_remove_person", { name: entry.name })}
                        disabled={remove.isPending}
                        onClick={() => remove.mutate({ uid: entry.uid })}
                        className="text-subtle hover:text-emphasis grid h-4 w-4 place-items-center rounded opacity-60 transition group-hover:opacity-100">
                        <Icon name="x" className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function Summary({ label, value, caption }: { label: string; value: number; caption: string }) {
  return (
    <div className="p-5">
      <p className="text-emphasis text-[13px]">{label}</p>
      <p className="mt-2 flex items-baseline gap-2">
        <span className="text-emphasis text-[28px] font-light leading-none tabular-nums">{value}</span>
        <span className="text-subtle text-[13px]">{caption}</span>
      </p>
    </div>
  );
}
