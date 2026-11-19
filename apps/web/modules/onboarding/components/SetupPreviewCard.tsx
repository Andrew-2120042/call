"use client";

import { WEBAPP_URL } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import classNames from "@calcom/ui/classNames";
import { Avatar } from "@calcom/ui/components/avatar";
import type { IconName } from "@calcom/ui/components/icon";
import { Icon } from "@calcom/ui/components/icon";
import { AnimatePresence, motion } from "framer-motion";

export type PreviewService = { key: string; title: string; minutes: number };
export type PreviewTag = { key: string; icon: IconName; label: string };

/**
 * The person's booking page as a small card that fills in while they set up, so every answer visibly
 * changes something (the way Clay's profile card builds up during its sign-up).
 */
export function SetupPreviewCard({
  name,
  avatar,
  username,
  bio,
  services = [],
  tags = [],
  highlight,
}: {
  name?: string | null;
  avatar?: string | null;
  username?: string | null;
  bio?: string | null;
  services?: PreviewService[];
  tags?: PreviewTag[];
  /** The tag or service the current question changes, outlined so it's clear what the answer did. */
  highlight?: string;
}) {
  const { t } = useLocale();
  const host = WEBAPP_URL.replace(/^https?:\/\//, "");
  const initial = (name || username || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="flex h-full items-center justify-center" data-testid="setup-preview">
      <div className="bg-default border-subtle w-full max-w-[340px] overflow-hidden rounded-xl border shadow-[0_24px_60px_-28px_rgba(0,0,0,0.55)]">
        <div className="relative h-24 bg-[linear-gradient(135deg,#3b4a7a_0%,#5a4f8f_45%,#2f5d62_100%)]">
          <div className="absolute -bottom-7 left-5">
            {avatar ? (
              <Avatar size="lg" imageSrc={avatar} alt={name ?? ""} className="ring-default ring-4" />
            ) : (
              <span className="bg-emphasis text-emphasis ring-default grid h-14 w-14 place-items-center rounded-full text-xl font-semibold ring-4">
                {initial}
              </span>
            )}
          </div>
        </div>
        <div className="px-5 pb-5 pt-9">
          <p className="text-emphasis truncate text-[15px] font-semibold">
            {name || t("setup_preview_your_name")}
          </p>
          <p className="text-subtle mt-0.5 flex items-center gap-1 truncate text-[11px]">
            <Icon name="link" className="h-3 w-3 shrink-0" />
            {host}/{username || "you"}
          </p>
          {bio && <p className="text-default mt-2 line-clamp-2 text-[12px] leading-snug">{bio}</p>}

          {services.length > 0 && (
            <div className="mt-4">
              <p className="text-subtle text-[10px] uppercase tracking-[0.08em]">
                {t("setup_preview_services")}
              </p>
              <ul className="mt-1.5 space-y-1.5">
                <AnimatePresence initial={false}>
                  {services.map((service) => (
                    <motion.li
                      key={service.key}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className={classNames(
                        "flex items-center justify-between rounded-md border px-2.5 py-2 text-[12px] transition-colors",
                        highlight === service.key ? "border-emphasis bg-subtle" : "border-subtle"
                      )}>
                      <span className="text-emphasis truncate">{service.title}</span>
                      <span className="text-subtle flex shrink-0 items-center gap-1 text-[11px]">
                        <Icon name="clock" className="h-3 w-3" />
                        {service.minutes} min
                      </span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          )}

          {tags.length > 0 && (
            <div className="mt-4">
              <p className="text-subtle text-[10px] uppercase tracking-[0.08em]">{t("setup_preview_how")}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <AnimatePresence initial={false}>
                  {tags.map((tag) => (
                    <motion.span
                      key={tag.key}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={classNames(
                        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] transition-colors",
                        highlight === tag.key
                          ? "border-emphasis text-emphasis bg-subtle"
                          : "border-subtle text-default"
                      )}>
                      <Icon name={tag.icon} className="h-3 w-3" />
                      {tag.label}
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {services.length === 0 && tags.length === 0 && (
            <div className="mt-4 space-y-1.5" aria-hidden>
              <div className="border-subtle h-9 rounded-md border border-dashed" />
              <div className="border-subtle h-9 rounded-md border border-dashed" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
