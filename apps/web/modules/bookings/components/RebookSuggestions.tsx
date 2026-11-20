"use client";

import dayjs from "@calcom/dayjs";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Button } from "@calcom/ui/components/button";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Suggestion = { start: string; reason: string | null };
type SuggestResponse = { suggestions: Suggestion[]; bookingPath: string; prefill: Record<string, string> };

const LOOKAHEAD_DAYS = 14;

/**
 * Shown to a client after they cancel: a few new times from the host's real availability, chosen around what they
 * told us. "Book this time" opens the booking form with the time and their details already filled in.
 */
export function RebookSuggestions({
  bookingUid,
  eventTypeId,
  username,
  hostName,
}: {
  bookingUid: string;
  eventTypeId: number;
  username: string;
  hostName: string;
}) {
  const { t } = useLocale();
  const timeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const range = useMemo(
    () => ({ startTime: dayjs().toISOString(), endTime: dayjs().add(LOOKAHEAD_DAYS, "day").toISOString() }),
    []
  );
  const schedule = trpc.viewer.slots.getSchedule.useQuery(
    { usernameList: [username], eventTypeId, timeZone, isTeamEvent: false, ...range },
    { retry: false, refetchOnWindowFocus: false }
  );
  const [result, setResult] = useState<SuggestResponse | null>(null);
  const [failed, setFailed] = useState(false);
  // ?rebook=<time> comes from the rebook email: that time is shown first, already picked.
  const fromEmail = useSearchParams()?.get("rebook") ?? null;
  const [picked, setPicked] = useState<string | null>(fromEmail);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const candidates = useMemo(() => {
    const slots = (schedule.data?.slots ?? {}) as Record<string, { time: string }[]>;
    return Object.values(slots)
      .flat()
      .map((s) => dayjs(s.time).toISOString());
  }, [schedule.data]);

  useEffect(() => {
    if (!schedule.isSuccess) return;
    let cancelled = false;
    fetch("/api/rebook/suggest", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bookingUid, timeZone, candidates: candidates.slice(0, 400) }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: SuggestResponse) => !cancelled && setResult(data))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [schedule.isSuccess, candidates, bookingUid, timeZone]);

  if (failed || schedule.isError) return null;

  // One click to pick, one to confirm: the client's details come from the booking they cancelled.
  const book = async (start: string) => {
    setBooking(true);
    setError(null);
    const res = await fetch("/api/rebook/book", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bookingUid, start }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.uid) {
      window.location.assign(`/booking/${json.uid}`);
      return;
    }
    setBooking(false);
    setError(t(json.message === "already_rebooked" ? "rebook_already" : "rebook_failed"));
  };

  const when = (start: string) => dayjs(start).tz(timeZone).format("dddd D MMMM, h:mma");

  return (
    <div className="border-subtle mt-8 rounded-xl border p-3 text-left sm:p-4" data-testid="rebook-suggestions">
      <p className="text-emphasis font-semibold">{t("rebook_title")}</p>
      <p className="text-subtle mt-0.5 text-sm">{t("rebook_subtitle", { name: hostName })}</p>
      {!result ? (
        // Same height as the loaded list, so the page doesn't jump when suggestions arrive.
        <div className="mt-4 space-y-2" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-subtle h-[60px] animate-pulse rounded-lg" />
          ))}
        </div>
      ) : result.suggestions.length === 0 ? (
        <p className="text-subtle mt-4 text-sm">{t("rebook_none")}</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {(fromEmail && !result.suggestions.some((s) => s.start === fromEmail)
            ? [{ start: fromEmail, reason: null }, ...result.suggestions]
            : result.suggestions
          ).map((s) => (
            <li
              key={s.start}
              className="border-subtle flex min-h-[60px] flex-col gap-2 rounded-lg border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <div className="min-w-0">
                <p className="text-emphasis text-sm font-medium">{when(s.start)}</p>
                {s.reason && <p className="text-subtle text-xs sm:truncate">{s.reason}</p>}
              </div>
              {picked === s.start ? (
                <div className="flex gap-2">
                  <Button size="sm" color="minimal" onClick={() => setPicked(null)} disabled={booking}>
                    {t("cancel")}
                  </Button>
                  <Button size="sm" onClick={() => book(s.start)} loading={booking} data-testid="rebook-confirm">
                    {t("rebook_confirm")}
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  className="w-full justify-center sm:w-auto"
                  onClick={() => setPicked(s.start)}
                  disabled={booking}
                  data-testid="rebook-accept">
                  {t("rebook_book_this")}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      {result && candidates.length > 0 && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="text-subtle hover:text-emphasis mt-3 inline-block text-xs underline">
          {t("rebook_see_all")}
        </button>
      )}
      {showAll && (
        <OtherTimes
          candidates={candidates}
          timeZone={timeZone}
          booking={booking}
          error={error}
          onClose={() => setShowAll(false)}
          onConfirm={book}
        />
      )}
    </div>
  );
}

/** Every open time in a pop-up, grouped by day: tap a time, then confirm. */
function OtherTimes({
  candidates,
  timeZone,
  booking,
  error,
  onClose,
  onConfirm,
}: {
  candidates: string[];
  timeZone: string;
  booking: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (start: string) => void;
}) {
  const { t } = useLocale();
  const [picked, setPicked] = useState<string | null>(null);
  const days = useMemo(() => {
    const byDay = new Map<string, string[]>();
    for (const start of candidates) {
      const day = dayjs(start).tz(timeZone).format("YYYY-MM-DD");
      byDay.set(day, [...(byDay.get(day) ?? []), start]);
    }
    return Array.from(byDay.entries());
  }, [candidates, timeZone]);
  const [day, setDay] = useState(days[0]?.[0] ?? "");
  const times = days.find(([key]) => key === day)?.[1] ?? [];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" data-testid="rebook-other-times">
      <button type="button" aria-label={t("close")} className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="bg-default border-subtle relative flex max-h-[85vh] w-full max-w-[420px] flex-col rounded-xl border p-4 shadow-2xl">
        <p className="text-emphasis font-semibold">{t("rebook_pick_time")}</p>
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
          {days.map(([key]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setDay(key);
                setPicked(null);
              }}
              className={`flex-none rounded-md border px-2.5 py-1.5 text-xs ${
                key === day ? "bg-inverted text-inverted border-transparent" : "border-subtle text-default"
              }`}>
              {dayjs(key).format("ddd D MMM")}
            </button>
          ))}
        </div>
        <div className="mt-3 grid min-h-0 flex-1 grid-cols-3 gap-1.5 overflow-y-auto">
          {times.map((start) => (
            <button
              key={start}
              type="button"
              onClick={() => setPicked(start)}
              className={`h-9 rounded-md border text-sm ${
                picked === start ? "bg-inverted text-inverted border-transparent" : "border-subtle text-default"
              }`}>
              {dayjs(start).tz(timeZone).format("h:mma")}
            </button>
          ))}
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <Button color="minimal" onClick={onClose} disabled={booking}>
            {t("cancel")}
          </Button>
          <Button
            onClick={() => picked && onConfirm(picked)}
            disabled={!picked}
            loading={booking}
            data-testid="rebook-other-confirm">
            {picked
              ? t("rebook_confirm_time", { time: dayjs(picked).tz(timeZone).format("ddd D MMM, h:mma") })
              : t("rebook_confirm")}
          </Button>
        </div>
      </div>
    </div>
  );
}
