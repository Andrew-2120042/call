import Link from "next/link";
import type { ReactNode } from "react";

/** Small pieces of a calendar set inside the hero headline, so the first thing people read looks like booking. */
export function FaceStack() {
  const faces = [
    { initials: "MA", tone: "bg-[#3a3a3a]" },
    { initials: "SL", tone: "bg-[#4a4a4a]" },
    { initials: "PN", tone: "bg-[#2e2e2e]" },
  ];
  return (
    <span className="mx-1 hidden translate-y-[-0.06em] items-center rounded-2xl border border-line-strong bg-surface px-2.5 py-2 align-middle sm:inline-flex">
      {faces.map((face, index) => (
        <span
          key={face.initials}
          className={`grid h-7 w-7 place-items-center rounded-full border-2 border-surface text-[10px] font-medium tracking-normal text-fg/80 sm:h-10 sm:w-10 sm:text-xs ${face.tone} ${index ? "-ml-2.5" : ""}`}>
          {face.initials}
        </span>
      ))}
    </span>
  );
}

export function ClockChip() {
  return (
    <span className="mx-1 inline-flex translate-y-[-0.06em] items-center gap-1.5 rounded-2xl border border-line-strong bg-surface px-2 py-1.5 align-middle sm:gap-2 sm:px-3 sm:py-2">
      <svg viewBox="0 0 40 40" className="h-7 w-7 sm:h-10 sm:w-10" aria-hidden>
        <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" />
        {Array.from({ length: 12 }, (_, i) => (
          <line
            key={i}
            x1="20"
            y1="4.5"
            x2="20"
            y2={i % 3 ? "6.5" : "8"}
            stroke="currentColor"
            strokeOpacity="0.55"
            strokeWidth="1.2"
            transform={`rotate(${i * 30} 20 20)`}
          />
        ))}
        <line x1="20" y1="20" x2="20" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="clock-hour" />
        <line x1="20" y1="20" x2="20" y2="7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" className="clock-minute" />
        <circle cx="20" cy="20" r="1.6" fill="currentColor" />
      </svg>
      <span className="text-faint text-[10px] font-semibold tracking-[0.08em] sm:text-xs">CAL</span>
    </span>
  );
}

export function BookedChip() {
  return (
    <span className="mx-1 inline-flex translate-y-[-0.2em] flex-col items-start rounded-xl border border-line-strong bg-surface px-2.5 py-1.5 align-middle text-left text-[10px] font-medium leading-tight tracking-normal sm:text-xs">
      <span className="text-fg">
        Intro call <span className="text-faint">30m</span>
      </span>
      <span className="booked-swap relative mt-0.5 block h-[1.25em] w-[5.5em] overflow-hidden">
        <span className="booked-a absolute inset-0 text-faint">9:30 AM</span>
        <span className="booked-b absolute inset-0 text-emerald-400">✓ Booked</span>
      </span>
    </span>
  );
}

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
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={`rounded-xl border border-line bg-surface p-5 sm:p-8 ${flip ? "lg:order-2" : ""}`} data-reveal>
        {visual}
      </div>
      <div className={flip ? "lg:order-1" : ""}>
        <p className="text-faint font-mono text-[11px] uppercase tracking-[0.14em]">{eyebrow}</p>
        <h3 className="mt-3 max-w-[18ch] text-3xl font-medium leading-[1.1] tracking-[-0.02em] sm:text-[40px]">{title}</h3>
        <p className="text-muted mt-4 max-w-[46ch] text-[15px] leading-relaxed">{body}</p>
        <ul className="mt-8 space-y-3">
          {points.map((point) => (
            <li key={point.title} className="flex gap-3 text-[14px]">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-fg/70" />
              <span>
                <span className="font-medium">{point.title}</span> <span className="text-muted">{point.body}</span>
              </span>
            </li>
          ))}
        </ul>
        <Link
          href={href}
          className="mt-8 inline-flex h-10 items-center rounded-md border border-line-strong px-4 text-[13px] transition hover:bg-raised">
          {cta}
        </Link>
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
