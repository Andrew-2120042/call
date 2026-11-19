import Link from "next/link";
import type { ReactNode } from "react";

const STAGE_MARKERS = [
  { label: "Checking your calendar", className: "left-[6%] top-[9%]" },
  { label: "Offering a freed slot", className: "left-[44%] top-[5%]" },
  { label: "Reading a new request", className: "right-[5%] top-[14%]" },
  { label: "Sending reminders", className: "left-[3%] bottom-[30%]" },
  { label: "Confirming tomorrow", className: "right-[3%] bottom-[38%]" },
];

/** Labelled pulses around the hero stage, like the steps Apollo shows running across its product. */
export function StageMarkers() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden>
      {STAGE_MARKERS.map((marker, index) => (
        <span key={marker.label} className={`absolute flex items-center gap-3 ${marker.className}`}>
          <span className="relative grid h-9 w-9 place-items-center">
            <span className="stage-pulse absolute inset-0 rounded-full border border-black/25" style={{ animationDelay: `${index * 0.6}s` }} />
            <span className="h-2.5 w-2.5 rounded-full bg-black/80" />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-black/35">{marker.label}</span>
        </span>
      ))}
    </div>
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
        <h3 className="mt-3 max-w-[18ch] text-3xl font-normal leading-[1.1] tracking-[-0.025em] sm:text-[40px]">{title}</h3>
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
          className="mt-8 inline-flex h-10 items-center rounded-md border border-line-strong bg-white px-4 text-[13px] transition hover:bg-raised">
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
