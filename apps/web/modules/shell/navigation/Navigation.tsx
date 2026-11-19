import { useIsEmbed } from "@calcom/embed-core/embed-iframe";
import { useIsStandalone } from "@calcom/lib/hooks/useIsStandalone";
import classNames from "@calcom/ui/classNames";
import { useSession } from "next-auth/react";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import type { IconName } from "@calcom/ui/components/icon";
import { Icon } from "@calcom/ui/components/icon";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import UnconfirmedBookingBadge from "../../bookings/components/UnconfirmedBookingBadge";
import { KBarTrigger } from "../Kbar";
import type { NavigationItemType } from "./NavigationItem";
import { MobileNavigationItem, MobileNavigationMoreItem, NavigationItem } from "./NavigationItem";
import { useMobileMoreItems } from "./useMobileMoreItems";

export const MORE_SEPARATOR_NAME = "more";

const getNavigationItems = (): NavigationItemType[] => [
  {
    name: "assistant_page_title",
    href: "/assistant",
    icon: "message-circle",
  },
  {
    name: "home_page_title",
    href: "/home",
    icon: "house",
  },
  {
    name: "event_types_page_title",
    href: "/event-types",
    icon: "link",
  },
  {
    name: "bookings",
    href: "/bookings/upcoming",
    icon: "calendar",
    badge: <UnconfirmedBookingBadge />,
    isCurrent: ({ pathname }) => pathname?.startsWith("/bookings") ?? false,
  },
  {
    name: "availability",
    href: "/availability",
    icon: "clock",
  },
  {
    name: "waitlist_page_title",
    href: "/waitlist",
    icon: "users",
  },
  {
    name: "teams",
    href: "/teams",
    icon: "building",
    moreOnMobile: true,
    isCurrent: ({ pathname: path, item }) => path?.startsWith(item.href) ?? false,
  },
  {
    name: "apps",
    href: "/apps",
    icon: "grid-3x3",
    moreOnMobile: true,
    isCurrent: ({ pathname: path, item }) => path?.startsWith(item.href) ?? false,
  },
  {
    name: MORE_SEPARATOR_NAME,
    href: "/more",
    icon: "ellipsis",
  },
];

const useNavigationItems = () => {
  return useMemo(() => {
    const items = getNavigationItems();

    const desktopNavigationItems = items.filter((item) => item.name !== MORE_SEPARATOR_NAME);
    const mobileNavigationBottomItems = items.filter(
      (item) => (!item.moreOnMobile && !item.onlyDesktop) || item.name === MORE_SEPARATOR_NAME
    );
    const mobileNavigationMoreItems = items.filter(
      (item) => item.moreOnMobile && !item.onlyDesktop && item.name !== MORE_SEPARATOR_NAME
    );

    return {
      desktopNavigationItems,
      mobileNavigationBottomItems,
      mobileNavigationMoreItems,
    };
  }, []);
};

type NavGroup = { name?: string; icon?: IconName; items: string[] };

// Grouped like a work tool: a couple of everyday pages on top, then sections that fold open.
const NAV_GROUPS: NavGroup[] = [
  { items: ["home_page_title"] },
  { name: "nav_group_scheduling", icon: "calendar-days", items: ["event_types_page_title", "bookings", "availability"] },
  { name: "nav_group_fill", icon: "users", items: ["waitlist_page_title"] },
  { name: "nav_group_team", icon: "building", items: ["teams"] },
  { name: "nav_group_connect", icon: "blocks", items: ["apps"] },
];

export const Navigation = () => {
  const { desktopNavigationItems } = useNavigationItems();
  const byName = new Map(desktopNavigationItems.map((item) => [item.name, item]));

  return (
    <nav className="mt-3 flex-1 space-y-0.5 md:px-2 lg:px-0">
      {NAV_GROUPS.map((group) => {
        const items = group.items.map((name) => byName.get(name)).filter((item) => !!item);
        if (!group.name) return items.map((item) => <NavigationItem key={item.name} item={item} />);
        return (
          <NavigationGroup key={group.name} name={group.name} icon={group.icon}>
            {items.map((item) => (
              <NavigationItem key={item.name} item={item} />
            ))}
          </NavigationGroup>
        );
      })}
      <div className="mt-0.5 text-subtle lg:hidden">
        <KBarTrigger />
      </div>
    </nav>
  );
};

const NavigationGroup = ({ name, icon, children }: { name: string; icon?: IconName; children: ReactNode }) => {
  const { t } = useLocale();
  const [open, setOpen] = useState(true);
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(`nav-group-${name}`);
      if (stored !== null) setOpen(stored === "1");
    } catch {}
  }, [name]);
  const toggle = () => {
    setOpen((was) => {
      try {
        window.localStorage.setItem(`nav-group-${name}`, was ? "0" : "1");
      } catch {}
      return !was;
    });
  };
  return (
    <div className="pt-2" data-sw-nav-group>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        data-sw-nav-group-label
        className="hidden w-full items-center gap-2 rounded-md px-2 py-1 text-left text-[13px] text-subtle hover:text-emphasis lg:flex">
        {icon && <Icon name={icon} className="h-3.5 w-3.5 shrink-0" />}
        <span className="flex-1 truncate">{t(name)}</span>
        <Icon name={open ? "chevron-down" : "chevron-right"} className="h-3 w-3 shrink-0 opacity-70" />
      </button>
      <div className={classNames("lg:pl-[22px]", !open && "lg:hidden")} data-sw-nav-children>
        {children}
      </div>
    </div>
  );
};

export function MobileNavigationContainer() {
  const { status } = useSession();
  const isStandalone = useIsStandalone();
  if (status !== "authenticated" || isStandalone) return null;
  return <MobileNavigation />;
}

const MobileNavigation = () => {
  const isEmbed = useIsEmbed();
  const { mobileNavigationBottomItems } = useNavigationItems();

  return (
    <>
      <nav
        className={classNames(
          "fixed bottom-0 left-0 z-30 pwa:-mx-2 flex w-full border-subtle border-t bg-cal-muted/40 px-1 pwa:pb-[max(0.25rem,env(safe-area-inset-bottom))] shadow backdrop-blur-md md:hidden",
          isEmbed && "hidden"
        )}>
        {mobileNavigationBottomItems.map((item) => (
          <MobileNavigationItem key={item.name} item={item} />
        ))}
      </nav>
      {/* add padding to content for mobile navigation*/}
      <div className="block pt-12 md:hidden" />
    </>
  );
};

export const MobileNavigationMoreItems = () => {
  const { mobileNavigationMoreItems } = useNavigationItems();
  const bottomItems = useMobileMoreItems();

  const allItems = [...mobileNavigationMoreItems, ...bottomItems];

  return (
    <ul className="mt-2 rounded-md border border-subtle">
      {allItems.map((item) => (
        <MobileNavigationMoreItem key={item.name} item={item} />
      ))}
    </ul>
  );
};
