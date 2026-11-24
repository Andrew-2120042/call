"use client";

import { useId, useState } from "react";
import { signupUrl } from "@/site.config";

// The four ways practitioners told us they lose money (see MONEY-RESEARCH.md), each with what fixes it.
const LEAKS = [
  {
    pain: "The whole day cancels",
    detail: "Four clients cancel the morning of. You prepared, you showed up, and you earned nothing.",
    fix: "The freed time goes straight to the next person on your waitlist, who claims it in one click.",
  },
  {
    pain: "Waiting in an empty room",
    detail: "Fifteen minutes in an empty Zoom, then the hour is gone and you're left chasing them.",
    fix: "Clients confirm the day before. If they don't, you know early and the time can go to someone else.",
  },
  {
    pain: "The client who cancels and vanishes",
    detail: "They cancel \"for now\" and you never hear from them again. One cancel becomes a lost client.",
    fix: "They're offered new times right away and rebook in one click. Pro nudges them again three days later.",
  },
  {
    pain: "The call that was never a fit",
    detail: "A too-easy link fills your week with people who weren't serious, and they're the ones who ghost.",
    fix: "Booking questions and approvals, with an AI read on every request, so you only say yes to real clients.",
  },
];

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

/** "Sound familiar?" pains, then a calculator that turns the reader's own numbers into a yearly loss. */
export function MoneyLeaks() {
  const [price, setPrice] = useState(120);
  const [lostPerWeek, setLostPerWeek] = useState(2);
  const id = useId();
  const yearly = price * lostPerWeek * 48;

  return (
    <div className="grid gap-16">
      <div className="grid gap-5 md:grid-cols-2">
        {LEAKS.map((leak) => (
          <div key={leak.pain} className="rounded-2xl border border-line bg-surface p-7 sm:p-8">
            <p className="font-serif text-[26px] leading-tight tracking-[-0.015em]">{leak.pain}</p>
            <p className="text-fg/70 mt-3 text-[17px] leading-relaxed">{leak.detail}</p>
            <p className="mt-5 border-t border-line pt-5 text-[16px] leading-relaxed">
              <span className="text-brand font-semibold">With Calbee: </span>
              {leak.fix}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-line bg-surface p-7 sm:p-10">
        <p className="text-muted text-[13px] font-medium uppercase tracking-[0.16em]">What it's costing you</p>
        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div className="grid gap-7">
            <label className="grid gap-3" htmlFor={`${id}-price`}>
              <span className="flex items-baseline justify-between text-[17px]">
                <span>Your price per session</span>
                <span className="font-semibold tabular-nums">{money(price)}</span>
              </span>
              <input id={`${id}-price`} type="range" min={30} max={400} step={10} value={price} onChange={(e) => setPrice(Number(e.target.value))} className="accent-[var(--color-brand)]" />
            </label>
            <label className="grid gap-3" htmlFor={`${id}-lost`}>
              <span className="flex items-baseline justify-between text-[17px]">
                <span>Sessions cancelled late or missed, per week</span>
                <span className="font-semibold tabular-nums">{lostPerWeek}</span>
              </span>
              <input id={`${id}-lost`} type="range" min={1} max={10} step={1} value={lostPerWeek} onChange={(e) => setLostPerWeek(Number(e.target.value))} className="accent-[var(--color-brand)]" />
            </label>
          </div>
          <div className="lg:border-l lg:border-line lg:pl-10">
            <p className="text-fg/70 text-[17px]">You lose about</p>
            <p className="text-brand mt-1 font-serif text-[64px] leading-none tracking-[-0.03em] tabular-nums sm:text-[84px]">{money(yearly)}</p>
            <p className="text-fg/70 mt-2 text-[17px]">a year to empty slots.</p>
            <p className="mt-6 text-[17px] leading-relaxed">
              Filling just half of them back is {money(yearly / 2)} a year. Pro is $144.
            </p>
            <a href={signupUrl} className="bg-brand mt-6 inline-flex h-11 items-center rounded-md px-6 text-[15px] font-medium text-black">
              Start keeping it, free
            </a>
          </div>
        </div>
        <p className="text-faint mt-8 text-[13px]">Based on 48 working weeks. Your numbers stay in your browser.</p>
      </div>
    </div>
  );
}
