"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Icon } from "@calcom/ui/components/icon";
import { Logo } from "@calcom/ui/components/logo";
import { headingFont } from "@lib/headingFont";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type State = "checking" | "active" | "pending" | "failed";
type Summary = { plan: "FREE" | "PRO" | "TEAM"; onTrial?: boolean };

// Webhooks can land a few seconds after the redirect; keep checking for about half a minute.
const POLL_MS = 3000;
const POLL_TRIES = 10;

const UNLOCKED = ["upgrade_success_p1", "upgrade_success_p2", "upgrade_success_p3", "upgrade_success_p4"];

/** Where checkout sends people back: confirms the payment and says plainly what they now have. */
export default function UpgradeSuccessView() {
  const { t } = useLocale();
  const params = useSearchParams();
  const subscriptionId = params?.get("subscription_id") ?? null;
  const failedAtProvider = params?.get("status") === "failed";
  const [state, setState] = useState<State>(failedAtProvider ? "failed" : "checking");
  const [plan, setPlan] = useState<Summary["plan"]>("PRO");
  const started = useRef(false);

  useEffect(() => {
    // Strict mode runs effects twice in development; one confirmation is enough.
    if (failedAtProvider || started.current) return;
    started.current = true;
    let cancelled = false;
    const isPaid = (summary: Summary) => summary.plan !== "FREE" && !summary.onTrial;

    const run = async () => {
      if (subscriptionId) {
        const res = await fetch("/api/billing/confirm", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ subscriptionId }),
        });
        const json = await res.json().catch(() => null);
        if (res.ok && json?.summary && isPaid(json.summary)) {
          if (!cancelled) {
            setPlan(json.summary.plan);
            setState("active");
          }
          return;
        }
      }
      for (let i = 0; i < POLL_TRIES && !cancelled; i++) {
        const summary: Summary = await fetch("/api/billing/plan").then((r) => r.json());
        if (isPaid(summary)) {
          setPlan(summary.plan);
          setState("active");
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_MS));
      }
      if (!cancelled) setState("pending");
    };
    run().catch(() => !cancelled && setState("pending"));
    return () => {
      cancelled = true;
    };
  }, [subscriptionId, failedAtProvider]);

  const planName = t(`billing_plan_${plan.toLowerCase()}`);

  return (
    <div className="bg-default text-default flex min-h-screen flex-col" data-testid="upgrade-success">
      <header className="flex h-14 items-center px-5 md:px-8">
        <Logo small />
      </header>
      <main className="flex flex-1 items-center justify-center px-5 pb-16">
        <div className="w-full max-w-[460px] text-center">
          {state === "checking" && (
            <>
              <Icon name="loader" className="text-subtle mx-auto h-6 w-6 animate-spin" />
              <p className="text-subtle mt-4 text-[14px]">{t("upgrade_success_checking")}</p>
            </>
          )}

          {state === "active" && (
            <>
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-500/15 text-emerald-400">
                <Icon name="check" className="h-6 w-6" />
              </span>
              <h1 className={`${headingFont.className} text-emphasis mt-5 text-[34px] leading-tight`}>
                {t("upgrade_success_heading", { plan: planName })}
              </h1>
              <p className="text-subtle mt-2 text-[14px] leading-relaxed">{t("upgrade_success_body")}</p>
              <ul className="border-subtle mx-auto mt-6 space-y-2.5 border-t pt-5 text-left text-[14px]">
                {UNLOCKED.map((key) => (
                  <li key={key} className="flex items-start gap-2.5">
                    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    {t(key)}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex justify-center gap-2">
                <Link
                  href="/waitlist"
                  className="border-subtle text-default hover:bg-subtle inline-flex h-10 items-center rounded-md border px-4 text-[14px]">
                  {t("upgrade_success_waitlist")}
                </Link>
                <Link
                  href="/home"
                  className="bg-inverted text-inverted inline-flex h-10 items-center rounded-md px-5 text-[14px] font-medium">
                  {t("upgrade_success_home")}
                </Link>
              </div>
              <p className="text-subtle mt-6 text-[12px]">{t("upgrade_success_receipt")}</p>
            </>
          )}

          {state === "pending" && (
            <>
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-amber-500/15 text-amber-400">
                <Icon name="clock" className="h-6 w-6" />
              </span>
              <h1 className={`${headingFont.className} text-emphasis mt-5 text-[30px] leading-tight`}>
                {t("upgrade_pending_heading")}
              </h1>
              <p className="text-subtle mt-2 text-[14px] leading-relaxed">{t("upgrade_pending_body")}</p>
              <div className="mt-8 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="border-subtle text-default hover:bg-subtle h-10 rounded-md border px-4 text-[14px]">
                  {t("upgrade_pending_check")}
                </button>
                <Link
                  href="/home"
                  className="bg-inverted text-inverted inline-flex h-10 items-center rounded-md px-5 text-[14px] font-medium">
                  {t("upgrade_success_home")}
                </Link>
              </div>
            </>
          )}

          {state === "failed" && (
            <>
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-500/15 text-red-400">
                <Icon name="x" className="h-6 w-6" />
              </span>
              <h1 className={`${headingFont.className} text-emphasis mt-5 text-[30px] leading-tight`}>
                {t("upgrade_failed_heading")}
              </h1>
              <p className="text-subtle mt-2 text-[14px] leading-relaxed">{t("upgrade_failed_body")}</p>
              <div className="mt-8 flex justify-center gap-2">
                <Link
                  href="/home"
                  className="border-subtle text-default hover:bg-subtle inline-flex h-10 items-center rounded-md border px-4 text-[14px]">
                  {t("upgrade_success_home")}
                </Link>
                <Link
                  href="/upgrade"
                  className="bg-inverted text-inverted inline-flex h-10 items-center rounded-md px-5 text-[14px] font-medium">
                  {t("upgrade_failed_retry")}
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
