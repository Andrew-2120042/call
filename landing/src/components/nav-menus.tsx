"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type MenuItem = { href: string; label: string; hint: string };
type MenuGroup = { label: string; items: MenuItem[] };

/** One shared "open" value, so hovering or focusing a menu always closes the other. */
export function NavMenus({ menus }: { menus: MenuGroup[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    const onClick = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div ref={root} className="flex items-center gap-6">
      {menus.map((menu) => {
        const isOpen = open === menu.label;
        return (
          <div key={menu.label} className="relative" onMouseEnter={() => setOpen(menu.label)} onMouseLeave={() => setOpen(null)}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : menu.label)}
              className={`flex items-center gap-1 py-4 text-[13px] transition ${isOpen ? "text-fg" : "text-muted hover:text-fg"}`}>
              {menu.label}
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className={`opacity-60 transition ${isOpen ? "rotate-180" : ""}`}>
                <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
              </svg>
            </button>
            <div
              className={`absolute left-1/2 top-full z-50 w-80 -translate-x-1/2 pt-1 transition ${
                isOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"
              }`}>
              <div className="rounded-2xl border border-line bg-card p-2 shadow-2xl shadow-black/10">
                {menu.items.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setOpen(null)} className="hover:bg-surface block rounded-xl px-3 py-2.5 transition">
                    <span className="block text-[13px] font-medium">{item.label}</span>
                    <span className="text-faint mt-0.5 block truncate text-xs">{item.hint}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
