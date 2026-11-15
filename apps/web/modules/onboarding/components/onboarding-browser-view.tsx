"use client";

import { WEBAPP_URL } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Avatar } from "@calcom/ui/components/avatar";
import { Icon } from "@calcom/ui/components/icon";
import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

type OnboardingBrowserViewProps = {
  avatar?: string | null;
  name?: string;
  bio?: string;
  username?: string | null;
  teamSlug?: string;
};

const getDisplayUrl = (
  orgSlug: string | null | undefined,
  username: string | null | undefined,
  teamSlug: string | undefined
): string => {
  if (orgSlug) {
    return teamSlug !== undefined
      ? `${orgSlug}.${""}/team/${teamSlug || ""}`
      : `${orgSlug}.${""}/${username || ""}`;
  }

  const webappUrl = WEBAPP_URL.replace(/^https?:\/\//, "");
  return teamSlug !== undefined ? `${webappUrl}/team/${teamSlug || ""}` : `${webappUrl}/${username || ""}`;
};

export const OnboardingBrowserView = ({
  avatar,
  name,
  bio,
  username,
  teamSlug,
}: OnboardingBrowserViewProps) => {
  const { t } = useLocale();
  const pathname = usePathname();
  const orgBranding = null as { slug: string } | null;

  const displayUrl = getDisplayUrl(orgBranding?.slug, username, teamSlug);

  // Animation variants for entry and exit
  const containerVariants = {
    initial: {
      opacity: 0,
      y: -20,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: 20,
    },
  };

  // Sample services so the preview looks like the real public profile page while the user fills in details.
  const events = [
    { title: t("onboarding_preview_service_intro"), duration: 15 },
    { title: t("onboarding_preview_service_consultation"), duration: 30 },
    { title: t("onboarding_preview_service_follow_up"), duration: 45 },
  ];
  return (
    <div className="hidden h-full w-full flex-col overflow-hidden rounded-l-2xl border-subtle border-y border-s bg-default xl:flex">
      {/* Browser header */}
      <div className="flex min-w-0 shrink-0 items-center gap-3 rounded-t-2xl border-subtle border-b bg-default p-3">
        {/* Navigation buttons */}
        <div className="flex shrink-0 items-center gap-4 opacity-50">
          <Icon name="arrow-left" className="h-4 w-4 text-subtle" />
          <Icon name="arrow-right" className="h-4 w-4 text-subtle" />
          <Icon name="rotate-cw" className="h-4 w-4 text-subtle" />
        </div>
        <div className="flex w-full min-w-0 items-center gap-2 rounded-[32px] bg-cal-muted px-3 py-2">
          <Icon name="lock" className="h-4 w-4 text-subtle" />
          <p className="truncate font-medium text-default text-sm leading-tight">{displayUrl}</p>
        </div>
        <Icon name="ellipsis-vertical" className="h-4 w-4 text-subtle" />
      </div>
      {/* Content */}
      <div className="h-full bg-cal-muted pt-11 pl-11">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            className="flex h-full w-full flex-col overflow-hidden rounded-l-xl border-muted border-y border-s bg-cal-muted"
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              duration: 0.5,
              ease: "backOut",
            }}>
            <div className="flex flex-col items-center px-6 pt-10 text-center">
              {avatar ? (
                <Avatar size="xl" imageSrc={avatar} alt={name || ""} />
              ) : (
                <span className="grid h-16 w-16 place-items-center rounded-full bg-emphasis">
                  <Icon name="user" className="h-6 w-6 text-subtle" />
                </span>
              )}
              <h2 className="mt-4 w-full truncate font-semibold text-emphasis text-xl leading-tight tracking-[-0.02em]">
                {name || t("your_name")}
              </h2>
              <p
                className={classNames("mt-2 max-w-[40ch] text-sm leading-relaxed", {
                  "text-subtle": bio,
                  "text-muted italic": !bio,
                })}>
                {bio || t("onboarding_browser_view_default_bio")}
              </p>
            </div>
            <div className="mx-6 mt-8 overflow-hidden rounded-2xl border border-subtle bg-default opacity-60">
              {events.map((event, index) => (
                <div
                  key={event.title}
                  className={classNames(
                    "flex items-center justify-between gap-4 px-5 py-4",
                    index > 0 && "border-subtle border-t"
                  )}>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-emphasis text-sm">{event.title}</span>
                    <span className="mt-1 inline-flex items-center gap-1.5 text-subtle text-xs">
                      <Icon name="clock" className="h-3 w-3" />
                      {t("service_minutes", { count: event.duration })}
                    </span>
                  </span>
                  <Icon name="arrow-right" className="h-4 w-4 flex-none text-subtle" />
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
