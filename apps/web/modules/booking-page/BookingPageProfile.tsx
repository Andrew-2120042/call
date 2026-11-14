"use client";

import { pageLookStyle } from "@calcom/features/booking-page-theme/themes";
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
  pageStyle?: unknown;
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

const ROW_STYLE = {
  borderRadius: "var(--sw-radius)",
  background: "var(--sw-btn-bg)",
  color: "var(--sw-btn-fg)",
  borderColor: "var(--sw-btn-border)",
} as const;

/** The public booking page body, shared by the live page and the editor's phone preview. */
export function BookingPageProfile(props: Props) {
  const { t } = useLocale();
  const rowClass =
    "group flex items-center justify-between gap-4 border px-5 py-4 text-left transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#121212]";

  return (
    <div
      className={classNames(
        "sw-page",
        props.compact ? "px-3 pb-6 pt-6" : "min-h-[100dvh] px-4 pb-12 pt-10",
        props.className
      )}
      style={{
        ...pageLookStyle(props.themeId, props.buttonShape, props.pageStyle),
        fontFamily: "var(--sw-font)",
        background: "var(--sw-bg)",
        color: "var(--sw-fg)",
      }}>
      <main className="mx-auto w-full max-w-[420px]">
        {props.banner}
        <header className="flex flex-col items-center text-center">
          <div className="overflow-hidden rounded-full ring-4 ring-white">{props.avatar}</div>
          <h1
            className={classNames(
              "font-bold leading-tight tracking-[-0.02em]",
              props.compact ? "mt-3 text-[20px]" : "mt-4 text-[28px]"
            )}
            style={{ color: "var(--sw-title)" }}
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
                <span className="min-w-0">
                  <span className="block truncate text-[16px] font-semibold leading-snug">
                    {service.title}
                  </span>
                  <span className="mt-0.5 block text-[13px] opacity-70">
                    {formatServiceLine(service, t)}
                    {" · "}
                    {service.requiresConfirmation
                      ? t("service_kind_request_long")
                      : t("service_kind_instant_long")}
                  </span>
                </span>
                <Icon
                  name="chevron-right"
                  className="h-4 w-4 flex-none opacity-50 transition-transform group-hover:translate-x-0.5"
                />
              </>
            );
            return link ? (
              <Link
                key={service.id}
                href={link.href}
                prefetch={false}
                onClick={link.onClick}
                style={{ ...link.style, ...ROW_STYLE }}
                className={rowClass}
                data-testid="event-type-link">
                {body}
              </Link>
            ) : (
              <div key={service.id} style={ROW_STYLE} className={rowClass}>
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
              className="text-[12px]"
              style={{ color: "var(--sw-soft)" }}
              data-testid="profile-branding">
              {t("booked_with_app", { appName: APP_NAME })}
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
