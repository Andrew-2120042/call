"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import type { IconName } from "@calcom/ui/components/icon";
import { Icon } from "@calcom/ui/components/icon";
import classNames from "classnames";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { type AssistantAction, describeAssistantAction } from "./describeAssistantAction";

type Turn = { role: "user" | "assistant"; content: string; actions?: AssistantAction[] };
type Chat = { id: string; title: string; turns: Turn[]; updatedAt: number };

type Suggestion = {
  icon: IconName;
  titleKey: string;
  promptKey: string;
  group: "setup" | "services" | "requests" | "waitlist";
};

const SUGGESTIONS: Suggestion[] = [
  {
    icon: "zap",
    titleKey: "assistant_ex_setup_title",
    promptKey: "assistant_ex_setup_prompt",
    group: "setup",
  },
  {
    icon: "plus",
    titleKey: "assistant_ex_service_title",
    promptKey: "assistant_ex_service_prompt",
    group: "services",
  },
  {
    icon: "mail",
    titleKey: "assistant_ex_requests_title",
    promptKey: "assistant_ex_requests_prompt",
    group: "requests",
  },
  {
    icon: "users",
    titleKey: "assistant_ex_waitlist_title",
    promptKey: "assistant_ex_waitlist_prompt",
    group: "waitlist",
  },
  {
    icon: "pencil",
    titleKey: "assistant_ex_bio_title",
    promptKey: "assistant_ex_bio_prompt",
    group: "setup",
  },
  {
    icon: "clock",
    titleKey: "assistant_ex_length_title",
    promptKey: "assistant_ex_length_prompt",
    group: "services",
  },
  {
    icon: "circle-check",
    titleKey: "assistant_ex_accept_title",
    promptKey: "assistant_ex_accept_prompt",
    group: "requests",
  },
  {
    icon: "eye-off",
    titleKey: "assistant_ex_hide_title",
    promptKey: "assistant_ex_hide_prompt",
    group: "services",
  },
];
const FIRST_SHOWN = 4;
const PRESETS: { group: Suggestion["group"]; icon: IconName; labelKey: string }[] = [
  { group: "setup", icon: "zap", labelKey: "assistant_preset_setup" },
  { group: "services", icon: "calendar", labelKey: "assistant_preset_services" },
  { group: "requests", icon: "mail", labelKey: "assistant_preset_requests" },
  { group: "waitlist", icon: "users", labelKey: "assistant_preset_waitlist" },
];
const MAX_CHATS = 30;

const newId = () => Math.random().toString(36).slice(2, 10);

type ChatStore = {
  chats: Chat[];
  currentId: string | null;
  setTurns: (update: Turn[] | ((current: Turn[]) => Turn[])) => void;
  newChat: () => void;
  openChat: (id: string) => void;
  deleteChat: (id: string) => void;
};

/** Chats are kept on this device, so the side panel and the full page share them and they survive a reload. */
export const useAssistantChat = create<ChatStore>()(
  persist(
    (set) => ({
      chats: [],
      currentId: null,
      setTurns: (update) =>
        set((state) => {
          const current = state.chats.find((chat) => chat.id === state.currentId);
          const turns = typeof update === "function" ? update(current?.turns ?? []) : update;
          if (!turns.length) return { currentId: null };
          const firstAsk = turns.find((turn) => turn.role === "user")?.content ?? "";
          const chat: Chat = {
            id: current?.id ?? newId(),
            title: current?.title || firstAsk.slice(0, 60),
            turns,
            updatedAt: Date.now(),
          };
          const others = state.chats.filter((item) => item.id !== chat.id);
          return { currentId: chat.id, chats: [chat, ...others].slice(0, MAX_CHATS) };
        }),
      newChat: () => set({ currentId: null }),
      openChat: (id) => set({ currentId: id }),
      deleteChat: (id) =>
        set((state) => ({
          chats: state.chats.filter((chat) => chat.id !== id),
          currentId: state.currentId === id ? null : state.currentId,
        })),
    }),
    {
      name: "nodslot-assistant-chats",
      storage: createJSONStorage(() => localStorage),
      // Read after the first paint so the server and browser render the same empty state.
      skipHydration: true,
    }
  )
);

