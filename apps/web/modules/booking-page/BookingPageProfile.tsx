"use client";

import { pageThemeStyle } from "@calcom/features/booking-page-theme/themes";
import { APP_NAME, WEBSITE_URL } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Icon } from "@calcom/ui/components/icon";
import classNames from "classnames";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

export type BookingPageService = {
  id: number;
  title: string;
  length: number;
  price: number;
  currency: string;
  requiresConfirmation: boolean;
};

type Props = {
  name: string;
  avatar: ReactNode;
  /** Sanitized HTML from the server (public page) or plain text (editor preview). */
  bio: { html: string } | { text: string } | null;
  services: BookingPageService[];
  themeId: string | null | undefined;
  buttonShape: string | null | undefined;
  brandingHidden: boolean;
  verifiedBadge?: ReactNode;
  banner?: ReactNode;
  empty?: ReactNode;
  /** Public page: real links. Editor preview: omitted, rows are inert. */
  linkFor?: (service: BookingPageService) => {
    href: Parameters<typeof Link>[0]["href"];
    onClick?: () => void;
    style?: CSSProperties;
  };
  compact?: boolean;
  className?: string;
};

export function formatServiceLine(
  service: BookingPageService,
  t: (key: string, o?: Record<string, unknown>) => string
) {
  const parts = [t("service_minutes", { count: service.length })];
  if (service.price > 0) {
    parts.push(
      new Intl.NumberFormat("en-US", { style: "currency", currency: service.currency || "usd" }).format(
        service.price / 100
      )
    );
  }
  return parts.join(", ");
}

/** The public booking page body, shared by the live page and the editor's phone preview. */
export function BookingPageProfile(props: Props) {
  const { t } = useLocale();
  const rowClass =
    "group relative block overflow-hidden bg-white px-5 pb-4 pt-4 text-left text-[#1b1a3a] shadow-[0_1px_0_rgba(27,26,58,.06),0_10px_26px_-20px_rgba(27,26,58,.7)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff5a36]";

  return (
    <div
      className={classNames(
        "sw-page",
        props.compact ? "px-3 pb-6 pt-6" : "min-h-[100dvh] px-4 pb-12 pt-10",
        props.className
      )}
      style={{
        ...pageThemeStyle(props.themeId, props.buttonShape),
        background: "var(--sw-bg)",
        color: "var(--sw-fg)",
      }}>
      <main className="mx-auto w-full max-w-[420px]">
        {props.banner}
        <header className="flex flex-col items-center text-center">
          <div className="overflow-hidden rounded-[26px] shadow-[0_14px_34px_-18px_rgba(27,26,58,.55)]">
            {props.avatar}
          </div>
          <h1
            className={classNames(
              "font-extrabold leading-[1.02] tracking-[-0.035em]",
              props.compact ? "mt-3 text-[22px]" : "mt-5 text-[32px]"
            )}
            data-testid="name-title">
            {props.name}
            {props.verifiedBadge}
          </h1>
          {props.bio && "html" in props.bio && props.bio.html && (
            // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized on the server (markdownToSafeHTML)
            <div
              className="wrap-break-word mt-2 max-w-[34ch] text-[15px] leading-relaxed [&_a]:underline"
              style={{ color: "var(--sw-soft)" }}
              dangerouslySetInnerHTML={{ __html: props.bio.html }}
            />
          )}
          {props.bio && "text" in props.bio && props.bio.text && (
            <p
              className={classNames(
                "mt-2 max-w-[34ch] whitespace-pre-line leading-relaxed",
                props.compact ? "text-[13px]" : "text-[15px]"
              )}
              style={{ color: "var(--sw-soft)" }}>
              {props.bio.text}
            </p>
          )}
        </header>

        <div
          className={classNames("grid gap-2.5", props.compact ? "mt-5" : "mt-8")}
          data-testid="event-types">
          {props.services.map((service) => {
            const link = props.linkFor?.(service);
            const body = (
              <>
                <span className="flex items-start justify-between gap-3">
                  <b className="text-[17px] font-bold leading-snug tracking-[-0.01em]">{service.title}</b>
                  <Icon
                    name="arrow-up-right"
                    className="mt-0.5 h-4 w-4 flex-none text-[#9b98b8] transition-colors group-hover:text-[#ff5a36]"
                  />
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[#6b6890]">
                  <span>{formatServiceLine(service, t)}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className={classNames(
                        "h-2 w-2 rounded-full",
                        service.requiresConfirmation ? "bg-[#ff5a36]" : "bg-[#1f9d74]"
                      )}
                    />
                    {service.requiresConfirmation
                      ? t("service_kind_request_long")
                      : t("service_kind_instant_long")}
                  </span>
                </span>
                {/* Duration bar: share of a two-hour block, so lengths read at a glance. */}
                <span className="mt-3 block h-1 w-full rounded-full bg-[#eceaf5]" aria-hidden>
                  <span
                    className="block h-1 rounded-full bg-[#1b1a3a]"
                    style={{ width: `${Math.max(8, Math.min(100, (service.length / 120) * 100))}%` }}
                  />
                </span>
              </>
            );
            return link ? (
              <Link
                key={service.id}
                href={link.href}
                prefetch={false}
                onClick={link.onClick}
                style={{ ...link.style, borderRadius: "var(--sw-radius)" }}
                className={rowClass}
                data-testid="event-type-link">
                {body}
              </Link>
            ) : (
              <div key={service.id} style={{ borderRadius: "var(--sw-radius)" }} className={rowClass}>
                {body}
              </div>
            );
          })}
        </div>

        {props.empty}

        {!props.brandingHidden && (
          <div className={classNames("text-center", props.compact ? "mt-6" : "mt-10")}>
            <a
              href={`${WEBSITE_URL}/?utm_source=profile_page&utm_medium=badge`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] font-medium"
              style={{ color: "var(--sw-soft)" }}
              data-testid="profile-branding">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff5a36]" />
              {t("booked_with_app", { appName: APP_NAME })}
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
