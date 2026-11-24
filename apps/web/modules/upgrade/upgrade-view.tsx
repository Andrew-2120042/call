"use client";

import { APP_NAME } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import classNames from "@calcom/ui/classNames";
import { Icon } from "@calcom/ui/components/icon";
import { Logo } from "@calcom/ui/components/logo";
import { showToast } from "@calcom/ui/components/toast";
import { headingFont } from "@lib/headingFont";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";

type PlanId = "FREE" | "PRO" | "TEAM";
type PlanSummary = { plan: PlanId; billingConfigured: boolean; trialAvailable?: boolean; onTrial?: boolean };

// true = included, a string = included with that limit, false = not included.
type Cell = boolean | string;
const COMPARISON: { groupKey: string; rows: { key: string; free: Cell; pro: Cell; team: Cell }[] }[] = [
  {
    groupKey: "upgrade_group_page",
    rows: [
      { key: "billing_f_page", free: true, pro: true, team: true },
      { key: "billing_f_unlimited", free: true, pro: true, team: true },
      { key: "billing_f_approvals", free: true, pro: true, team: true },
      { key: "billing_f_questions", free: true, pro: true, team: true },
      { key: "billing_f_apps", free: true, pro: true, team: true },
      { key: "billing_f_import", free: true, pro: true, team: true },
      { key: "billing_f_assistant", free: false, pro: true, team: true },
    ],
  },
  {
    groupKey: "upgrade_group_fill",
    rows: [
      { key: "upgrade_row_reminders", free: "5", pro: "5", team: "5" },
      { key: "upgrade_row_rebook_emails", free: "1", pro: "2", team: "2" },
      { key: "billing_f_waitlist", free: "upgrade_cell_one_service", pro: "upgrade_cell_every_service", team: "upgrade_cell_every_service" },
      { key: "billing_f_waitlist_everyone", free: false, pro: true, team: true },
      { key: "billing_f_confirm", free: false, pro: true, team: true },
      { key: "billing_f_ai_summaries", free: false, pro: true, team: true },
    ],
  },
  {
    groupKey: "upgrade_group_brand",
    rows: [
      { key: "billing_f_branding", free: false, pro: true, team: true },
      { key: "billing_f_domain", free: false, pro: true, team: true },
    ],
  },
  {
    groupKey: "upgrade_group_team",
    rows: [
      { key: "upgrade_row_people", free: "1", pro: "1", team: "upgrade_row_people_team" },
      { key: "billing_f_round_robin", free: false, pro: false, team: true },
      { key: "billing_f_team_page", free: false, pro: false, team: true },
    ],
  },
];

const FAQ = ["cancel", "keep", "trial", "team"];

