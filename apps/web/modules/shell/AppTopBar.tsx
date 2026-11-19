"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Icon } from "@calcom/ui/components/icon";
import { useKBar } from "kbar";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { OPEN_FEEDBACK_EVENT } from "~/feedback/FeedbackDialog";
import { UserDropdown } from "./user-dropdown/UserDropdown";

/** Desktop top bar: search (⌘K), the Assistant, help and the account menu, above every page. */
export function AppTopBar() {
  const { status } = useSession();
  if (status !== "authenticated") return null;
  return <AppTopBarContent />;
}

function AppTopBarContent() {
  const { t } = useLocale();
  const { query } = useKBar();
  return (
    <div
      data-sw-topbar
      className="border-subtle sticky top-0 z-30 hidden h-11 items-center gap-2 border-b px-4 md:flex lg:px-6">
      <button
        type="button"
        onClick={() => query?.toggle()}
        data-testid="topbar-search"
        className="border-subtle text-muted hover:text-default hover:border-default flex h-7 w-full max-w-[380px] items-center gap-2 rounded-md border px-2.5 text-[13px] transition">
        <Icon name="search" className="h-3.5 w-3.5 shrink-0" />
        <span className="flex-1 truncate text-left">{t("topbar_search_placeholder")}</span>
        <kbd className="border-subtle rounded border px-1 font-sans text-[10px]">⌘K</kbd>
      </button>
      <div className="flex-1" />
      <Link
        href="/assistant"
        data-testid="topbar-assistant"
        className="bg-inverted text-inverted flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium">
        <Icon name="sparkles" className="h-3.5 w-3.5" />
        {t("assistant_page_title")}
      </Link>
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event(OPEN_FEEDBACK_EVENT))}
        aria-label={t("help_and_feedback")}
        className="text-subtle hover:text-emphasis hover:bg-subtle grid h-7 w-7 place-items-center rounded-md transition">
        <Icon name="circle-help" className="h-4 w-4" />
      </button>
      <div className="[&_[data-testid=user-dropdown-trigger-button]]:rounded-full" data-testid="user-dropdown-trigger">
        <UserDropdown small />
      </div>
    </div>
  );
}
