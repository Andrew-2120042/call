"use client";

import { type ReactNode, useState } from "react";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Badge } from "@calcom/ui/components/badge";
import { Button } from "@calcom/ui/components/button";
import { TextArea } from "@calcom/ui/components/form";
import { showToast } from "@calcom/ui/components/toast";

type Fit = "GOOD" | "UNCLEAR" | "POOR";

const FIT_VARIANT: Record<Fit, "green" | "orange" | "gray"> = { GOOD: "green", UNCLEAR: "orange", POOR: "gray" };

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
export function RequestInsightPanel({
  bookingUid,
  actions,
  clientName,
}: {
  bookingUid: string;
  actions?: ReactNode;
  clientName?: string;
}) {
  const { t } = useLocale();
  const query = trpc.viewer.requestInsights.get.useQuery({ bookingUid }, { retry: false });
  const insight = query.data?.insight;

  if (!insight) {
    if (!actions) return null;
    return (
      <div className="border-subtle mt-6 rounded-xl border p-4 text-left">
        {query.data?.enabled && <p className="text-subtle text-sm">{t("request_insight_pending")}</p>}
        <div className={query.data?.enabled ? "mt-4" : ""}>{actions}</div>
      </div>
    );
  }

  return (
    <div className="border-subtle bg-muted mt-6 rounded-xl border p-4 text-left" data-testid="request-insight">
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
function SuggestedReply({ bookingUid, initial, clientName }: { bookingUid: string; initial: string; clientName?: string }) {
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
        <p className="text-subtle text-xs">{sentTo ? t("request_reply_sent", { email: sentTo }) : t("request_reply_hint")}</p>
        <Button
          size="sm"
          color="secondary"
          StartIcon={sentTo ? "check" : "send"}
          loading={send.isPending}
          disabled={!message.trim() || !!sentTo}
          onClick={() => send.mutate({ bookingUid, message })}
          data-testid="send-request-reply">
          {sentTo ? t("request_reply_sent_short") : t("request_reply_send", { name: clientName || t("client") })}
        </Button>
      </div>
    </div>
  );
}

/** One line for the bookings list: the fit, a spam flag and the start of the summary. */
export function RequestInsightLine({ bookingUid }: { bookingUid: string }) {
  const query = trpc.viewer.requestInsights.get.useQuery({ bookingUid }, { retry: false, staleTime: 60_000 });
  const insight = query.data?.insight;
  if (!insight) return null;
  return (
    <div
      className="mt-1.5 flex min-w-0 max-w-[16rem] items-center gap-1.5 sm:max-w-56 md:max-w-80 xl:max-w-md"
      data-testid="request-insight-line">
      <RequestFitBadges fit={insight.fit as Fit} spamLikely={insight.spamLikely} />
      <span className="text-subtle min-w-0 truncate text-xs" title={insight.summary}>
        {insight.summary}
      </span>
    </div>
  );
}
