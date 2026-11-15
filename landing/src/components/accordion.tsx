"use client";

import { useState } from "react";

/** One-open-at-a-time list; the open item shows its description and a progress line. */
export function Accordion({ items }: { items: { title: string; body: string }[] }) {
  const [open, setOpen] = useState(0);
  return (
    <ul className="max-w-md">
      {items.map((item, i) => (
        <li key={item.title} className="border-b border-line">
          <button
            type="button"
            onClick={() => setOpen(i)}
            aria-expanded={open === i}
            className={`w-full py-4 text-left text-sm transition ${open === i ? "text-fg" : "text-faint hover:text-muted"}`}>
            {item.title}
          </button>
          {open === i && <p className="text-muted -mt-1 pb-4 text-sm leading-relaxed">{item.body}</p>}
        </li>
      ))}
    </ul>
  );
}
