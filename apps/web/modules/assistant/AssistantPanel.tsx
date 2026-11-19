"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Icon } from "@calcom/ui/components/icon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { AssistantChat, useAssistantChat, useAssistantPanel } from "./assistant-view";

/** The Assistant docked on the right of any page, so people can ask while looking at what they're changing. */
export function AssistantPanel() {
  const { t } = useLocale();
  const open = useAssistantPanel((state) => state.open);
  const close = useAssistantPanel((state) => state.close);
  const setTurns = useAssistantChat((state) => state.setTurns);
  const pathname = usePathname();

  // The full Assistant page already shows the chat.
  useEffect(() => {
    if (pathname?.startsWith("/assistant")) close();
  }, [pathname, close]);

  if (!open) return null;
  return (
    <aside
      className="border-subtle bg-default sticky top-0 hidden h-screen w-[400px] shrink-0 flex-col border-l md:flex"
      data-testid="assistant-panel"
      aria-label={t("assistant_page_title")}>
      <header className="border-subtle flex h-11 shrink-0 items-center gap-1 border-b px-3">
        <Icon name="message-circle" className="text-emphasis h-3.5 w-3.5" />
        <span className="text-emphasis ml-1.5 flex-1 text-[13px] font-medium">{t("assistant_page_title")}</span>
        <button
          type="button"
          onClick={() => setTurns([])}
          title={t("assistant_new_chat")}
          aria-label={t("assistant_new_chat")}
          className="text-subtle hover:text-emphasis hover:bg-subtle grid h-7 w-7 place-items-center rounded-md">
          <Icon name="plus" className="h-3.5 w-3.5" />
        </button>
        <Link
          href="/assistant"
          title={t("assistant_open_full")}
          aria-label={t("assistant_open_full")}
          className="text-subtle hover:text-emphasis hover:bg-subtle grid h-7 w-7 place-items-center rounded-md">
          <Icon name="arrow-up-right" className="h-3.5 w-3.5" />
        </Link>
        <button
          type="button"
          onClick={close}
          aria-label={t("close")}
          data-testid="assistant-panel-close"
          className="text-subtle hover:text-emphasis hover:bg-subtle grid h-7 w-7 place-items-center rounded-md">
          <Icon name="x" className="h-4 w-4" />
        </button>
      </header>
      <div className="min-h-0 flex-1 pt-3">
        <AssistantChat variant="panel" />
      </div>
    </aside>
  );
}
