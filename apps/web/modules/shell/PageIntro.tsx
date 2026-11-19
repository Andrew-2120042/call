"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import type { IconName } from "@calcom/ui/components/icon";
import { Icon } from "@calcom/ui/components/icon";
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

const TONES = {
  amber: "border-amber-400/40 bg-amber-400/15 text-amber-100",
  sky: "border-sky-400/40 bg-sky-400/15 text-sky-100",
  emerald: "border-emerald-400/40 bg-emerald-400/15 text-emerald-100",
  none: "border-white/25 bg-white/10 text-white",
};

/** The first time someone opens a section, a short card says what it's for and what they can do there. */
export function PageIntro() {
  const { t } = useLocale();
  const pathname = usePathname() ?? "";
  const [intro, setIntro] = useState<Intro | null>(null);

  useEffect(() => {
    const match = INTROS.find((item) => item.match(pathname));
    if (!match) return setIntro(null);
    // Automated browsers (our own test runs) would get stuck behind it, unless they ask for it.
    const automated =
      typeof navigator !== "undefined" && navigator.webdriver && !window.location.search.includes("intro=1");
    if (automated || readSeen().includes(match.id)) return setIntro(null);
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
        className="bg-default border-subtle relative w-full max-w-[460px] overflow-hidden rounded-xl border shadow-2xl">
        <button
          type="button"
          onClick={dismiss}
          aria-label={t("close")}
          className="absolute right-3 top-3 z-10 grid h-7 w-7 place-items-center rounded-md text-white/80 hover:bg-white/10 hover:text-white">
          <Icon name="x" className="h-4 w-4" />
        </button>
        <div className="relative flex h-44 items-center justify-center bg-[linear-gradient(135deg,#2f3f72_0%,#56478a_50%,#24595e_100%)]">
          <div className="flex flex-col items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-lg border border-white/25 bg-white/10 text-white">
              <Icon name={intro.icon} className="h-5 w-5" />
            </span>
            <div className="flex flex-wrap justify-center gap-1.5 px-6">
              {intro.chips.map((chip) => (
                <span
                  key={chip.textKey}
                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] backdrop-blur ${TONES[chip.tone ?? "none"]}`}>
                  <Icon name={chip.icon} className="h-3 w-3" />
                  {t(chip.textKey)}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 pb-5 pt-5">
          <h2 id="page-intro-title" className="text-emphasis text-[17px] font-semibold tracking-[-0.01em]">
            {t(key("title"))}
          </h2>
          <p className="text-subtle mt-1.5 text-[13px] leading-relaxed">{t(key("body"))}</p>
          <p className="text-emphasis mt-4 text-[12px] font-medium">{t("intro_you_can")}</p>
          <ul className="mt-2 space-y-2">
            {intro.points.map((point) => (
              <li key={point.key} className="text-default flex items-start gap-2.5 text-[13px]">
                <Icon name={point.icon} className="text-subtle mt-0.5 h-4 w-4 shrink-0" />
                {t(point.key)}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex justify-end gap-2">
            {intro.cta ? (
              <>
                <button
                  type="button"
                  onClick={dismiss}
                  className="border-subtle text-default hover:bg-subtle h-8 rounded-md border px-3 text-[13px]">
                  {t("intro_maybe_later")}
                </button>
                <Link
                  href={intro.cta.href}
                  onClick={dismiss}
                  className="bg-inverted text-inverted inline-flex h-8 items-center rounded-md px-3 text-[13px] font-medium">
                  {t(intro.cta.key)}
                </Link>
              </>
            ) : (
              <button
                type="button"
                onClick={dismiss}
                data-testid="page-intro-ok"
                className="bg-inverted text-inverted h-8 rounded-md px-4 text-[13px] font-medium">
                {t("intro_got_it")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
