"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Icon } from "@calcom/ui/components/icon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

export function NotFound(_props: { host: string }) {
  const { t } = useLocale();
  const pathname = usePathname() ?? "";
  const isBooking = pathname.startsWith("/booking");

  useLayoutEffect(() => {
    // Embeds read this to tell their host page the booking page wasn't found.
    window.CalComPageStatus = "404";
  }, []);

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cal-muted px-4 text-emphasis"
      data-testid="404-page">
      <main
        className="w-full bg-default text-center"
        style={{
          maxWidth: 440,
          padding: "44px 32px 36px",
          borderRadius: 28,
          border: "1px solid var(--cal-border-subtle)",
        }}>
        <span
          className="mx-auto grid place-items-center bg-subtle"
          style={{ width: 56, height: 56, borderRadius: 18 }}>
          <Icon name={isBooking ? "calendar-x-2" : "map"} className="h-6 w-6" />
        </span>
        <p className="mt-5 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
          {t("error_404")}
        </p>
        <h1 className="mt-2 text-[23px] font-bold leading-tight tracking-[-0.02em]">
          {isBooking ? t("not_found_booking_title") : t("not_found_title")}
        </h1>
        <p className="mx-auto mt-2 max-w-[32ch] text-[14px] leading-relaxed text-subtle">
          {isBooking ? t("not_found_booking_body") : t("not_found_body")}
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex items-center justify-center bg-inverted font-semibold text-inverted transition hover:opacity-90"
          style={{ height: 46, padding: "0 22px", borderRadius: 999, columnGap: 8, fontSize: 13.5 }}>
          <Icon name="arrow-left" className="h-4 w-4" />
          {t("go_back_home")}
        </Link>
      </main>
    </div>
  );
}
