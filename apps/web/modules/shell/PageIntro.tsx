"use client";

import { DOCS_URL } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import type { IconName } from "@calcom/ui/components/icon";
import { Icon } from "@calcom/ui/components/icon";
import { headingFont } from "@lib/headingFont";
import { useLockBodyScroll } from "@lib/hooks/useLockBodyScroll";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Intro = {
  id: string;
  match: (path: string) => boolean;
  icon: IconName;
  chips: { icon: IconName; textKey: string; tone?: "amber" | "sky" | "emerald" }[];
  points: { icon: IconName; key: string }[];
  cta?: { key: string; href: string };
};

// One short explainer per section, shown the first time someone opens it (like Apollo does).
const INTROS: Intro[] = [
  {
    id: "home",
    match: (path) => path === "/home",
    icon: "calendar",
    chips: [
      { icon: "check", textKey: "intro_home_chip_booked", tone: "emerald" },
      { icon: "clock", textKey: "intro_home_chip_request", tone: "amber" },
      { icon: "users", textKey: "intro_home_chip_waiting", tone: "sky" },
    ],
    points: [
      { icon: "calendar", key: "intro_home_p1" },
      { icon: "eye", key: "intro_home_p2" },
      { icon: "plus", key: "intro_home_p3" },
    ],
  },
  {
    id: "services",
    match: (path) => path.startsWith("/event-types"),
    icon: "link",
    chips: [
      { icon: "clock", textKey: "intro_services_chip_1" },
      { icon: "clock", textKey: "intro_services_chip_2" },
      { icon: "link", textKey: "intro_services_chip_3" },
    ],
    points: [
      { icon: "link", key: "intro_services_p1" },
      { icon: "user-check", key: "intro_services_p2" },
      { icon: "eye-off", key: "intro_services_p3" },
    ],
  },
  {
    id: "bookings",
    match: (path) => path.startsWith("/bookings"),
    icon: "book-open",
    chips: [
      { icon: "clock", textKey: "intro_bookings_chip_1", tone: "amber" },
      { icon: "check", textKey: "intro_bookings_chip_2", tone: "emerald" },
      { icon: "x", textKey: "intro_bookings_chip_3" },
    ],
    points: [
      { icon: "user-check", key: "intro_bookings_p1" },
      { icon: "repeat", key: "intro_bookings_p2" },
      { icon: "message-circle", key: "intro_bookings_p3" },
    ],
  },
  {
    id: "availability",
    match: (path) => path.startsWith("/availability"),
    icon: "clock",
    chips: [
      { icon: "clock", textKey: "intro_availability_chip_1" },
      { icon: "clock", textKey: "intro_availability_chip_2" },
      { icon: "x", textKey: "intro_availability_chip_3" },
    ],
    points: [
      { icon: "clock", key: "intro_availability_p1" },
      { icon: "calendar", key: "intro_availability_p2" },
      { icon: "layers", key: "intro_availability_p3" },
    ],
  },
  {
    id: "waitlist",
    match: (path) => path.startsWith("/waitlist"),
    icon: "users",
    chips: [
      { icon: "users", textKey: "intro_waitlist_chip_1", tone: "sky" },
      { icon: "x", textKey: "intro_waitlist_chip_2" },
      { icon: "check", textKey: "intro_waitlist_chip_3", tone: "emerald" },
    ],
    points: [
      { icon: "users", key: "intro_waitlist_p1" },
      { icon: "mail", key: "intro_waitlist_p2" },
      { icon: "x", key: "intro_waitlist_p3" },
    ],
    cta: { key: "intro_waitlist_cta", href: "/event-types" },
  },
  {
    id: "teams",
    match: (path) => path.startsWith("/teams"),
    icon: "users",
    chips: [
      { icon: "repeat", textKey: "intro_teams_chip_1" },
      { icon: "users", textKey: "intro_teams_chip_2" },
      { icon: "link", textKey: "intro_teams_chip_3" },
    ],
    points: [
      { icon: "repeat", key: "intro_teams_p1" },
      { icon: "users", key: "intro_teams_p2" },
      { icon: "link", key: "intro_teams_p3" },
    ],
  },
  {
    id: "apps",
    match: (path) => path.startsWith("/apps"),
    icon: "grid-3x3",
    chips: [
      { icon: "calendar", textKey: "intro_apps_chip_1" },
      { icon: "video", textKey: "intro_apps_chip_2" },
      { icon: "check", textKey: "intro_apps_chip_3", tone: "emerald" },
    ],
    points: [
      { icon: "calendar", key: "intro_apps_p1" },
      { icon: "video", key: "intro_apps_p2" },
      { icon: "settings", key: "intro_apps_p3" },
    ],
  },
];

const STORAGE_KEY = "nodslot-intros-seen";

function readSeen(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function markSeen(id: string) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(new Set([...readSeen(), id]))));
  } catch {
    // Private windows can block storage; the intro then simply shows again next time.
  }
}

// Where "Learn more" goes for each section.
const DOCS_PAGE: Record<string, string> = {
  home: "",
  services: "/services",
  bookings: "/get-started",
  availability: "/availability",
  waitlist: "/waitlist",
  teams: "/teams",
  apps: "/integrations",
};

// Made-up times for the little preview at the top, so the rows read like the real page.
const PREVIEW_TIMES = ["Today, 10:00am", "Today, 2:30pm", "Tomorrow, 9:00am"];

