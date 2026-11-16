"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button } from "@calcom/ui/components/button";
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
      <Button
        variant="icon"
        size="sm"
        color="minimal"
        StartIcon="menu"
        aria-label={t("open_menu")}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="hidden rounded-md md:inline-flex ltr:mr-1 rtl:ml-1"
        data-testid="sidebar-drawer-toggle"
      />
      {open && (
        <div className="fixed inset-0 z-50 hidden md:flex" role="dialog" aria-modal="true">
          <div className="h-full bg-cal-muted shadow-2xl [&>div]:h-full">
            <SideBarContainer bannersHeight={0} />
          </div>
          <button
            type="button"
            aria-label={t("close")}
            className="h-full flex-1 bg-black/40 backdrop-blur-[1px]"
            onClick={() => setOpen(false)}
          />
        </div>
      )}
    </>
  );
}