function useChats() {
  useEffect(() => {
    void useAssistantChat.persist.rehydrate();
  }, []);
  const chats = useAssistantChat((state) => state.chats);
  const currentId = useAssistantChat((state) => state.currentId);
  const current = chats.find((chat) => chat.id === currentId) ?? null;
  return { chats, current, turns: current?.turns ?? [] };
}

export const useAssistantPanel = create<{ open: boolean; toggle: () => void; close: () => void }>((set) => ({
  open: false,
  toggle: () => set((state) => ({ open: !state.open })),
  close: () => set({ open: false }),
}));

/** Full Assistant page: past chats on the left, the conversation in the middle. */
export default function AssistantView() {
  const { t } = useLocale();
  const { chats, current } = useChats();
  const newChat = useAssistantChat((state) => state.newChat);
  const openChat = useAssistantChat((state) => state.openChat);
  const deleteChat = useAssistantChat((state) => state.deleteChat);

  return (
    <div className="-m-2 flex h-[calc(100dvh-44px)] sm:-m-4 lg:-mx-6 lg:-my-5" data-testid="assistant-page">
      <aside className="border-subtle hidden w-64 shrink-0 flex-col border-r px-3 py-4 md:flex">
        <h1 className="text-emphasis px-2 text-[18px] font-medium tracking-[-0.01em]">
          {t("assistant_page_title")}
        </h1>
        <button
          type="button"
          onClick={newChat}
          data-testid="assistant-new-chat"
          className={classNames(
            "text-emphasis mt-4 flex h-8 items-center gap-2 rounded-md px-2 text-[13px] transition",
            current ? "hover:bg-subtle" : "bg-subtle"
          )}>
          <Icon name="plus" className="h-4 w-4" />
          {t("assistant_start_new_chat")}
        </button>
        <p className="text-subtle mt-6 px-2 text-[11px] uppercase tracking-[0.06em]">
          {t("assistant_chats")}
        </p>
        <ul className="mt-1.5 min-h-0 flex-1 space-y-0.5 overflow-y-auto">
          {chats.length === 0 && (
            <li className="text-muted px-2 py-1.5 text-[12px]">{t("assistant_no_chats")}</li>
          )}
          {chats.map((chat) => (
            <li key={chat.id} className="group relative">
              <button
                type="button"
                onClick={() => openChat(chat.id)}
                className={classNames(
                  "text-default hover:text-emphasis block w-full truncate rounded-md py-1.5 pl-2 pr-7 text-left text-[13px] transition",
                  current?.id === chat.id ? "bg-subtle text-emphasis" : "hover:bg-subtle"
                )}>
                {chat.title || t("assistant_new_chat")}
              </button>
              <button
                type="button"
                onClick={() => deleteChat(chat.id)}
                aria-label={t("assistant_delete_chat")}
                className="text-subtle hover:text-emphasis absolute right-1 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded opacity-0 transition group-hover:opacity-100">
                <Icon name="x" className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <div className="min-w-0 flex-1 px-4 md:px-8">
        <AssistantChat variant="page" />
      </div>
    </div>
  );
}

export function AssistantChat({ variant }: { variant: "page" | "panel" }) {
  const { t } = useLocale();
  const utils = trpc.useUtils();
  const status = trpc.viewer.assistant.status.useQuery();
  const { turns } = useChats();
  const setTurns = useAssistantChat((state) => state.setTurns);
  const panel = variant === "panel";
  const searchParams = useSearchParams();
  const [draft, setDraft] = useState(() => searchParams?.get("prompt") ?? "");
  const [showAll, setShowAll] = useState(false);
  const [preset, setPreset] = useState<Suggestion["group"] | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const chat = trpc.viewer.assistant.chat.useMutation({
    onSuccess: async (result) => {
      setTurns((current) => [
        ...current,
        { role: "assistant", content: result.reply, actions: result.actions },
      ]);
      if (result.actions.length) {
        // The page behind the chat may show what just changed (waitlist, requests, services).
        await Promise.all([
          utils.viewer.home.invalidate(),
          utils.viewer.waitlist.list.invalidate(),
          utils.viewer.bookings.invalidate(),
          utils.viewer.eventTypes.invalidate(),
        ]);
      }
    },
    onError: (error) => setTurns((current) => [...current, { role: "assistant", content: error.message }]),
  });

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, chat.isPending]);

  // Grow the box with the text, up to a limit.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [draft]);

  const configured = status.data?.configured ?? true;
  const send = (text: string) => {
    const content = text.trim();
    if (!content || chat.isPending || !configured) return;
    const next: Turn[] = [...turns, { role: "user", content }];
    setTurns(next);
    setDraft("");
    chat.mutate({ messages: next.slice(-20).map(({ role, content }) => ({ role, content })) });
  };

  const composer = (
    <form
      className="border-default focus-within:border-emphasis bg-default rounded-lg border p-2 transition-colors"
      onSubmit={(e) => {
        e.preventDefault();
        send(draft);
      }}>
      <textarea
        ref={inputRef}
        rows={panel ? 2 : 3}
        value={draft}
        disabled={!configured}
        autoFocus
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send(draft);
          }
        }}
        placeholder={t("assistant_placeholder_ask")}
        aria-label={t("assistant_page_title")}
        data-testid="assistant-input"
        className="text-emphasis placeholder:text-muted block w-full resize-none border-0 bg-transparent px-2 pt-1.5 text-[13px] leading-relaxed focus:outline-none focus:ring-0 disabled:cursor-not-allowed"
      />
      <div className="flex items-center justify-between pl-2">
        <span className="text-muted text-[11px]">{t("assistant_enter_hint")}</span>
        <button
          type="submit"
          disabled={!configured || !draft.trim() || chat.isPending}
          aria-label={t("assistant_send")}
          className="bg-inverted text-inverted grid h-7 w-7 flex-none place-items-center rounded-md transition-opacity disabled:opacity-25">
          <Icon name="arrow-up" className="h-3.5 w-3.5" />
        </button>
      </div>
    </form>
  );

  const offNotice = !configured && (
    <div className="border-subtle bg-default mb-3 flex items-start gap-3 rounded-lg border p-3" role="status">
      <Icon name="info" className="text-subtle mt-0.5 h-4 w-4 flex-none" />
      <div>
        <p className="text-emphasis text-[13px] font-medium">{t("assistant_off_title")}</p>
        <p className="text-subtle mt-0.5 text-[12px]">{t("assistant_off_body")}</p>
      </div>
    </div>
  );

  const suggestionRows = (items: Suggestion[]) => (
    <ul className="space-y-0.5">
      {items.map((suggestion) => (
        <li key={suggestion.titleKey}>
          <button
            type="button"
            disabled={!configured}
            onClick={() => send(t(suggestion.promptKey))}
            title={t(suggestion.promptKey)}
            className="text-default hover:text-emphasis hover:bg-subtle flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[13px] transition disabled:cursor-not-allowed disabled:opacity-60">
            <Icon name={suggestion.icon} className="text-subtle h-4 w-4 shrink-0" />
            {t(suggestion.titleKey)}
          </button>
        </li>
      ))}
    </ul>
  );

  if (turns.length === 0 && panel) {
    return (
      <div className="flex h-full flex-col justify-end px-4 pb-4" data-testid="assistant-panel-chat">
        <Mark />
        <h2 className="text-emphasis mt-4 text-[17px] font-medium leading-snug tracking-[-0.01em]">
          {t("assistant_hello_panel")}
        </h2>
        <p className="text-subtle mt-5 flex items-center gap-2 px-2 text-[12px]">
          <Icon name="book-open" className="h-3.5 w-3.5" />
          {t("assistant_get_started")}
        </p>
        <div className="mt-1">
          {suggestionRows(showAll ? SUGGESTIONS : SUGGESTIONS.slice(0, FIRST_SHOWN))}
        </div>
        {!showAll && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="border-subtle text-default hover:text-emphasis mt-2 self-start rounded-md border px-2.5 py-1 text-[12px]">
            {t("assistant_view_more")}
          </button>
        )}
        <div className="mt-5">
          {offNotice}
          {composer}
        </div>
      </div>
    );
  }

  if (turns.length === 0) {
    const presetItems = preset ? SUGGESTIONS.filter((item) => item.group === preset) : [];
    return (
      <div className="mx-auto flex h-full max-w-[720px] flex-col justify-center pb-16">
        <div className="mx-auto">
          <Mark large />
        </div>
        <h2 className="text-emphasis mt-4 text-center text-[22px] font-medium tracking-[-0.015em]">
          {t("assistant_hello_page")}
        </h2>
        <div className="mt-8">
          {offNotice}
          {composer}
        </div>
        <p className="text-subtle mt-6 flex items-center justify-center gap-2 text-[12px]">
          <Icon name="book-open" className="h-3.5 w-3.5" />
          {t("assistant_start_with_preset")}
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {PRESETS.map((item) => (
            <PresetChip
              key={item.group}
              icon={item.icon}
              active={preset === item.group}
              onClick={() => setPreset(preset === item.group ? null : item.group)}>
              {t(item.labelKey)}
            </PresetChip>
          ))}
          <PresetChip icon="ellipsis" active={showAll} onClick={() => setShowAll(!showAll)}>
            {t("assistant_more")}
          </PresetChip>
        </div>
        {(presetItems.length > 0 || showAll) && (
          <div className="border-subtle mx-auto mt-4 w-full max-w-[460px] rounded-lg border p-1.5">
            {suggestionRows(showAll ? SUGGESTIONS : presetItems)}
          </div>
        )}
        <p className="text-muted mt-6 text-center text-[12px]">{t("assistant_scope_note")}</p>
      </div>
    );
  }

  return (
    <div
      className={classNames("mx-auto flex h-full flex-col", panel ? "w-full px-4" : "max-w-[720px]")}
      data-testid={panel ? "assistant-panel-chat" : undefined}>
      <div ref={listRef} className="flex-1 space-y-5 overflow-y-auto py-6 pr-1" aria-live="polite">
        {turns.map((turn, index) => (
          <div
            key={index}
            className={classNames("flex gap-3", turn.role === "user" ? "justify-end" : "justify-start")}>
            {turn.role === "assistant" && <Mark small />}
            <div
              className={classNames(
                "max-w-[85%] text-[13px] leading-relaxed",
                turn.role === "user" ? "bg-subtle text-emphasis rounded-lg px-3 py-2" : "text-emphasis pt-0.5"
              )}>
              <p className="whitespace-pre-line">
                {turn.content.replace(/\*\*(.+?)\*\*/g, "$1").replace(/^\s*[-*]\s+/gm, "• ")}
              </p>
              {!!turn.actions?.length && (
                <ul className="border-subtle bg-default mt-3 space-y-1.5 rounded-lg border p-3 text-[13px]">
                  {turn.actions.map((action, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="grid h-4 w-4 flex-none place-items-center rounded-full bg-emerald-500 text-white">
                        <Icon name="check" className="h-2.5 w-2.5" />
                      </span>
                      {describeAssistantAction(action, t)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
        {chat.isPending && (
          <div className="flex gap-3">
            <Mark small />
            <span className="text-subtle flex items-center gap-2 pt-1 text-[13px]">
              <Icon name="loader" className="h-4 w-4 animate-spin" />
              {t("assistant_working")}
            </span>
          </div>
        )}
      </div>
      <div className="pb-4">{composer}</div>
    </div>
  );
}

/** The Assistant's mark: the same speech bubble wherever it speaks. */
function Mark({ small, large }: { small?: boolean; large?: boolean }) {
  return (
    <span
      className={classNames(
        "border-subtle bg-default grid flex-none place-items-center rounded-md border",
        small ? "mt-0.5 h-6 w-6" : large ? "h-10 w-10" : "h-8 w-8"
      )}>
      <Icon name="message-circle" className={classNames("text-emphasis", small ? "h-3 w-3" : "h-4 w-4")} />
    </span>
  );
}

function PresetChip({
  icon,
  active,
  onClick,
  children,
}: {
  icon: IconName;
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={classNames(
        "flex h-9 items-center gap-2 rounded-md border px-3 text-[13px] transition",
        active
          ? "border-emphasis text-emphasis bg-subtle"
          : "border-subtle text-default hover:text-emphasis hover:border-default"
      )}>
      <Icon name={icon} className="h-4 w-4" />
      {children}
    </button>
  );
}
