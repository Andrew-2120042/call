"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const QUESTION_COUNT = 9;

const SCREENS: { href: string; label: string }[] = [
  { href: "/onboarding/getting-started", label: "How you'll use it" },
  { href: "/onboarding/personal/settings", label: "Your details" },
  ...Array.from({ length: QUESTION_COUNT }, (_, i) => ({
    href: `/onboarding/personal/questions?q=${i}`,
    label: `Question ${i + 1}`,
  })),
  { href: "/onboarding/personal/calendar", label: "Calendar" },
];

/** Dev-only: jump back and forth through every onboarding screen without filling anything in. */
export function OnboardingDebugNav() {
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const q = searchParams?.get("q") ?? "0";
  const current = SCREENS.findIndex((screen) => {
    const [path, query] = screen.href.split("?");
    if (path !== pathname) return false;
    return !query || query === `q=${q}`;
  });
  const prev = current > 0 ? SCREENS[current - 1] : null;
  const next = current >= 0 && current < SCREENS.length - 1 ? SCREENS[current + 1] : null;

  const button = "rounded-md px-2.5 py-1 text-[12px] transition";
  return (
    <div className="border-subtle bg-default fixed bottom-4 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-1 rounded-lg border p-1 shadow-lg">
      <span className="text-subtle px-2 font-mono text-[10px] uppercase tracking-wider">Debug</span>
      {prev ? (
        <Link href={prev.href} className={`${button} text-default hover:bg-subtle`}>
          ← {prev.label}
        </Link>
      ) : (
        <span className={`${button} text-muted`}>←</span>
      )}
      <span className="text-emphasis px-2 text-[12px] font-medium">
        {current >= 0 ? `${current + 1}/${SCREENS.length}` : "?"}
      </span>
      {next ? (
        <Link href={next.href} className={`${button} text-default hover:bg-subtle`}>
          {next.label} →
        </Link>
      ) : (
        <span className={`${button} text-muted`}>→</span>
      )}
    </div>
  );
}
