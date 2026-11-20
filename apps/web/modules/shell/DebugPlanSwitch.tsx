"use client";

import classNames from "@calcom/ui/classNames";
import { useEffect, useState } from "react";

type Plan = "FREE" | "PRO" | "TEAM";
const PLANS: { id: Plan; label: string }[] = [
  { id: "FREE", label: "Free" },
  { id: "PRO", label: "Pro" },
  { id: "TEAM", label: "Team" },
];

/** Dev-only: switch the signed-in account between plans to see what each one gets. */
export function DebugPlanSwitch() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/billing/plan")
      .then((res) => res.json())
      .then((summary: { plan?: Plan }) => setPlan(summary.plan ?? null))
      .catch(() => setPlan(null));
  }, []);

  const pick = async (next: Plan) => {
    setBusy(true);
    const res = await fetch("/api/debug/plan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan: next }),
    });
    // Plan checks happen on the server, so reload to see every page as that plan.
    if (res.ok) window.location.reload();
    else setBusy(false);
  };

  return (
    <div className="border-subtle bg-default fixed bottom-4 right-4 z-[60] flex items-center gap-1 rounded-lg border p-1 shadow-lg">
      <span className="text-subtle px-2 font-mono text-[10px] uppercase tracking-wider">Debug plan</span>
      {PLANS.map((item) => (
        <button
          key={item.id}
          type="button"
          disabled={busy}
          onClick={() => pick(item.id)}
          className={classNames(
            "rounded-md px-2.5 py-1 text-[12px] transition disabled:opacity-50",
            plan === item.id ? "bg-inverted text-inverted" : "text-default hover:bg-subtle"
          )}>
          {item.label}
        </button>
      ))}
    </div>
  );
}
