"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { type DocIcon, docSlug } from "@/content/docs";

const ICONS: Record<DocIcon, string> = {
  home: "M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5Z",
  rocket: "M5 15c-1.5 1.5-2 4-2 6 2 0 4.5-.5 6-2m-1-5 6-6c2-2 5-3 7-3 0 2-1 5-3 7l-6 6m-4-4 4 4m-4-4-3-.5 2.5-3 3.5.5m1 7 .5 3 3-2.5-.5-3.5",
  layers: "m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5",
  clock: "M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  queue: "M4 6h16M4 12h10M4 18h6m8-2 2 2 3-4",
  check: "m8 12.5 2.5 2.5L16 9.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  users: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm6.5 0a2.5 2.5 0 1 0 0-5M3.5 19a5.5 5.5 0 0 1 11 0M16 13.5a4.5 4.5 0 0 1 4.5 5",
  plug: "M9 3v5m6-5v5M6 8h12v3a6 6 0 0 1-12 0V8Zm6 9v4",
  code: "m8 8-4 4 4 4m8-8 4 4-4 4m-6 2 4-12",
  spark: "M12 3v4m0 10v4M3 12h4m10 0h4M6 6l2.5 2.5m7 7L18 18M6 18l2.5-2.5m7-7L18 6",
  help: "M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14m0 3h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  book: "M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5v-15Zm0 15A1.5 1.5 0 0 0 6.5 21H19",
  list: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01",
};

function Icon({ name }: { name: DocIcon }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="flex-none">
      <path d={ICONS[name]} />
    </svg>
  );
}

export type NavPage = { href: string; title: string; icon: DocIcon; headings: string[]; text: string };

/** The sidebar shared by the docs and the guides: brand, back link, search, page list with on-page sections, help. */
export function SideNav({
  pages,
  label,
  homeHref,
  siteName,
  supportEmail,
}: {
  pages: NavPage[];
  /** Shown after the brand, e.g. "docs" or "guides". */
  label: string;
  homeHref: string;
  siteName: string;
  supportEmail: string;
}) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter((p) => p.title.toLowerCase().includes(q) || p.text.includes(q));
  }, [pages, query]);

  return (
    <>
      <div className="flex items-center justify-between border-b border-line px-4 py-3 lg:hidden">
        <Link href={homeHref} className="flex items-center gap-2 text-[13px] font-semibold">
          <Mark /> {siteName} {label}
        </Link>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="text-muted rounded-md border border-line px-2.5 py-1 text-xs">
          {open ? "Close" : "Menu"}
        </button>
      </div>
      <aside
        className={`${open ? "block" : "hidden"} border-b border-line lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-60 lg:flex-none lg:flex-col lg:border-b-0 lg:border-r`}>
        <div className="hidden px-4 pt-5 lg:block">
          <Link href={homeHref} className="flex items-center gap-2 text-[13px] font-semibold">
            <Mark /> {siteName} {label}
          </Link>
        </div>
        <div className="px-3 pt-4">
          <Link href="/" className="text-faint hover:text-muted flex items-center gap-1.5 px-1 text-xs transition">
            <span aria-hidden>←</span> Back to site
          </Link>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${label}`}
            aria-label={`Search ${label}`}
            className="placeholder:text-faint mt-3 w-full rounded-md border border-line bg-surface px-2.5 py-1.5 text-xs outline-none focus:border-line-strong"
          />
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label={label}>
          <ul className="space-y-0.5">
            {shown.map((p) => {
              const active = p.href === pathname;
              return (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition ${active ? "bg-raised text-fg" : "text-muted hover:bg-surface hover:text-fg"}`}>
                    <Icon name={p.icon} />
                    {p.title}
                  </Link>
                  {active && p.headings.length > 0 && (
                    <ul className="mb-2 mt-1 space-y-0.5 border-s border-line ms-[15px] ps-3">
                      {p.headings.map((h) => (
                        <li key={h}>
                          <a href={`#${docSlug(h)}`} className="text-faint hover:text-muted block py-0.5 text-[11px] transition">
                            {h}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
            {shown.length === 0 && <li className="text-faint px-2 py-1.5 text-xs">Nothing matches “{query}”.</li>}
          </ul>
        </nav>
        <div className="border-t border-line px-4 py-3 text-[11px]">
          <p className="text-muted">Need help?</p>
          <a href={`mailto:${supportEmail}`} className="text-faint hover:text-muted transition">
            {supportEmail}
          </a>
        </div>
      </aside>
    </>
  );
}

function Mark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="currentColor" />
      <path d="M7.5 12.5l3 3 6-6.5" stroke="var(--color-bg)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
