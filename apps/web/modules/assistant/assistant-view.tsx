"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import type { IconName } from "@calcom/ui/components/icon";
import { Icon } from "@calcom/ui/components/icon";
import classNames from "classnames";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { create } from "zustand";
import { describeAssistantAction, type AssistantAction } from "./describeAssistantAction";

type Turn = { role: "user" | "assistant"; content: string; actions?: AssistantAction[] };

const EXAMPLES: { icon: IconName; titleKey: string; promptKey: string }[] = [
  { icon: "zap", titleKey: "assistant_ex_setup_title", promptKey: "assistant_ex_setup_prompt" },
  { icon: "plus", titleKey: "assistant_ex_service_title", promptKey: "assistant_ex_service_prompt" },
  { icon: "pencil", titleKey: "assistant_ex_bio_title", promptKey: "assistant_ex_bio_prompt" },
];

/** The conversation survives navigation, so the side panel and the full page show the same chat. */
export const useAssistantChat = create<{
  turns: Turn[];
  setTurns: (update: Turn[] | ((current: Turn[]) => Turn[])) => void;
}>((set) => ({
  turns: [],
  setTurns: (update) => set((state) => ({ turns: typeof update === "function" ? update(state.turns) : update })),
}));

export const useAssistantPanel = create<{ open: boolean; toggle: () => void; close: () => void }>((set) => ({
  open: false,
  toggle: () => set((state) => ({ open: !state.open })),
  close: () => set({ open: false }),
}));

/** Assistant page: owners describe what they want and it sets it up (services, bio). */
export default function AssistantView() {
  return <AssistantChat variant="page" />;
}

