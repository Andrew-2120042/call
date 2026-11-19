"use client";

import dayjs from "@calcom/dayjs";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Button } from "@calcom/ui/components/button";
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

  const bookHref = (start?: string) => {
    if (!result) return "#";
    const params = new URLSearchParams(result.prefill);
    if (start) {
      const local = dayjs(start).tz(timeZone);
      params.set("date", local.format("YYYY-MM-DD"));
      params.set("slot", start);
    }
    return `${result.bookingPath}?${params.toString()}`;
  };

  return (
    <div
      className="border-subtle mt-8 rounded-xl border p-3 text-left sm:p-4"
      data-testid="rebook-suggestions">
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
          {result.suggestions.map((s) => (
            <li
              key={s.start}
              className="border-subtle flex min-h-[60px] flex-col gap-2 rounded-lg border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <div className="min-w-0">
                <p className="text-emphasis text-sm font-medium">
                  {dayjs(s.start).tz(timeZone).format("dddd D MMMM, h:mma")}
                </p>
                {s.reason && <p className="text-subtle text-xs sm:truncate">{s.reason}</p>}
              </div>
              <Button
                size="sm"
                className="w-full justify-center sm:w-auto"
                // A full page load: client-side navigation into the booker keeps its old state and drops the slot.
                onClick={() => window.location.assign(bookHref(s.start))}
                data-testid="rebook-accept">
                {t("rebook_book_this")}
              </Button>
            </li>
          ))}
        </ul>
      )}
      {result && (
        <a
          href={bookHref()}
          rel="external"
          className="text-subtle hover:text-emphasis mt-3 inline-block text-xs underline">
          {t("rebook_see_all")}
        </a>
      )}
    </div>
  );
}
