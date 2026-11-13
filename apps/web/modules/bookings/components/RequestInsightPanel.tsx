"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";

/** AI triage for the host. The query is host-scoped server-side, so guests simply get nothing. */
export function RequestInsightPanel({ bookingUid }: { bookingUid: string }) {
  const { t } = useLocale();
  const query = trpc.viewer.requestInsights.get.useQuery({ bookingUid }, { retry: false });
  const insight = query.data?.insight;
  if (!insight) return null;

  return (
    <div className="border-subtle mt-6 rounded-lg border p-4 text-left" data-testid="request-insight">
      <p className="text-emphasis text-sm font-semibold">{t("request_insight_title")}</p>
      <p className="text-default mt-1 text-sm">{insight.summary}</p>
      <p className="text-subtle mt-2 text-xs">
        {t(`request_insight_fit_${insight.fit.toLowerCase()}`)}
        {insight.spamLikely ? ` · ${t("request_insight_spam")}` : ""}
      </p>
      {insight.concerns.length > 0 && (
        <ul className="text-subtle mt-2 list-disc pl-5 text-sm">
          {insight.concerns.map((concern) => (
            <li key={concern}>{concern}</li>
          ))}
        </ul>
      )}
      <p className="text-subtle mt-3 text-xs font-medium">{t("request_insight_reply")}</p>
      <p className="text-default text-sm">{insight.suggestedReply}</p>
    </div>
  );
}
