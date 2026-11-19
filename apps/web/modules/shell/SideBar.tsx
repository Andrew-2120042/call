import { IS_VISUAL_REGRESSION_TESTING, WEBAPP_URL } from "@calcom/lib/constants";
import { useIsStandalone } from "@calcom/lib/hooks/useIsStandalone";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import classNames from "@calcom/ui/classNames";
import { Credits } from "@calcom/ui/components/credits";
import { ButtonOrLink } from "@calcom/ui/components/dropdown";
import { Icon } from "@calcom/ui/components/icon";
import { Logo } from "@calcom/ui/components/logo";
import { SkeletonText } from "@calcom/ui/components/skeleton";
import { Tooltip } from "@calcom/ui/components/tooltip";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { User as UserAuth } from "next-auth";
import { useSession } from "next-auth/react";
import { SidebarSetupCard } from "../home/SidebarSetupCard";
import { Navigation } from "./navigation/Navigation";
import { FeedbackDialog } from "~/feedback/FeedbackDialog";
import { useBottomNavItems } from "./useBottomNavItems";

export type SideBarContainerProps = {
  bannersHeight: number;
};

export type SideBarProps = {
  bannersHeight: number;
  user?: UserAuth | null;
};

export function SideBarContainer({ bannersHeight }: SideBarContainerProps) {
  const { status, data } = useSession();
  const isStandalone = useIsStandalone();

  // Make sure that Sidebar is rendered optimistically so that a refresh of pages when logged in have SideBar from the beginning.
  // This improves the experience of refresh on app store pages(when logged in) which are SSG.
  // Though when logged out, app store pages would temporarily show SideBar until session status is confirmed.
  if (status !== "loading" && status !== "authenticated") return null;
  if (isStandalone) return null;
  return <SideBar bannersHeight={bannersHeight} user={data?.user} />;
}

function useCurrentPlan() {
  const [plan, setPlan] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/billing/plan")
      .then((res) => (res.ok ? res.json() : null))
      .then((summary) => !cancelled && setPlan(summary?.plan ?? null))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return plan;
}

export function SideBar({ bannersHeight, user }: SideBarProps) {
  const { t, isLocaleReady } = useLocale();
  const plan = useCurrentPlan();

  const publicPageUrl = `${WEBAPP_URL}/${user?.orgAwareUsername}`;

  const bottomNavItems = useBottomNavItems({
    publicPageUrl,
  });

  const sidebarStylingAttributes = {
    maxHeight: `calc(100vh - ${bannersHeight}px)`,
    top: `${bannersHeight}px`,
  };

  return (
    <div className="relative">
      <aside
        data-sw-sidebar
        style={sidebarStylingAttributes}
        className={classNames(
          "fixed left-0 hidden h-full w-14 flex-col overflow-y-auto overflow-x-hidden border-subtle border-r md:sticky md:flex lg:w-[224px] lg:px-2.5",
          "max-h-screen"
        )}>
        <div className="flex h-full flex-col py-2.5">
          <header className="flex h-8 items-center justify-center px-1 lg:justify-start">
            <Link href="/home" className="flex items-center gap-2" aria-label={t("home_page_title")}>
              <span className="lg:hidden">
                <Logo small icon />
              </span>
              <span className="hidden lg:inline">
                <Logo small />
              </span>
            </Link>
          </header>
          <Navigation />
        </div>

        <div className="md:px-2 md:pb-3 lg:px-0 lg:pb-3">
          {plan && plan !== "TEAM" && (
            <Link
              href="/settings/billing"
              data-testid="sidebar-upgrade"
              className="bg-inverted text-inverted mb-3 hidden h-8 items-center justify-center rounded-md text-[13px] font-semibold lg:flex">
              {t("upgrade")}
            </Link>
          )}
          <SidebarSetupCard />
          <FeedbackDialog />
          {bottomNavItems.map((item) => (
            <Tooltip side="right" content={t(item.name)} className="lg:hidden" key={item.name}>
              <ButtonOrLink
                id={item.name}
                href={item.href || undefined}
                aria-label={t(item.name)}
                target={item.target}
                className={classNames(
                  "text-left",
                  "group flex w-full items-center rounded-md px-2 py-1.5 text-[12px] text-default transition [&[aria-current='page']]:bg-emphasis [&[aria-current='page']]:text-emphasis",
                  isLocaleReady ? "hover:bg-subtle hover:text-emphasis" : ""
                )}
                onClick={item.onClick}>
                {!!item.icon && (
                  <Icon
                    name={item.isLoading ? "rotate-cw" : item.icon}
                    className={classNames(
                      "h-3.5 w-3.5 shrink-0",
                      "md:mx-auto lg:ltr:mr-2 lg:rtl:ml-2",
                      item.isLoading && "animate-spin"
                    )}
                    aria-hidden="true"
                  />
                )}
                {isLocaleReady ? (
                  <span className="hidden w-full items-center justify-between lg:flex">
                    <span>{t(item.name)}</span>
                    {item.href?.startsWith("/settings") && <Icon name="chevron-right" className="h-3 w-3 opacity-60" />}
                  </span>
                ) : (
                  <SkeletonText className="h-[20px] w-full" />
                )}
              </ButtonOrLink>
            </Tooltip>
          ))}
          {!IS_VISUAL_REGRESSION_TESTING && <Credits />}
        </div>
      </aside>
    </div>
  );
}
