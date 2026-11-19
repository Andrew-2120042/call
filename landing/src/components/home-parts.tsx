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
          <p className="text-fg/75 mt-3 max-w-[48ch] text-[14px] leading-snug">{body}</p>
        </div>
        <div>
          <ul className="space-y-2.5">
            {points.map((point) => (
              <li key={point.title} className="flex gap-2.5 text-[13px] leading-snug">
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
            className="mt-6 inline-flex h-9 items-center rounded-md border border-fg bg-white px-4 text-[13px] transition hover:bg-surface">
            {cta}
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Line drawings for the three-part section: one per job the link does. */
export function JobIllustration({ kind }: { kind: "book" | "keep" | "fill" }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 160 110" className="text-fg/70 mx-auto h-28 w-auto" aria-hidden>
      {kind === "book" && (
        <g {...common}>
          <rect x="35" y="22" width="90" height="70" rx="8" />
          <path d="M35 40h90M58 14v14M102 14v14" />
          {[0, 1, 2, 3].map((col) =>
            [0, 1, 2].map((row) => (
              <rect key={`${col}-${row}`} x={46 + col * 19} y={48 + row * 13} width="12" height="8" rx="2" opacity={col === 2 && row === 1 ? 1 : 0.35} />
            ))
          )}
          <path d="M84 61l3 3 6-6" strokeWidth="1.8" />
        </g>
      )}
      {kind === "keep" && (
        <g {...common}>
          <path d="M80 16l36 13v24c0 22-15 36-36 43-21-7-36-21-36-43V29z" />
          <path d="M65 55l10 10 20-21" strokeWidth="1.8" />
          <path d="M30 96h100" opacity="0.35" />
        </g>
      )}
      {kind === "fill" && (
        <g {...common}>
          <rect x="30" y="30" width="44" height="22" rx="5" />
          <rect x="86" y="30" width="44" height="22" rx="5" strokeDasharray="4 4" />
          <rect x="30" y="62" width="44" height="22" rx="5" />
          <rect x="86" y="62" width="44" height="22" rx="5" />
          <path d="M108 20c14 0 22 6 22 14" opacity="0.5" />
          <path d="M126 30l4 4 4-4" opacity="0.5" />
          <circle cx="108" cy="41" r="3" fill="currentColor" />
        </g>
      )}
    </svg>
  );
}
