import Link from "next/link";
import type { ReactNode } from "react";

/** A feature told Apollo-style: a grey stage with the product on one side, the words and a few points on the other. */
export function FeatureRow({
  eyebrow,
  title,
  body,
  points,
  href,
  cta,
  visual,
  flip,
}: {
  eyebrow: string;
  title: string;
  body: string;
  points: { title: string; body: string }[];
  href: string;
  cta: string;
  visual: ReactNode;
  flip?: boolean;
}) {
  return (
    <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
      <div className={`flex min-h-[420px] items-center rounded-lg bg-surface p-5 sm:p-10 ${flip ? "lg:order-2" : ""}`} data-reveal>
        <div className="w-full">{visual}</div>
      </div>
      <div className={`flex flex-col justify-between gap-10 py-2 ${flip ? "lg:order-1" : ""}`}>
        <div>
          <p className="text-faint font-mono text-[11px] uppercase tracking-[0.12em]">{eyebrow}</p>
          <h3 className="mt-3 max-w-[18ch] text-[30px] leading-[1.1] sm:text-[34px]">{title}</h3>
          <p className="text-fg/75 mt-4 max-w-[48ch] text-[17px] leading-relaxed">{body}</p>
        </div>
        <div>
          <ul className="space-y-2.5">
            {points.map((point) => (
              <li key={point.title} className="flex gap-2.5 text-[15px] leading-snug">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mt-[2px] shrink-0" aria-hidden>
                  <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>
                  <span className="font-medium underline decoration-fg/30 underline-offset-2">{point.title}</span>{" "}
                  <span className="text-fg/70">{point.body}</span>
                </span>
              </li>
            ))}
          </ul>
          <Link
            href={href}
            className="mt-6 inline-flex h-9 items-center rounded-md border border-fg bg-card px-4 text-[13px] transition hover:bg-surface">
            {cta}
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Line drawings for the three-part section: one per job the link does. */
/** A small slice of the real product for each job, so the section shows the work rather than describing it. */
export function JobVisual({ kind }: { kind: "book" | "keep" | "fill" }) {
  if (kind === "book") {
    return (
      <div className="rounded-xl border border-line-strong bg-card p-4 text-left text-[12px] shadow-xl shadow-black/20">
        <div className="flex items-center justify-between">
          <span className="font-medium">Intro call</span>
          <span className="text-faint">30 min</span>
        </div>
        <p className="text-faint mt-0.5">Thursday 22</p>
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          {["9:00am", "9:30am", "10:00am", "11:30am"].map((time) => (
            <span
              key={time}
              className={`rounded-md border px-2 py-1.5 text-center ${time === "10:00am" ? "border-fg bg-fg text-bg" : "border-line text-muted"}`}>
              {time}
            </span>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Booked, added to your calendar
        </p>
      </div>
    );
  }
  if (kind === "keep") {
    return (
      <div className="rounded-xl border border-line-strong bg-card p-4 text-left text-[12px] shadow-xl shadow-black/20">
        <p className="text-faint">Reminder · 24h before</p>
        <p className="mt-1 font-medium">See you tomorrow at 10:00am?</p>
        <div className="mt-3 flex gap-1.5">
          <span className="rounded-md bg-fg px-2.5 py-1.5 text-bg">I&apos;ll be there</span>
          <span className="text-muted rounded-md border border-line px-2.5 py-1.5">Release it</span>
        </div>
        <div className="mt-3 space-y-1.5 border-t border-line pt-3">
          {[
            ["Sam R.", "Confirmed"],
            ["Jordan B.", "Waiting"],
          ].map(([name, status]) => (
            <p key={name} className="flex justify-between">
              <span className="text-muted">{name}</span>
              <span className={status === "Confirmed" ? "text-emerald-400" : "text-amber-400"}>{status}</span>
            </p>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-line-strong bg-card p-4 text-left text-[12px] shadow-xl shadow-black/20">
      <p className="flex justify-between">
        <span className="font-medium">Thu 10:00am</span>
        <span className="text-amber-400 line-through decoration-amber-400/60">Cancelled</span>
      </p>
      <div className="mt-3 space-y-2">
        {[
          ["1", "Priya N.", "Offered"],
          ["2", "Tom R.", "Next"],
        ].map(([n, name, status]) => (
          <p key={name} className="flex items-center gap-2">
            <span className="text-faint grid h-4 w-4 place-items-center rounded-full border border-line text-[10px]">{n}</span>
            <span className="flex-1">{name}</span>
            <span className={status === "Offered" ? "text-accent" : "text-faint"}>{status}</span>
          </p>
        ))}
      </div>
      <p className="mt-3 flex items-center gap-1.5 border-t border-line pt-3 text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Priya claimed it, slot filled
      </p>
    </div>
  );
}
