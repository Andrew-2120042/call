"use client";

import dayjs from "@calcom/dayjs";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button } from "@calcom/ui/components/button";
import { Icon } from "@calcom/ui/components/icon";
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

  const current = summary.plan;
  const isPaid = current !== "FREE";
  const plans: {
    id: "FREE" | "PRO" | "TEAM";
    price: string;
    per: string;
    features: string[];
    soon?: boolean;
  }[] = [
    {
      id: "FREE",
      price: "$0",
      per: t("billing_forever"),
      features: [
        t("billing_f_page"),
        t("billing_f_unlimited"),
        t("billing_f_two_questions"),
        t("billing_f_one_reminder"),
        t("billing_f_assistant"),
        t("billing_f_apps"),
        t("billing_f_import"),
      ],
    },
    {
      id: "PRO",
      price: "$12",
      per: t("billing_per_month"),
      features: [
        t("billing_f_everything_free"),
        t("billing_f_approvals"),
        t("billing_f_waitlist"),
        t("billing_f_confirm"),
        t("billing_f_ai_summaries"),
        t("billing_f_reminders"),
        t("billing_f_questions"),
        t("billing_f_branding"),
        t("billing_f_domain"),
      ],
    },
    {
      id: "TEAM",
      price: "$49",
      per: t("billing_per_month_team"),
      features: [
        t("billing_f_everything_pro"),
        t("billing_f_team_members"),
        t("billing_f_round_robin"),
        t("billing_f_team_page"),
      ],
      soon: true,
    },
  ];

  return (
    <div className="space-y-6" data-testid="billing-view">
      <div className="bg-default border-subtle flex flex-wrap items-center justify-between gap-4 rounded-[22px] border p-6">
        <div>
          <p className="text-subtle text-sm">{t("billing_current_plan")}</p>
          <div className="mt-1 flex items-center gap-2.5">
            <p className="text-emphasis text-2xl font-semibold">
              {t(`billing_plan_${current.toLowerCase()}`)}
            </p>
            <span className="bg-subtle text-emphasis rounded-full px-2.5 py-0.5 text-xs font-medium">
              {summary.cancelAtPeriodEnd || summary.status === "canceled"
                ? t("billing_status_ending")
                : t("billing_status_active")}
            </span>
          </div>
          {summary.currentPeriodEnd && isPaid && (
            <p className="text-subtle mt-1 text-sm">
              {t(
                summary.cancelAtPeriodEnd || summary.status === "canceled"
                  ? "billing_ends_on"
                  : "billing_renews_on",
                { date: dayjs(summary.currentPeriodEnd).format("MMMM D, YYYY") }
              )}
            </p>
          )}
          {!isPaid && <p className="text-subtle mt-1 text-sm">{t("billing_free_hint")}</p>}
        </div>
        {isPaid && (
          <Button
            color="secondary"
            loading={busy === "portal"}
            onClick={() => go("portal", "/api/billing/portal")}>
            {t("billing_manage")}
          </Button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.id === current;
          const isPro = plan.id === "PRO";
          return (
            <div
              key={plan.id}
              className={
                isPro
                  ? "bg-inverted text-inverted flex flex-col rounded-[22px] p-6"
                  : "bg-default border-subtle text-emphasis flex flex-col rounded-[22px] border p-6"
              }>
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">{t(`billing_plan_${plan.id.toLowerCase()}`)}</p>
                {isCurrent && (
                  <span
                    className={
                      isPro
                        ? "rounded-full bg-white/15 px-2.5 py-0.5 text-xs"
                        : "bg-subtle rounded-full px-2.5 py-0.5 text-xs"
                    }>
                    {t("billing_current_badge")}
                  </span>
                )}
                {plan.soon && !isCurrent && (
                  <span className="bg-subtle rounded-full px-2.5 py-0.5 text-xs">{t("billing_soon")}</span>
                )}
              </div>
              <p className="mt-3">
                <span className="text-[32px] font-semibold tracking-tight">{plan.price}</span>
                <span className={isPro ? "ml-1 text-sm opacity-70" : "text-subtle ml-1 text-sm"}>
                  {plan.per}
                </span>
              </p>
              <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Icon name="check" className="mt-0.5 h-4 w-4 flex-none" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {isPro && !isCurrent && (
                <button
                  type="button"
                  disabled={!summary.billingConfigured || busy === "pro"}
                  onClick={() => go("pro", "/api/billing/checkout", { plan: "pro" })}
                  className="mt-6 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#121212] transition hover:opacity-90 disabled:opacity-50">
                  {busy === "pro" ? t("loading") : t("billing_upgrade_pro")}
                </button>
              )}
            </div>
          );
        })}
      </div>
      {!summary.billingConfigured && (
        <p className="text-subtle text-center text-sm">{t("billing_not_configured")}</p>
      )}
    </div>
  );
}
