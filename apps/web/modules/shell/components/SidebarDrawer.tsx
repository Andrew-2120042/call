"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Icon } from "@calcom/ui/components/icon";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { SideBarContainer } from "../SideBar";

/**
 * For full-width pages that hide the main sidebar (like the service editor): a menu button that slides the
 * sidebar back in over the page, and closes it again on navigation, Escape or a click outside.
 */
export function SidebarDrawer() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Same spot and look as the top bar's "show sidebar" button on other pages. */}
      <button
        type="button"
        aria-label={t("open_menu")}
        title={t("show_sidebar")}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="text-subtle hover:text-emphasis hover:bg-subtle grid h-7 w-7 place-items-center rounded-md"
        data-testid="sidebar-drawer-toggle">
        <Icon name="chevrons-right" className="h-4 w-4" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 hidden md:flex" role="dialog" aria-modal="true">
          <div className="h-full bg-cal-muted shadow-2xl [&>div]:h-full">
            <SideBarContainer bannersHeight={0} onCollapse={() => setOpen(false)} />
          </div>
          <button
            type="button"
            aria-label={t("close")}
            className="h-full flex-1 bg-black/40"
            onClick={() => setOpen(false)}
          />
        </div>
      )}
    </>
  );
}
