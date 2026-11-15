"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Icon } from "@calcom/ui/components/icon";
import Link from "next/link";
import { type FormEvent, useState } from "react";

type Result = {
  service: { title: string; url: string } | null;
  member: { name: string; url: string } | null;
  reason: string | null;
};

/** "Not sure what to book?" — the visitor describes their need and is pointed at a service or person. */
export function TeamRoutingBox({ teamSlug }: { teamSlug: string }) {
  const { t } = useLocale();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        body: JSON.stringify({ teamSlug, message }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || t("something_went_wrong"));
      setResult(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("something_went_wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="border-subtle bg-default mt-6 rounded-2xl border p-5" data-testid="team-routing">
      <p className="text-emphasis flex items-center gap-2 text-sm font-semibold">
        <Icon name="sparkles" className="h-4 w-4" />
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
        <button
          type="submit"
          disabled={loading || message.trim().length < 3}
          className="bg-inverted text-inverted mt-2 inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium transition hover:opacity-90 disabled:opacity-50"
          data-testid="team-routing-submit">
          {loading && <Icon name="loader" className="h-4 w-4 animate-spin" />}
          {t("team_routing_button")}
        </button>
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
          <div className="mt-3 flex flex-wrap gap-2">
            {result.service && (
              <Link
                href={result.service.url}
                className="bg-inverted text-inverted rounded-full px-4 py-1.5 text-sm font-medium">
                {t("team_routing_book", { service: result.service.title })}
              </Link>
            )}
            {result.member && (
              <Link
                href={result.member.url}
                className="border-default text-emphasis rounded-full border px-4 py-1.5 text-sm">
                {t("team_routing_book_with", { name: result.member.name })}
              </Link>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
