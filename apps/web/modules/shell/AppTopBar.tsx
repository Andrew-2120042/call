"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Icon } from "@calcom/ui/components/icon";
import { useKBar } from "kbar";
import { useSession } from "next-auth/react";
import { useAssistantPanel } from "~/assistant/assistant-view";
import { OPEN_FEEDBACK_EVENT } from "~/feedback/FeedbackDialog";
import { SidebarDrawer } from "./components/SidebarDrawer";
import { NotificationsBell } from "./NotificationsBell";
import { useSidebar } from "./sidebarStore";
import { UserDropdown } from "./user-dropdown/UserDropdown";

/** Desktop top bar: search (⌘K), the Agent, help and the account menu, above every page. */
export function AppTopBar({ sidebarDrawer }: { sidebarDrawer?: boolean }) {
  const { status } = useSession();
  if (status !== "authenticated") return null;
  return <AppTopBarContent sidebarDrawer={sidebarDrawer} />;
}

function AppTopBarContent({ sidebarDrawer }: { sidebarDrawer?: boolean }) {
  const { t } = useLocale();
  const { query } = useKBar();
  const sidebarHidden = useSidebar((state) => state.hidden);
  const toggleSidebar = useSidebar((state) => state.toggle);
  const assistantOpen = useAssistantPanel((state) => state.open);
  const toggleAssistant = useAssistantPanel((state) => state.toggle);
  return (
    <div
      data-sw-topbar
      className="border-subtle sticky top-0 z-30 hidden h-11 items-center gap-2 border-b px-4 md:flex lg:px-6">
      <div className="flex flex-1 items-center">
        {sidebarDrawer && <SidebarDrawer />}
        {!sidebarDrawer && sidebarHidden && (
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={t("show_sidebar")}
            title={t("show_sidebar")}
            data-testid="sidebar-show"
            className="text-subtle hover:text-emphasis hover:bg-subtle grid h-7 w-7 place-items-center rounded-md">
            <Icon name="chevrons-right" className="h-4 w-4" />
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => query?.toggle()}
        data-testid="topbar-search"
        className="border-subtle text-muted hover:text-default hover:border-default flex h-7 w-full max-w-[420px] items-center gap-2 rounded-md border px-2.5 text-[12px] transition">
        <Icon name="search" className="h-3.5 w-3.5 shrink-0" />
        <span className="flex-1 truncate text-left">{t("topbar_search_placeholder")}</span>
        <kbd className="border-subtle rounded border px-1 font-sans text-[10px]">⌘K</kbd>
      </button>
      <div className="flex flex-1 items-center justify-end gap-2">
        <button
          type="button"
          onClick={toggleAssistant}
          aria-pressed={assistantOpen}
          data-testid="topbar-assistant"
          className="text-subtle hover:text-emphasis hover:bg-subtle aria-pressed:bg-subtle aria-pressed:text-emphasis flex h-7 items-center gap-1.5 rounded-md px-2 text-[13px] font-medium transition">
          {t("assistant_page_title")}
        </button>
        <NotificationsBell />
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event(OPEN_FEEDBACK_EVENT))}
          aria-label={t("help_and_feedback")}
          className="text-subtle hover:text-emphasis hover:bg-subtle grid h-7 w-7 place-items-center rounded-md transition">
          <Icon name="circle-help" className="h-4 w-4" />
        </button>
        <div
          className="[&_[data-testid=user-dropdown-trigger-button]]:rounded-full"
          data-testid="user-dropdown-trigger">
          <UserDropdown small />
        </div>
      </div>
    </div>
  );
}
