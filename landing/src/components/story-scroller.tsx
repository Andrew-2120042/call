"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

export type Story = {
  id: string;
  nav: string;
  /** Headline: the first part is bright, the rest muted. */
  lead: string;
  rest: string;
  visual: ReactNode;
  /** Each point shows a small panel of example lines above its text. */
  points: { title: string; body: string; demo?: string[] }[];
};

/** Sticky step list on the left; the active step follows whichever story is in view. */
export function StoryScroller({ stories }: { stories: Story[] }) {
  const [active, setActive] = useState(stories[0]?.id);
  const refs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-40% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    for (const el of Object.values(refs.current)) if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative grid gap-10 lg:grid-cols-[220px_1fr]">
      <nav className="hidden lg:block" aria-label="Steps">
        <ul className="sticky top-28 space-y-2 border-s border-line ps-5">
          {stories.map((s) => (
            <li key={s.id} className="relative">
              {active === s.id && <span className="absolute -start-[21px] top-0 h-full w-px bg-fg" />}
              <a
                href={`#${s.id}`}
                className={`block text-sm transition ${active === s.id ? "text-fg" : "text-faint hover:text-muted"}`}>
                {s.nav}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="space-y-28">
        {stories.map((s) => (
          <section
            key={s.id}
            id={s.id}
            ref={(el) => {
              refs.current[s.id] = el;
            }}
            className="scroll-mt-28">
            <h3 data-reveal className="max-w-[30ch] text-2xl font-normal leading-snug tracking-[-0.02em] sm:text-[28px]">
              {s.lead} <span className="text-faint">{s.rest}</span>
            </h3>
            <div data-reveal className="mt-8 rounded-2xl border border-line bg-gradient-to-b from-surface to-bg p-4 sm:p-8">{s.visual}</div>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {s.points.map((p) => (
                <div key={p.title}>
                  {p.demo && (
                    <div
                      data-reveal
                      aria-hidden
                      className="mb-5 flex h-36 flex-col items-center justify-center gap-2 rounded-xl border border-line bg-[radial-gradient(circle_at_1px_1px,var(--color-line)_1px,transparent_0)] bg-[length:14px_14px] p-5">
                      {p.demo.map((line, i) => (
                        <span
                          key={line}
                          className={`w-fit rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-xs shadow-lg shadow-black/40 ${i % 2 ? "translate-x-3 text-muted" : "-translate-x-3"}`}>
                          {line}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-sm font-medium">{p.title}</p>
                  <p className="text-muted mt-1.5 text-sm leading-relaxed">{p.body}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
