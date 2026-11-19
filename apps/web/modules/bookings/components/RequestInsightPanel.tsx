"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Badge } from "@calcom/ui/components/badge";
import { Button } from "@calcom/ui/components/button";
import { TextArea } from "@calcom/ui/components/form";
import { showToast } from "@calcom/ui/components/toast";
import { type ReactNode, useState } from "react";
import { usePeek } from "~/peek/peekStore";

type Fit = "GOOD" | "UNCLEAR" | "POOR";

const FIT_VARIANT: Record<Fit, "green" | "orange" | "gray"> = {
  GOOD: "green",
  UNCLEAR: "orange",
  POOR: "gray",
};

export function RequestFitBadges({ fit, spamLikely }: { fit: Fit; spamLikely: boolean }) {
  const { t } = useLocale();
  return (
    <>
      <Badge variant={FIT_VARIANT[fit]} className="shrink-0 whitespace-nowrap">
        {t(`request_insight_fit_${fit.toLowerCase()}`)}
      </Badge>
      {spamLikely && (
        <Badge variant="red" className="shrink-0 whitespace-nowrap">
          {t("request_insight_spam")}
        </Badge>
      )}
    </>
  );
}

/**
 * AI triage for the host. The query is host-scoped server-side, so guests simply get nothing.
 * `actions` lets the request page put Accept / Decline right under the assessment.
 */
export type InitialRequestInsight = {
  summary: string;
  fit: string;
  spamLikely: boolean;
  concerns: string[];
  suggestedReply: string;
  createdAt: string;
} | null;

