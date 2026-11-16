"use client";

import { type ReactNode, useEffect, useState } from "react";

const STEP_MS = 6000;

export type AccordionItem = { title: string; body: string; visual?: ReactNode };

/**
 * One-open-at-a-time list that advances on its own; the open item shows a progress line, and clicking pins it.
 * When items carry visuals, the open item's visual is shown beside the list.
 */
export function Accordion({ items, header }: { items: AccordionItem[]; header?: ReactNode }) {
  const [open, setOpen] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => setOpen((i) => (i + 1) % items.length), STEP_MS);
    return () => clearTimeout(timer);
  }, [open, paused, items.length]);

  const list = (
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

  const visual = items[open]?.visual;
  if (!visual && !header) return list;

  return (
    <div className="grid items-center gap-16 lg:grid-cols-2">
      <div>
        {header}
        <div className="mt-10">{list}</div>
      </div>
      {visual && (
        <div key={open} className="accordion-visual" aria-hidden>
          {visual}
        </div>
      )}
    </div>
  );
}
