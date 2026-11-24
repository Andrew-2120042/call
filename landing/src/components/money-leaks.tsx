"use client";

import { useId, useState } from "react";
import { signupUrl } from "@/site.config";

// The four leaks practitioners complain about most (see MONEY-RESEARCH.md), each with the Calbee feature that fixes it.
const LEAKS = [
  { pain: "The whole day cancels", fix: "Freed times go straight to your waitlist", feature: "Waitlist" },
  { pain: "Waiting in an empty Zoom", fix: "Clients confirm the day before, or the time frees up", feature: "Confirm-or-release" },
  { pain: "The client who cancels and vanishes", fix: "New times the moment they cancel, one click to rebook", feature: "Rebooking" },
  { pain: "The call that was never a fit", fix: "An AI read on every request before you say yes", feature: "Approvals" },
];

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

function Tick() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="text-brand mt-[3px] shrink-0" aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Four leaks as compact tiles, then a one-line calculator that turns the reader's own numbers into a yearly loss. */
export function MoneyLeaks() {
  const [price, setPrice] = useState(120);
  const [lostPerWeek, setLostPerWeek] = useState(2);
  const id = useId();
  const yearly = price * lostPerWeek * 48;

  return (
    <div className="grid gap-6">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {LEAKS.map((leak) => (
          <li key={leak.pain} className="flex flex-col rounded-2xl border border-line bg-surface p-6">
            <span className="text-faint text-[12px] font-medium uppercase tracking-[0.12em]">{leak.feature}</span>
            <p className="mt-3 mb-6 font-serif text-[22px] leading-[1.2] tracking-[-0.01em]">{leak.pain}</p>
            <p className="mt-auto flex gap-2 border-t border-line pt-4 text-[15px] leading-snug text-fg/85">
              <Tick />
              {leak.fix}
            </p>
          </li>
        ))}
      </ul>

      <div className="grid items-center gap-6 rounded-2xl border border-line bg-surface p-6 sm:p-7 lg:grid-cols-[1fr_1fr_auto] lg:gap-10">
        <label className="grid gap-2" htmlFor={`${id}-price`}>
          <span className="flex justify-between text-[14px]">
            <span className="text-fg/70">Price per session</span>
            <span className="font-semibold tabular-nums">{money(price)}</span>
          </span>
          <input id={`${id}-price`} type="range" min={30} max={400} step={10} value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full accent-[var(--color-brand)]" />
        </label>
        <label className="grid gap-2" htmlFor={`${id}-lost`}>
          <span className="flex justify-between text-[14px]">
            <span className="text-fg/70">Lost sessions a week</span>
            <span className="font-semibold tabular-nums">{lostPerWeek}</span>
          </span>
          <input id={`${id}-lost`} type="range" min={1} max={10} step={1} value={lostPerWeek} onChange={(e) => setLostPerWeek(Number(e.target.value))} className="w-full accent-[var(--color-brand)]" />
        </label>
        <div className="flex items-center justify-between gap-6 border-t border-line pt-5 lg:border-t-0 lg:border-l lg:pl-10 lg:pt-0">
          <div>
            <p className="text-fg/60 text-[13px]">Lost each year</p>
            <p className="text-brand font-serif text-[40px] leading-none tracking-[-0.02em] tabular-nums">{money(yearly)}</p>
          </div>
          <a href={signupUrl} className="bg-brand inline-flex h-10 shrink-0 items-center rounded-md px-5 text-[14px] font-medium text-black transition hover:brightness-95">
            Keep it
          </a>
        </div>
      </div>
    </div>
  );
}
