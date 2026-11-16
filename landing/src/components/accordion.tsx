"use client";

import { useEffect, useState } from "react";

const STEP_MS = 6000;

/** One-open-at-a-time list that advances on its own; the open item shows a progress line, and clicking pins it. */
export function Accordion({ items }: { items: { title: string; body: string }[] }) {
  const [open, setOpen] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => setOpen((i) => (i + 1) % items.length), STEP_MS);
    return () => clearTimeout(timer);
  }, [open, paused, items.length]);

  return (
    <ul className="max-w-md">
      {items.map((item, i) => (
        <li key={item.title} className="relative border-b border-line">
          <button
            type="button"
            onClick={() => {
              setOpen(i);
              setPaused(true);
            }}
            aria-expanded={open === i}
            className={`w-full py-4 text-left text-sm transition ${open === i ? "text-fg" : "text-faint hover:text-muted"}`}>
            {item.title}
          </button>
          {open === i && (
            <>
              <p className="text-muted -mt-1 pb-4 text-sm leading-relaxed">{item.body}</p>
              <span
                key={`${i}-${paused}`}
                aria-hidden
                className={`bg-fg absolute -bottom-px left-0 h-px ${paused ? "w-full" : "accordion-progress"}`}
                style={{ animationDuration: `${STEP_MS}ms` }}
              />
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
