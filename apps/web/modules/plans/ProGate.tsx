"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Icon } from "@calcom/ui/components/icon";
import { showToast } from "@calcom/ui/components/toast";
import { headingFont } from "@lib/headingFont";
import Link from "next/link";
import { useEffect, useState } from "react";

type Summary = { plan: string; trialAvailable?: boolean };

/**
 * Shown in place of a Pro feature for accounts on Free: what the feature does, and a one-click 14-day trial
 * (or the plans page once the trial has been used).
 */
export function ProGate({ titleKey, bodyKey, points }: { titleKey: string; bodyKey: string; points: string[] }) {
  const { t } = useLocale();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/billing/plan")
      .then((res) => res.json())
      .then(setSummary)
      .catch(() => setSummary(null));
  }, []);

  const startTrial = async () => {
    setBusy(true);
    const res = await fetch("/api/billing/trial", { method: "POST" });
    if (res.ok) {
      showToast(t("trial_started"), "success");
      // Plan checks run on the server, so reload to open the feature.
      window.location.reload();
      return;
    }
    const body = await res.json().catch(() => ({}));
    showToast(body.message ?? t("something_went_wrong"), "error");
    setBusy(false);
  };

  return (
    <div className="mx-auto max-w-[520px] py-10 text-center" data-testid="pro-gate">
      <span className="inline-block rounded-md bg-[#2f5bff]/15 px-2 py-0.5 text-[12px] font-medium text-[#7aa2ff]">
        {t("pro_gate_tag")}
      </span>
      <h2 className={`${headingFont.className} text-emphasis mt-3 text-[30px] font-normal leading-tight`}>
        {t(titleKey)}
      </h2>
      <p className="text-subtle mx-auto mt-2 max-w-[44ch] text-[14px] leading-relaxed">{t(bodyKey)}</p>
      <ul className="mx-auto mt-5 inline-block space-y-2 text-left">
        {points.map((key) => (
          <li key={key} className="text-default flex items-start gap-2.5 text-[13px]">
            <Icon name="check" className="text-subtle mt-0.5 h-4 w-4 shrink-0" />
            {t(key)}
          </li>
        ))}
      </ul>
      <div className="mt-7 flex items-center justify-center gap-2">
        {summary?.trialAvailable !== false && (
          <button
            type="button"
            onClick={startTrial}
            disabled={busy || !summary}
            data-testid="pro-gate-trial"
            className="bg-inverted text-inverted h-9 rounded-md px-4 text-[13px] font-medium disabled:opacity-50">
            {busy ? t("loading") : t("trial_start_cta")}
          </button>
        )}
        <Link
          href="/upgrade"
          className="border-subtle text-default hover:bg-subtle inline-flex h-9 items-center rounded-md border px-4 text-[13px]">
          {t("pro_gate_see_plans")}
        </Link>
      </div>
      {summary?.trialAvailable !== false && <p className="text-subtle mt-3 text-[12px]">{t("trial_note")}</p>}
    </div>
  );
}
