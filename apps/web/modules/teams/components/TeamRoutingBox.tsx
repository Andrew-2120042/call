"use client";

import dayjs from "@calcom/dayjs";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Icon } from "@calcom/ui/components/icon";
import Link from "next/link";
import { type FormEvent, useState } from "react";

type Result = {
  service: { title: string; url: string } | null;
  member: { name: string; url: string } | null;
  reason: string | null;
  availability: {
    start: string;
    isPast: boolean;
    free: { username: string; name: string }[];
    bookUrl: string | null;
  } | null;
};

/** "Not sure what to book?" — the visitor describes their need and is pointed at a service or person. */
export function TeamRoutingBox({ teamSlug }: { teamSlug: string }) {
  const { t } = useLocale();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  // The question that produced the current answer; the button comes back once they ask something else.
  const [answered, setAnswered] = useState<string | null>(null);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (message.trim().length < 3) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/teams/route-request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ teamSlug, message, timeZone }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || t("something_went_wrong"));
      setResult(json);
      setAnswered(message.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : t("something_went_wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="border-subtle bg-default mt-6 rounded-lg border p-5" data-testid="team-routing">
      <p className="text-emphasis flex items-center gap-2 text-sm font-semibold">
        <Icon name="message-circle" className="h-4 w-4" />
        {t("team_routing_title")}
      </p>
      <form onSubmit={submit} className="mt-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={1000}
          rows={2}
          placeholder={t("team_routing_placeholder")}
          className="border-default bg-cal-muted text-emphasis focus:border-emphasis w-full resize-none rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none"
          data-testid="team-routing-input"
        />
        {answered !== message.trim() && (
          <button
            type="submit"
            disabled={loading || message.trim().length < 3}
            className="bg-inverted text-inverted mt-2 inline-flex h-9 items-center gap-2 rounded-md px-4 text-sm font-medium transition hover:opacity-90 disabled:opacity-50"
            data-testid="team-routing-submit">
            {loading && <Icon name="loader" className="h-4 w-4 animate-spin" />}
            {t("team_routing_button")}
          </button>
        )}
      </form>
      {error && (
        <p className="text-error mt-3 text-sm" role="alert">
          {error}
        </p>
      )}
      {result && (
        <div
          className="border-subtle mt-4 rounded-xl border p-4"
          data-testid="team-routing-result"
          aria-live="polite">
          {result.reason && <p className="text-default text-sm leading-relaxed">{result.reason}</p>}
          {result.availability && (
            <div
              className="border-subtle bg-muted mt-3 rounded-lg border p-3"
              data-testid="team-routing-availability">
              <p className="text-emphasis text-sm font-medium">
                {dayjs(result.availability.start).tz(timeZone).format("dddd D MMMM, h:mma")}
              </p>
              {result.availability.isPast ? (
                <p className="text-subtle mt-1 text-sm">{t("team_routing_time_past")}</p>
              ) : result.availability.free.length ? (
                <p className="text-subtle mt-1 text-sm">
                  {t("team_routing_free_then", {
                    names: result.availability.free.map((m) => m.name).join(", "),
                  })}
                </p>
              ) : (
                <p className="text-subtle mt-1 text-sm">{t("team_routing_nobody_free")}</p>
              )}
              {result.availability.bookUrl && (
                // A full page load so the booking page opens on this exact slot.
                <a
                  href={result.availability.bookUrl}
                  className="bg-inverted text-inverted mt-3 inline-block rounded-md px-4 py-1.5 text-sm font-medium"
                  data-testid="team-routing-book-time">
                  {t("team_routing_book_time", {
                    time: dayjs(result.availability.start).tz(timeZone).format("ddd h:mma"),
                  })}
                </a>
              )}
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {result.service && (
              <Link
                href={result.service.url}
                className="bg-inverted text-inverted rounded-md px-4 py-1.5 text-sm font-medium">
                {t("team_routing_book", { service: result.service.title })}
              </Link>
            )}
            {result.member && (
              <Link
                href={result.member.url}
                className="border-default text-emphasis rounded-md border px-4 py-1.5 text-sm">
                {t("team_routing_book_with", { name: result.member.name })}
              </Link>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
