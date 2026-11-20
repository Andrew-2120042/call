"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import classNames from "@calcom/ui/classNames";
import { Icon } from "@calcom/ui/components/icon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AssistantChat, useAssistantChat, useAssistantPanel } from "./assistant-view";

/**
 * The Assistant on the right of any page. It always sits beside the page (never over it), so whatever page is
 * open stays fully visible and usable while chatting; the page column narrows to make room.
 */
export function AssistantPanel() {
  const { t } = useLocale();
  const open = useAssistantPanel((state) => state.open);
  const close = useAssistantPanel((state) => state.close);
  const newChat = useAssistantChat((state) => state.newChat);
  const pathname = usePathname();

  // The full Assistant page already shows the chat.
  useEffect(() => {
    if (pathname?.startsWith("/assistant")) close();
  }, [pathname, close]);

  if (!open) return null;
  return (
    <aside
      className="border-subtle bg-default sticky top-0 z-40 hidden h-screen w-[360px] shrink-0 flex-col border-l md:flex min-[1440px]:w-[400px]"
      data-testid="assistant-panel"
      aria-label={t("assistant_page_title")}>
      <header className="flex h-11 shrink-0 items-center gap-1 px-3">
        <ChatSwitcher />
        <button
          type="button"
          onClick={newChat}
          title={t("assistant_new_chat")}
          aria-label={t("assistant_new_chat")}
          className="text-subtle hover:text-emphasis hover:bg-subtle ml-auto grid h-7 w-7 place-items-center rounded-md">
          <Icon name="plus" className="h-4 w-4" />
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
      <div className="min-h-0 flex-1">
        <AssistantChat variant="panel" />
      </div>
    </aside>
  );
}

/** "New chat ▾": the current chat's name, opening a list of earlier chats to go back to. */
function ChatSwitcher() {
  const { t } = useLocale();
  const chats = useAssistantChat((state) => state.chats);
  const currentId = useAssistantChat((state) => state.currentId);
  const openChat = useAssistantChat((state) => state.openChat);
  const newChat = useAssistantChat((state) => state.newChat);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = chats.find((chat) => chat.id === currentId);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        data-testid="assistant-chat-switcher"
        className="text-emphasis hover:bg-subtle flex h-7 max-w-[240px] items-center gap-1.5 rounded-md px-2 text-[13px] font-medium">
        <Icon name="message-circle" className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{current?.title || t("assistant_new_chat")}</span>
        <Icon name="chevron-down" className="text-subtle h-3.5 w-3.5 shrink-0" />
      </button>
      {open && (
        <div className="bg-default border-subtle absolute left-0 top-full z-50 mt-1 w-72 rounded-lg border p-1.5 shadow-2xl">
          <button
            type="button"
            onClick={() => {
              newChat();
              setOpen(false);
            }}
            className="text-emphasis hover:bg-subtle flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px]">
            <Icon name="plus" className="h-4 w-4" />
            {t("assistant_start_new_chat")}
          </button>
          <p className="text-subtle px-2 pb-1 pt-2 text-[11px] uppercase tracking-[0.06em]">
            {t("assistant_recent_chats")}
          </p>
          {chats.length === 0 ? (
            <p className="text-muted px-2 py-1.5 text-[12px]">{t("assistant_no_chats")}</p>
          ) : (
            <ul className="max-h-72 overflow-y-auto">
              {chats.map((chat) => (
                <li key={chat.id}>
                  <button
                    type="button"
                    onClick={() => {
                      openChat(chat.id);
                      setOpen(false);
                    }}
                    className={classNames(
                      "block w-full truncate rounded-md px-2 py-1.5 text-left text-[13px]",
                      chat.id === currentId ? "bg-subtle text-emphasis" : "text-default hover:bg-subtle"
                    )}>
                    {chat.title || t("assistant_new_chat")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