export function RequestInsightPanel({
  bookingUid,
  actions,
  clientName,
  initialInsight,
}: {
  bookingUid: string;
  actions?: ReactNode;
  clientName?: string;
  /** From the server render, so the panel is there on first paint instead of replacing a placeholder. */
  initialInsight?: InitialRequestInsight;
}) {
  const { t } = useLocale();
  const query = trpc.viewer.requestInsights.get.useQuery(
    { bookingUid },
    {
      retry: false,
      // The summary is written in the background after booking; check back quietly instead of telling the host to wait.
      refetchInterval: (q) => (q.state.data?.enabled && !q.state.data.insight ? 15000 : false),
      ...(initialInsight
        ? {
            initialData: {
              enabled: true,
              insight: {
                ...initialInsight,
                fit: initialInsight.fit as "GOOD" | "UNCLEAR" | "POOR",
                createdAt: new Date(initialInsight.createdAt),
              },
            },
          }
        : {}),
    }
  );
  // Use the server's copy directly when there is one: the query isn't resolved during server rendering, and the
  // server and browser must draw the same thing.
  const insight =
    query.data?.insight ??
    (initialInsight
      ? {
          ...initialInsight,
          fit: initialInsight.fit as "GOOD" | "UNCLEAR" | "POOR",
          createdAt: new Date(initialInsight.createdAt),
        }
      : undefined);

  // Hold roughly the panel's space while it loads so the booking details below don't jump.
  if (!insight && query.isPending && actions) {
    return (
      // Matches the finished panel's height (about 575px), so nothing below it moves when it arrives.
      <div
        className="border-subtle bg-muted mt-6 flex h-[575px] animate-pulse flex-col rounded-xl border p-4"
        aria-hidden>
        <div className="bg-emphasis h-4 w-40 rounded" />
        <div className="bg-emphasis mt-3 h-3 w-full rounded" />
        <div className="bg-emphasis mt-2 h-3 w-5/6 rounded" />
        <div className="bg-emphasis mt-5 h-3 w-4/6 rounded" />
        <div className="bg-emphasis mt-2 h-3 w-3/6 rounded" />
        <div className="bg-emphasis mt-5 w-full flex-1 rounded-lg" />
        <div className="mt-5 flex justify-end gap-2">
          <div className="bg-emphasis h-9 w-32 rounded-lg" />
          <div className="bg-emphasis h-9 w-32 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!insight) {
    if (!actions) return null;
    return <div className="border-subtle mt-6 rounded-xl border p-4 text-left">{actions}</div>;
  }

  return (
    <div
      className="border-subtle bg-muted mt-6 rounded-xl border p-4 text-left"
      data-testid="request-insight">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-emphasis text-sm font-semibold">{t("request_insight_title")}</p>
        <RequestFitBadges fit={insight.fit as Fit} spamLikely={insight.spamLikely} />
      </div>
      <p className="text-default mt-2 text-sm leading-relaxed">{insight.summary}</p>
      {insight.concerns.length > 0 && (
        <ul className="text-subtle mt-3 list-disc space-y-1 pl-5 text-sm">
          {insight.concerns.map((concern) => (
            <li key={concern}>{concern}</li>
          ))}
        </ul>
      )}
      <SuggestedReply bookingUid={bookingUid} initial={insight.suggestedReply} clientName={clientName} />
      {actions && <div className="mt-4">{actions}</div>}
    </div>
  );
}

/** The AI's draft reply: editable, copyable, and sendable to the client by email (replies reach the host). */
function SuggestedReply({
  bookingUid,
  initial,
  clientName,
}: {
  bookingUid: string;
  initial: string;
  clientName?: string;
}) {
  const { t } = useLocale();
  const [message, setMessage] = useState(initial);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const send = trpc.viewer.requestInsights.sendReply.useMutation({
    onSuccess: (result) => {
      setSentTo(result.sentTo);
      showToast(t("request_reply_sent", { email: result.sentTo }), "success");
    },
    onError: (error) => showToast(error.message, "error"),
  });

  return (
    <div className="border-subtle bg-default mt-4 rounded-lg border p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-emphasis text-xs font-semibold">{t("request_insight_reply")}</p>
        <Button
          color="minimal"
          size="sm"
          StartIcon="copy"
          onClick={() => {
            navigator.clipboard.writeText(message);
            showToast(t("request_insight_reply_copied"), "success");
          }}>
          {t("copy")}
        </Button>
      </div>
      <TextArea
        name="suggestedReply"
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          setSentTo(null);
        }}
        rows={5}
        className="mt-2 text-sm leading-relaxed"
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-subtle text-xs">
          {sentTo ? t("request_reply_sent", { email: sentTo }) : t("request_reply_hint")}
        </p>
        <Button
          size="sm"
          color="secondary"
          StartIcon={sentTo ? "check" : "send"}
          loading={send.isPending}
          disabled={!message.trim() || !!sentTo}
          onClick={() => send.mutate({ bookingUid, message })}
          data-testid="send-request-reply">
          {sentTo
            ? t("request_reply_sent_short")
            : t("request_reply_send", { name: clientName || t("client") })}
        </Button>
      </div>
    </div>
  );
}

/** One line for the bookings list: the fit, a spam flag and the start of the summary. */
export function RequestInsightLine({ bookingUid }: { bookingUid: string }) {
  const { t } = useLocale();
  const openPeek = usePeek((state) => state.open);
  const query = trpc.viewer.requestInsights.get.useQuery({ bookingUid }, { retry: false, staleTime: 60_000 });
  const insight = query.data?.insight;
  // The line keeps its height whether it's loading, empty or filled, so list rows never change size.
  if (!insight) return <div className="mb-2.5 mt-2 h-5" aria-hidden />;
  return (
    <div
      className="mb-2.5 mt-2 flex h-5 min-w-0 max-w-[18rem] items-center gap-2 sm:max-w-64 md:max-w-96 xl:max-w-xl"
      data-testid="request-insight-line">
      <RequestFitBadges fit={insight.fit as Fit} spamLikely={insight.spamLikely} />
      <span className="text-subtle min-w-0 truncate text-xs" title={insight.summary}>
        {insight.summary}
      </span>
      <button
        type="button"
        onClick={(event) => {
          // The row itself also opens the panel; stop here so it opens once.
          event.stopPropagation();
          openPeek({ kind: "booking", uid: bookingUid });
        }}
        className="text-default hover:text-emphasis shrink-0 text-xs underline underline-offset-2"
        data-testid="request-view-message">
        {t("request_view_message")}
      </button>
    </div>
  );
}