const TONES = {
  amber: "bg-amber-400",
  sky: "bg-sky-400",
  emerald: "bg-emerald-400",
  none: "bg-gray-400",
};

/** The first time someone opens a section, a short card says what it's for and what they can do there. */
export function PageIntro() {
  const { t } = useLocale();
  const pathname = usePathname() ?? "";
  const [intro, setIntro] = useState<Intro | null>(null);
  useLockBodyScroll(!!intro);

  useEffect(() => {
    const match = INTROS.find((item) => item.match(pathname));
    if (!match) return setIntro(null);
    // ?intro=1 shows it again on purpose (to preview it), even if it was already seen.
    const forced = window.location.search.includes("intro=1");
    // Automated browsers (our own test runs) would get stuck behind it, unless they ask for it.
    const automated = typeof navigator !== "undefined" && navigator.webdriver && !forced;
    if (automated || (!forced && readSeen().includes(match.id))) return setIntro(null);
    setIntro(match);
  }, [pathname]);

  useEffect(() => {
    if (!intro) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && dismiss();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!intro) return null;
  const dismiss = () => {
    markSeen(intro.id);
    setIntro(null);
  };
  const key = (suffix: string) => `intro_${intro.id}_${suffix}`;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" data-testid="page-intro">
      <button
        type="button"
        aria-label={t("close")}
        className="absolute inset-0 bg-black/60"
        onClick={dismiss}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="page-intro-title"
        className="bg-default border-subtle relative w-full max-w-[440px] overflow-hidden rounded-2xl border shadow-2xl">
        <button
          type="button"
          onClick={dismiss}
          aria-label={t("close")}
          className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-white hover:bg-black">
          <Icon name="x" className="h-4 w-4" />
        </button>
        {/* A small picture of the page itself, the way the website shows the product, instead of an icon. */}
        <div className="relative flex h-44 items-end justify-center overflow-hidden bg-[#dfe8f7] px-8 pt-6">
          <div className="w-full max-w-[330px] translate-y-3 rounded-t-xl border border-black/10 bg-white text-left text-[12px] text-[#1f1f1f] shadow-xl">
            <div className="flex items-center gap-1.5 border-b border-black/10 px-3.5 py-2.5">
              <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
              <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
              <span className="h-2 w-2 rounded-full bg-[#28c840]" />
              <span className="ml-2 font-medium">{t(`intro_${intro.id}_tag`)}</span>
            </div>
            <ul className="divide-y divide-black/5">
              {intro.chips.map((chip, index) => (
                <li key={chip.textKey} className="flex items-center gap-3 px-3.5 py-2.5">
                  <span className="grid h-6 w-6 flex-none place-items-center rounded-md bg-black/5">
                    <Icon name={chip.icon} className="h-3.5 w-3.5 text-black/60" />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{t(chip.textKey)}</span>
                  <span className="flex flex-none items-center gap-1.5 text-[11px] text-black/50">
                    <span className={`h-1.5 w-1.5 rounded-full ${TONES[chip.tone ?? "none"]}`} />
                    {PREVIEW_TIMES[index % PREVIEW_TIMES.length]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="px-6 pb-5 pt-5">
          <span className="inline-block rounded-md bg-[#2f5bff]/15 px-2 py-0.5 text-[12px] font-medium text-[#7aa2ff]">
            {t(`intro_${intro.id}_tag`)}
          </span>
          <h2
            id="page-intro-title"
            className={`${headingFont.className} text-emphasis mt-2.5 text-[24px] font-normal leading-tight tracking-[-0.01em]`}>
            {t(key("title"))}
          </h2>
          <p className="text-subtle mt-1.5 text-[13px] leading-relaxed">{t(key("body"))}</p>
          <ul className="mt-3 space-y-1.5">
            {intro.points.map((point) => (
              <li key={point.key} className="text-default flex items-start gap-2.5 text-[13px] leading-snug">
                <Icon name="check" className="text-subtle mt-0.5 h-3.5 w-3.5 shrink-0" />
                {t(point.key)}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-center justify-between gap-2">
            <a
              href={`${DOCS_URL}${DOCS_PAGE[intro.id] ?? ""}`}
              target="_blank"
              rel="noreferrer"
              className="text-subtle hover:text-emphasis inline-flex items-center gap-1.5 text-[13px]">
              {t("intro_learn_more")}
              <Icon name="arrow-up-right" className="h-3.5 w-3.5" />
            </a>
            <div className="flex gap-2">
              {intro.cta ? (
                <>
                  <button
                    type="button"
                    onClick={dismiss}
                    className="border-subtle text-default hover:bg-subtle h-9 rounded-md border px-3.5 text-[13px]">
                    {t("intro_maybe_later")}
                  </button>
                  <Link
                    href={intro.cta.href}
                    onClick={dismiss}
                    className="bg-inverted text-inverted inline-flex h-9 items-center rounded-md px-4 text-[13px] font-medium">
                    {t(intro.cta.key)}
                  </Link>
                </>
              ) : (
                <button
                  type="button"
                  onClick={dismiss}
                  data-testid="page-intro-ok"
                  className="bg-inverted text-inverted h-9 rounded-md px-4 text-[13px] font-medium">
                  {t("intro_got_it")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
