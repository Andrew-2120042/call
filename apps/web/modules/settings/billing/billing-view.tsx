"use client";

import dayjs from "@calcom/dayjs";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button } from "@calcom/ui/components/button";
import { showToast } from "@calcom/ui/components/toast";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type PlanSummary = {
  plan: "FREE" | "PRO" | "TEAM";
  status: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  billingConfigured: boolean;
};

async function postForUrl(path: string, body?: unknown) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? "Request failed");
  return json.url as string;
}

export default function BillingView() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const [summary, setSummary] = useState<PlanSummary | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/billing/plan")
      .then((res) => res.json())
      .then(setSummary)
      .catch(() => showToast(t("something_went_wrong"), "error"));
  }, [t]);

  useEffect(() => {
    // Polar redirects here after payment; the webhook may land a few seconds later.
    if (searchParams?.get("checkout") === "success") showToast(t("billing_checkout_success"), "success");
  }, [searchParams, t]);

  const go = async (action: string, path: string, body?: unknown) => {
    setBusy(action);
    try {
      window.location.href = await postForUrl(path, body);
    } catch (error) {
      showToast((error as Error).message, "error");
      setBusy(null);
    }
  };

  if (!summary) return <p className="text-subtle">{t("loading")}</p>;

  const isPaid = summary.plan !== "FREE";
  return (
    <div className="space-y-6">
      <div className="border-subtle rounded-lg border p-6">
        <p className="text-subtle text-sm">{t("billing_current_plan")}</p>
        <p className="text-emphasis mt-1 text-2xl font-semibold">
          {t(`billing_plan_${summary.plan.toLowerCase()}`)}
        </p>
        {summary.currentPeriodEnd && isPaid && (
          <p className="text-subtle mt-1 text-sm">
            {t(
              summary.cancelAtPeriodEnd || summary.status === "canceled"
                ? "billing_ends_on"
                : "billing_renews_on",
              {
                date: dayjs(summary.currentPeriodEnd).format("MMMM D, YYYY"),
              }
            )}
          </p>
        )}
        {isPaid && (
          <Button
            className="mt-4"
            color="secondary"
            loading={busy === "portal"}
            onClick={() => go("portal", "/api/billing/portal")}>
            {t("billing_manage")}
          </Button>
        )}
      </div>

      {!isPaid && (
        <div className="grid gap-4 md:grid-cols-2">
          {(["pro", "team"] as const).map((plan) => (
            <div key={plan} className="border-subtle rounded-lg border p-6">
              <p className="text-emphasis text-lg font-semibold">{t(`billing_plan_${plan}`)}</p>
              <p className="text-default mt-1">{t(`billing_plan_${plan}_price`)}</p>
              <p className="text-subtle mt-2 text-sm">{t(`billing_plan_${plan}_features`)}</p>
              <Button
                className="mt-4"
                disabled={!summary.billingConfigured}
                loading={busy === plan}
                onClick={() => go(plan, "/api/billing/checkout", { plan })}>
                {t("billing_upgrade")}
              </Button>
            </div>
          ))}
        </div>
      )}
      {!summary.billingConfigured && <p className="text-subtle text-sm">{t("billing_not_configured")}</p>}
    </div>
  );
}
