"use client";

import Link from "next/link";
import { useRef } from "react";
import type { Audience } from "@/content/site-content";

/** "Who it's for" cards that scroll sideways, with arrows, in the spot where Apollo shows its customer stories. */
export function AudienceCarousel({ audiences }: { audiences: Audience[] }) {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (direction: 1 | -1) =>
    track.current?.scrollBy({ left: direction * (track.current.clientWidth * 0.8), behavior: "smooth" });

  return (
    <div>
      <div
        ref={track}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 [&::-webkit-scrollbar]:hidden">
        {audiences.map((audience, index) => (
          <Link
            key={audience.slug}
            href={`/for/${audience.slug}`}
            className="group flex w-[280px] shrink-0 snap-start flex-col justify-between rounded-xl border border-line bg-surface p-6 transition hover:border-line-strong sm:w-[300px]">
            <div>
              <span className="grid h-12 w-12 place-items-center rounded-full bg-raised text-sm font-medium text-fg/80">
                {audience.name.slice(0, 2)}
              </span>
              <p className="mt-5 text-lg font-medium tracking-tight">For {audience.plural}</p>
              <p className="text-muted mt-2 text-[13px] leading-relaxed">{audience.summary}</p>
            </div>
            <div className="mt-8 border-t border-line pt-4">
              <p className="text-faint font-mono text-[10px] uppercase tracking-[0.14em]">A day with it</p>
              <p className="text-muted mt-2 line-clamp-3 text-[12px] leading-relaxed">{audience.example}</p>
              <p className="mt-4 text-[13px] transition group-hover:text-fg text-muted">
                See how {index % 2 ? "it works" : "they use it"} <span aria-hidden>→</span>
              </p>
            </div>
          </Link>
        ))}
        <div className="flex w-[280px] shrink-0 snap-start flex-col justify-between rounded-xl border border-line bg-fg p-6 text-bg sm:w-[300px]">
          <p className="text-lg font-medium leading-snug">A cancelled slot is offered to the next person in line within seconds.</p>
          <p className="text-[64px] font-medium leading-none tracking-[-0.04em]">2 hrs</p>
          <p className="text-[12px] opacity-60">Default window for them to claim it before it moves on.</p>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        {([-1, 1] as const).map((direction) => (
          <button
            key={direction}
            type="button"
            onClick={() => scroll(direction)}
            aria-label={direction < 0 ? "Previous" : "Next"}
            className="grid h-9 w-9 place-items-center rounded-md border border-line-strong text-muted transition hover:bg-raised hover:text-fg">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d={direction < 0 ? "M8.5 3L4.5 7l4 4" : "M5.5 3l4 4-4 4"}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