export function AssistantChat({ variant }: { variant: "page" | "panel" }) {
  const { t } = useLocale();
  const utils = trpc.useUtils();
  const status = trpc.viewer.assistant.status.useQuery();
  const turns = useAssistantChat((state) => state.turns);
  const setTurns = useAssistantChat((state) => state.setTurns);
  const panel = variant === "panel";
  const searchParams = useSearchParams();
  const [draft, setDraft] = useState(() => searchParams?.get("prompt") ?? "");
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
      className="border-default focus-within:border-emphasis bg-default rounded-lg border p-2 shadow-[0_1px_2px_rgba(0,0,0,.04),0_8px_24px_-16px_rgba(0,0,0,.18)] transition-colors"
      onSubmit={(e) => {
        e.preventDefault();
        send(draft);
      }}>
      <textarea
        ref={inputRef}
        rows={2}
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
        placeholder={t("assistant_placeholder")}
        aria-label={t("assistant_page_title")}
        className="text-emphasis placeholder:text-muted block w-full resize-none border-0 bg-transparent px-3 pt-2.5 text-[14px] leading-relaxed focus:outline-none focus:ring-0 disabled:cursor-not-allowed"
      />
      <div className="flex items-center justify-between pl-3">
        <span className="text-muted text-xs">{t("assistant_enter_hint")}</span>
        <button
          type="submit"
          disabled={!configured || !draft.trim() || chat.isPending}
          aria-label={t("assistant_send")}
          className="bg-inverted text-inverted grid h-9 w-9 flex-none place-items-center rounded-full transition-opacity disabled:opacity-25">
          <Icon name="arrow-up" className="h-4 w-4" />
        </button>
      </div>
    </form>
  );

  if (turns.length === 0) {
    return (
      <div
        className={classNames(
          "mx-auto flex flex-col",
          panel ? "h-full justify-end px-4 pb-4" : "min-h-[calc(100dvh-120px)] max-w-[680px] justify-center py-10"
        )}
        data-testid={panel ? "assistant-panel-chat" : "assistant-page"}>
        <div className="bg-default border-subtle mx-auto grid h-12 w-12 place-items-center rounded-lg border">
          <Icon name="message-circle" className="text-emphasis h-5 w-5" />
        </div>
        <h1
          className={classNames(
            "text-emphasis mt-5 text-center font-semibold leading-tight tracking-[-0.025em]",
            panel ? "text-[17px]" : "text-[28px]"
          )}>
          {t("assistant_page_heading")}
        </h1>
        <p className="text-subtle mx-auto mt-2 max-w-[440px] text-center text-[14px] leading-relaxed">
          {t("assistant_subtitle")}
        </p>

        {!configured && (
          <div
            className="border-subtle bg-default mt-8 flex items-start gap-3 rounded-lg border p-4"
            role="status">
            <Icon name="info" className="text-subtle mt-0.5 h-4 w-4 flex-none" />
            <div>
              <p className="text-emphasis text-sm font-medium">{t("assistant_off_title")}</p>
              <p className="text-subtle mt-0.5 text-sm">{t("assistant_off_body")}</p>
            </div>
          </div>
        )}

        <div className={configured ? "mt-8" : "mt-4"}>{composer}</div>

        <div className={classNames("mt-6 grid gap-2.5", !panel && "sm:grid-cols-2")}>
          {EXAMPLES.map((example) => (
            <button
              key={example.titleKey}
              type="button"
              disabled={!configured}
              onClick={() => send(t(example.promptKey))}
              className="border-subtle bg-default hover:border-emphasis group flex items-start gap-3 rounded-lg border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60">
              <span className="bg-subtle grid h-8 w-8 flex-none place-items-center rounded-xl">
                <Icon name={example.icon} className="text-emphasis h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="text-emphasis block text-sm font-medium">{t(example.titleKey)}</span>
                <span className="text-subtle mt-0.5 block text-xs leading-snug">{t(example.promptKey)}</span>
              </span>
            </button>
          ))}
        </div>

        <p className="text-muted mt-6 text-center text-xs">{t("assistant_scope_note")}</p>
      </div>
    );
  }

  return (
    <div
      className={classNames("mx-auto flex flex-col", panel ? "h-full w-full px-4" : "h-[calc(100dvh-120px)] max-w-[720px]")}
      data-testid={panel ? "assistant-panel-chat" : "assistant-page"}>
      <div className={classNames("border-subtle flex items-center justify-between border-b pb-3", panel && "hidden")}>
        <div className="flex items-center gap-2">
          <Icon name="message-circle" className="text-emphasis h-4 w-4" />
          <h1 className="text-emphasis text-base font-semibold">{t("assistant_page_title")}</h1>
        </div>
        <button
          type="button"
          onClick={() => {
            setTurns([]);
            setDraft("");
          }}
          className="border-default text-emphasis hover:bg-subtle rounded-md border px-3 py-1.5 text-xs font-medium transition-colors">
          {t("assistant_new_chat")}
        </button>
      </div>

      <div ref={listRef} className="flex-1 space-y-5 overflow-y-auto py-6 pr-1" aria-live="polite">
        {turns.map((turn, index) => (
          <div
            key={index}
            className={classNames("flex gap-3", turn.role === "user" ? "justify-end" : "justify-start")}>
            {turn.role === "assistant" && (
              <span className="bg-default border-subtle mt-0.5 grid h-7 w-7 flex-none place-items-center rounded-full border">
                <Icon name="message-circle" className="text-emphasis h-3.5 w-3.5" />
              </span>
            )}
            <div
              className={classNames(
                "max-w-[80%] text-[14px] leading-relaxed",
                turn.role === "user"
                  ? "bg-inverted text-inverted rounded-lg rounded-br-md px-4 py-2.5"
                  : "text-emphasis pt-0.5"
              )}>
              <p className="whitespace-pre-line">
                {turn.content.replace(/\*\*(.+?)\*\*/g, "$1").replace(/^\s*[-*]\s+/gm, "• ")}
              </p>
              {!!turn.actions?.length && (
                <ul className="border-subtle bg-default mt-3 space-y-1.5 rounded-lg border p-3 text-sm">
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
            <span className="bg-default border-subtle grid h-7 w-7 flex-none place-items-center rounded-full border">
              <Icon name="message-circle" className="text-emphasis h-3.5 w-3.5" />
            </span>
            <span className="text-subtle flex items-center gap-2 pt-1 text-sm">
              <Icon name="loader" className="h-4 w-4 animate-spin" />
              {t("assistant_working")}
            </span>
          </div>
        )}
      </div>

      <div className="pb-2">{composer}</div>
    </div>
  );
}
