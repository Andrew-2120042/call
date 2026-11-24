"use client";

import { useId, useState } from "react";
import { signupUrl } from "@/site.config";

// The ways practitioners say they lose money (see MONEY-RESEARCH.md), each with what Calbee does about it.
const LEAKS = [
  {
    pain: "The whole day cancels",
    detail: "Four clients cancel the morning of. You prepared, you showed up, and you earned nothing.",
    fix: "Each freed time goes to the next person on your waitlist, who claims it in one click.",
    feature: "Waitlist",
  },
  {
    pain: "Waiting in an empty room",
    detail: "Fifteen minutes in an empty Zoom, then the hour is gone and you're left chasing them.",
    fix: "Clients confirm the day before. If they don't, you know in time to give the hour away.",
    feature: "Confirm-or-release",
  },
  {
    pain: "The client who cancels and vanishes",
    detail: "They cancel \"for now\" and you never hear from them again.",
    fix: "They're offered new times on the spot and rebook in one click.",
    feature: "Rebooking",
  },
  {
    pain: "The call that was never a fit",
    detail: "A too-easy link fills your week with people who weren't serious. They're the ones who ghost.",
    fix: "Questions, approvals and an AI read on every request, so you only say yes to real clients.",
    feature: "Approvals + AI",
  },
];

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

function Slider({ id, label, value, display, min, max, step, onChange }: { id: string; label: string; value: number; display: string; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <label className="grid gap-3" htmlFor={id}>
      <span className="flex items-baseline justify-between gap-4 text-[16px]">
        <span className="text-fg/80">{label}</span>
        <span className="font-semibold tabular-nums">{display}</span>
      </span>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[var(--color-brand)]" />
    </label>
  );
}

/** The leaks as rows of a statement (what it costs now, what Calbee does), then the reader's own yearly total. */
export function MoneyLeaks() {
  const [price, setPrice] = useState(120);
  const [lostPerWeek, setLostPerWeek] = useState(2);
  const id = useId();
  const yearly = price * lostPerWeek * 48;

  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-surface">
      <div className="hidden grid-cols-[1fr_1fr] border-b border-line text-[12px] font-medium uppercase tracking-[0.14em] md:grid">
        <p className="text-muted px-8 py-4">What happens now</p>
        <p className="text-brand border-l border-line px-8 py-4">With Calbee</p>
      </div>
      <ol>
        {LEAKS.map((leak, i) => (
          <li key={leak.pain} className="grid border-b border-line md:grid-cols-[1fr_1fr]">
            <div className="flex gap-5 px-6 py-7 sm:px-8">
              <span className="text-faint pt-1 font-mono text-[13px] tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <p className="font-serif text-[24px] leading-tight tracking-[-0.01em] sm:text-[26px]">{leak.pain}</p>
                <p className="text-fg/65 mt-2 text-[16px] leading-relaxed">{leak.detail}</p>
              </div>
            </div>
            <div className="flex flex-col justify-center gap-3 border-t border-line bg-bg/40 px-6 py-7 sm:px-8 md:border-t-0 md:border-l">
              <span className="text-brand w-fit rounded-full border border-current/30 px-2.5 py-0.5 text-[12px] font-medium">{leak.feature}</span>
              <p className="text-[17px] leading-relaxed">{leak.fix}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="grid gap-10 px-6 py-9 sm:px-8 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-0">
        <div className="grid gap-7 lg:pr-10">
          <p className="text-muted text-[12px] font-medium uppercase tracking-[0.14em]">Your numbers</p>
          <Slider id={`${id}-price`} label="Your price per session" value={price} display={money(price)} min={30} max={400} step={10} onChange={setPrice} />
          <Slider id={`${id}-lost`} label="Sessions cancelled late or missed, each week" value={lostPerWeek} display={String(lostPerWeek)} min={1} max={10} step={1} onChange={setLostPerWeek} />
          <p className="text-faint text-[13px]">Based on 48 working weeks. Nothing you enter leaves your browser.</p>
        </div>
        <div className="border-line lg:border-l lg:pl-10">
          <p className="text-fg/70 text-[16px]">Lost to empty slots each year</p>
          <p className="text-brand mt-1 font-serif text-[60px] leading-none tracking-[-0.03em] tabular-nums sm:text-[80px]">{money(yearly)}</p>
          <p className="mt-5 text-[17px] leading-relaxed">
            Win back half and that's <span className="font-semibold">{money(yearly / 2)}</span> a year. Calbee Pro costs $144.
          </p>
          <a href={signupUrl} className="bg-brand mt-6 inline-flex h-11 items-center rounded-md px-6 text-[15px] font-medium text-black transition hover:brightness-95">
            Start keeping it, free
          </a>
        </div>
      </div>
    </div>
  );
}