/** A page of its own for choosing a plan: what each plan gets you, side by side, and one button to upgrade. */
export default function UpgradeView() {
  const { t } = useLocale();
  const router = useRouter();
  const [summary, setSummary] = useState<PlanSummary | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/billing/plan")
      .then((res) => res.json())
      .then(setSummary)
      .catch(() => showToast(t("something_went_wrong"), "error"));
  }, [t]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && leave();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const leave = () => (window.history.length > 1 ? router.back() : router.push("/home"));

  const upgrade = async (target: "pro" | "team") => {
    setBusy(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan: target }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? t("something_went_wrong"));
      window.location.href = json.url;
    } catch (error) {
      showToast((error as Error).message, "error");
      setBusy(false);
    }
  };

  const current = summary?.plan ?? null;
  const onTrial = !!summary?.onTrial;
  // Someone on the free trial can still subscribe; their paid plan takes over from the trial.
  const canBuy = !!summary?.billingConfigured && (current === "FREE" || onTrial);
  // Paying Pro customers can move up to Team too; their subscription is switched rather than doubled.
  const canBuyTeam = !!summary?.billingConfigured && current !== "TEAM";
  const startTrial = async () => {
    setBusy(true);
    const res = await fetch("/api/billing/trial", { method: "POST" });
    if (res.ok) {
      showToast(t("trial_started"), "success");
      window.location.href = "/home";
      return;
    }
    const json = await res.json().catch(() => ({}));
    showToast(json.message ?? t("something_went_wrong"), "error");
    setBusy(false);
  };

  const plans: { id: PlanId; price: string; per: string; blurbKey: string; points: string[] }[] = [
    {
      id: "FREE",
      price: "$0",
      per: t("billing_forever"),
      blurbKey: "upgrade_blurb_free",
      points: ["billing_f_page", "billing_f_unlimited", "billing_f_questions"],
    },
    {
      id: "PRO",
      price: "$12",
      per: t("upgrade_per_month_short"),
      blurbKey: "upgrade_blurb_pro",
      points: [
        "billing_f_approvals",
        "billing_f_waitlist",
        "billing_f_confirm",
        "billing_f_ai_summaries",
        "billing_f_assistant",
        "billing_f_reminders",
        "billing_f_domain",
      ],
    },
    {
      id: "TEAM",
      price: "$69",
      per: t("upgrade_per_month_short"),
      blurbKey: "upgrade_blurb_team",
      points: [
        "billing_f_everything_pro",
        "billing_f_team_members",
        "billing_f_round_robin",
        "billing_f_team_page",
      ],
    },
  ];

  return (
    <div className="bg-default text-default min-h-screen" data-testid="upgrade-page">
      <header className="border-subtle bg-default/90 sticky top-0 z-10 flex h-14 items-center border-b px-5 backdrop-blur md:px-8">
        <Logo small />
        <span className="text-subtle ml-3 text-[13px]">{t("upgrade_page_crumb")}</span>
        <button
          type="button"
          onClick={leave}
          aria-label={t("close")}
          data-testid="upgrade-close"
          className="text-subtle hover:text-emphasis hover:bg-subtle ml-auto grid h-8 w-8 place-items-center rounded-md">
          <Icon name="x" className="h-4 w-4" />
        </button>
      </header>

      <main className="mx-auto max-w-[1080px] px-5 pb-24 pt-14 md:px-8">
        {/* Same layout as the pricing page on the website: headline left, the short pitch right. */}
        <section className="grid items-end gap-6 md:grid-cols-[1.4fr_1fr]">
          <h1
            className={`${headingFont.className} text-emphasis max-w-[18ch] text-[36px] font-normal leading-[1.05] tracking-[-0.02em] md:text-[48px]`}>
            {t("upgrade_page_title")}
          </h1>
          <p className="text-subtle text-[15px] leading-relaxed md:pb-2">{t("upgrade_page_subtitle")}</p>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-3 md:gap-0">
          {plans.map((plan) => {
            const isPro = plan.id === "PRO";
            const isCurrent = plan.id === current;
            return (
              <div
                key={plan.id}
                className={classNames(
                  "flex flex-col rounded-xl border p-6 md:rounded-none",
                  isPro
                    ? "border-[#ebf23a]/50 bg-[#ebf23a]/[0.04] md:rounded-xl"
                    : "border-subtle md:border-0"
                )}>
                {/* Every column keeps the badge row so names and prices line up across plans. */}
                <div className="h-5">
                  {isPro && (
                    <span className="inline-block rounded bg-[#ebf23a] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-black">
                      {t("upgrade_most_popular")}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className={`${headingFont.className} text-emphasis text-[24px] leading-none`}>
                    {t(`billing_plan_${plan.id.toLowerCase()}`)}
                  </p>
                  {isCurrent && (
                    <span className="border-subtle text-subtle rounded border px-1.5 py-0.5 text-[11px]">
                      {t("billing_current_badge")}
                    </span>
                  )}
                </div>
                <p className="text-subtle mt-1 min-h-[40px] text-[13px] leading-snug">{t(plan.blurbKey)}</p>
                <p className="mt-5 flex items-baseline gap-1.5">
                  <span className={`${headingFont.className} text-emphasis text-[36px] leading-none tracking-[-0.02em]`}>
                    {plan.price}
                  </span>
                  <span className="text-subtle text-[13px]">{plan.per}</span>
                </p>
                {plan.id === "TEAM" && (
                  <p className="text-subtle mt-1 text-[12px]">{t("upgrade_team_price_note")}</p>
                )}

                <div className="mt-6">
                  {plan.id === "PRO" ? (
                    <button
                      type="button"
                      onClick={() => upgrade("pro")}
                      disabled={!canBuy || busy}
                      data-testid="upgrade-pro"
                      className="h-10 w-full rounded-md bg-[#ebf23a] text-[14px] font-medium text-black transition hover:brightness-95 disabled:opacity-50">
                      {busy
                        ? t("loading")
                        : (isCurrent && !onTrial) || current === "TEAM"
                          ? t("upgrade_youre_on_it")
                          : t("billing_upgrade_pro")}
                    </button>
                  ) : null}
                  {plan.id === "PRO" && summary?.trialAvailable && current === "FREE" ? (
                    <button
                      type="button"
                      onClick={startTrial}
                      disabled={busy}
                      data-testid="upgrade-trial"
                      className="border-subtle text-emphasis hover:bg-subtle mt-2 h-10 w-full rounded-md border text-[14px] transition disabled:opacity-50">
                      {t("trial_start_cta")}
                    </button>
                  ) : null}
                  {plan.id === "TEAM" ? (
                    <button
                      type="button"
                      onClick={() => upgrade("team")}
                      disabled={!canBuyTeam || busy}
                      data-testid="upgrade-team"
                      className="border-emphasis text-emphasis hover:bg-subtle h-10 w-full rounded-md border text-[14px] font-medium transition disabled:opacity-50">
                      {busy
                        ? t("loading")
                        : isCurrent
                          ? t("upgrade_youre_on_it")
                          : current === "PRO" && !onTrial
                            ? t("billing_switch_team")
                            : t("billing_upgrade_team")}
                    </button>
                  ) : null}
                  {plan.id === "FREE" ? (
                    <button
                      type="button"
                      disabled
                      className="border-subtle text-subtle h-10 w-full rounded-md border text-[14px]">
                      {isCurrent ? t("upgrade_youre_on_it") : t("upgrade_free_forever")}
                    </button>
                  ) : null}
                </div>

                <ul className="border-subtle mt-6 space-y-2.5 border-t pt-5 text-[13px]">
                  {plan.points.map((key) => (
                    <li key={key} className="flex items-start gap-2">
                      <Icon name="check" className="text-emphasis mt-0.5 h-4 w-4 flex-none" />
                      <span>{t(key, { appName: APP_NAME })}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
        {summary && !summary.billingConfigured && (
          <p className="text-subtle mt-4 text-center text-[13px]">{t("billing_not_configured")}</p>
        )}

        <section className="mt-20">
          <h2
            className={`${headingFont.className} text-emphasis text-center text-[32px] font-normal tracking-[-0.02em]`}>
            {t("upgrade_compare_title")}
          </h2>
          <div className="border-subtle mt-6 overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[640px] table-fixed text-[13px]">
              <thead>
                <tr className="border-subtle border-b">
                  <th className="text-subtle w-[46%] px-5 py-3 text-left font-normal">
                    {t("upgrade_compare_feature")}
                  </th>
                  {(["free", "pro", "team"] as const).map((id) => (
                    <th key={id} className="text-emphasis w-[18%] px-5 py-3 text-center font-medium">
                      {t(`billing_plan_${id}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((group) => (
                  <Fragment key={group.groupKey}>
                    <tr className="bg-muted/50">
                      <td
                        colSpan={4}
                        className="text-subtle px-5 py-2 text-[11px] uppercase tracking-[0.06em]">
                        {t(group.groupKey)}
                      </td>
                    </tr>
                    {group.rows.map((row) => (
                      <tr key={row.key} className="border-subtle border-t">
                        <td className="text-default px-5 py-3">{t(row.key, { appName: APP_NAME })}</td>
                        {[row.free, row.pro, row.team].map((cell, index) => (
                          <td key={index} className="px-5 py-3 text-center">
                            <CellMark value={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-20 grid gap-10 md:grid-cols-[280px_1fr]">
          <h2 className={`${headingFont.className} text-emphasis text-[28px] font-normal tracking-[-0.02em]`}>
            {t("upgrade_faq_title")}
          </h2>
          <dl className="border-subtle divide-subtle divide-y border-y">
            {FAQ.map((id) => (
              <div key={id} className="py-5">
                <dt className="text-emphasis text-[14px] font-medium">{t(`upgrade_faq_${id}_q`)}</dt>
                <dd className="text-subtle mt-1.5 text-[13px] leading-relaxed">{t(`upgrade_faq_${id}_a`)}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </div>
  );
}

function CellMark({ value }: { value: Cell }) {
  const { t } = useLocale();
  if (value === true) return <Icon name="check" className="text-emphasis mx-auto h-4 w-4" />;
  if (value === false) return <span className="text-muted">–</span>;
  return <span className="text-emphasis">{/^\d+$/.test(value) ? value : t(value)}</span>;
}
