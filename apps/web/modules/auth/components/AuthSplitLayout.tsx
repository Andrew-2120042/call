"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import type { ReactNode } from "react";

const ShowcaseCard = ({
  label,
  title,
  body,
  tone,
}: {
  label: string;
  title: string;
  body: string;
  tone?: string;
}) => (
  <div className="rounded-xl border border-white/10 bg-[#161616]/90 p-4 text-left shadow-2xl shadow-black/50 backdrop-blur">
    <p className={`text-xs ${tone ?? "text-white/50"}`}>{label}</p>
    <p className="mt-1 text-sm font-medium text-white">{title}</p>
    <p className="mt-1 text-xs leading-relaxed text-white/60">{body}</p>
  </div>
);

/** Sign-in and sign-up: the form on the left, a short look at what the product does on the right (wide screens only). */
export function AuthSplitLayout({ children }: { children: ReactNode }) {
  const { t } = useLocale();
  return (
    <div className="flex min-h-screen bg-default">
      <div className="relative flex flex-1 items-center justify-center px-4 py-10">{children}</div>
      <aside
        aria-hidden
        className="relative hidden w-[46%] max-w-[720px] overflow-hidden border-l border-subtle bg-[#0b0b0f] lg:flex lg:flex-col lg:justify-center lg:px-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(67,56,202,0.35),transparent_60%),radial-gradient(ellipse_at_10%_10%,rgba(37,99,235,0.18),transparent_55%)]" />
        <div className="relative mx-auto w-full max-w-md">
          <h2 className="font-cal text-3xl leading-tight tracking-tight text-white">
            {t("auth_showcase_title")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/60">{t("auth_showcase_subtitle")}</p>
          <div className="mt-10 space-y-3">
            <ShowcaseCard
              label={t("auth_showcase_request_label")}
              title={t("auth_showcase_request_title")}
              body={t("auth_showcase_request_body")}
            />
            <div className="translate-x-6">
              <ShowcaseCard
                label={t("auth_showcase_waitlist_label")}
                title={t("auth_showcase_waitlist_title")}
                body={t("auth_showcase_waitlist_body")}
                tone="text-amber-400"
              />
            </div>
            <ShowcaseCard
              label={t("auth_showcase_rebook_label")}
              title={t("auth_showcase_rebook_title")}
              body={t("auth_showcase_rebook_body")}
              tone="text-emerald-400"
            />
          </div>
        </div>
      </aside>
    </div>
  );
}
