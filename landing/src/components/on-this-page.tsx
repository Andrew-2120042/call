"use client";

import { useEffect, useState } from "react";

/** Numbered table of contents that highlights the section being read and keeps it in view inside the list. */
export function OnThisPage({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const onScroll = () => {
      // The section whose heading most recently passed under the sticky header is the one being read.
      let current = items[0]?.id ?? "";
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top < 160) current = item.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  return (
    <nav aria-label="On this page" className="rounded-xl border border-line p-5">
      <p className="text-faint text-[12px] font-medium uppercase tracking-[0.14em]">On this page</p>
      <ol className="mt-3 max-h-[46vh] space-y-1 overflow-y-auto pr-1 text-[14px]">
        {items.map((item, i) => {
          const on = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={on ? "true" : undefined}
                className={`flex gap-2.5 rounded-md border-l-2 px-2 py-1.5 leading-snug transition ${
                  on ? "border-brand bg-surface text-fg" : "border-transparent text-muted hover:text-fg"
                }`}>
                <span className={`w-5 flex-none tabular-nums ${on ? "text-fg" : "text-faint"}`}>{String(i + 1).padStart(2, "0")}</span>
                <span>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
