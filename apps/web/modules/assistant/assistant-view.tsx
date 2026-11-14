"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Icon } from "@calcom/ui/components/icon";
import classNames from "classnames";
import { useEffect, useRef, useState } from "react";

type Action =
  | { type: "service_created"; title: string; minutes: number; url: string }
  | { type: "service_updated"; title: string }
  | { type: "profile_updated"; fields: string[] }
  | { type: "look_updated"; theme?: string; buttonShape?: string };

type Turn = { role: "user" | "assistant"; content: string; actions?: Action[] };

const SUGGESTIONS = ["assistant_suggest_coach", "assistant_suggest_intro", "assistant_suggest_bio"] as const;

/** Assistant page: owners describe what they want and it sets it up (services, bio, look). */
export default function AssistantView() {
  const { t } = useLocale();
  const utils = trpc.useUtils();
  const status = trpc.viewer.assistant.status.useQuery();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const chat = trpc.viewer.assistant.chat.useMutation({
    onSuccess: async (result) => {
      setTurns((current) => [
        ...current,
        { role: "assistant", content: result.reply, actions: result.actions },
      ]);
      if (result.actions.length) {
        await Promise.all([utils.viewer.home.get.invalidate(), utils.viewer.pageLook.editor.invalidate()]);
      }
    },
    onError: (error) => setTurns((current) => [...current, { role: "assistant", content: error.message }]),
  });

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, chat.isPending]);

  const configured = status.data?.configured ?? true;
  const send = (text: string) => {
    const content = text.trim();
    if (!content || chat.isPending) return;
    const next: Turn[] = [...turns, { role: "user", content }];
    setTurns(next);
    setDraft("");
    chat.mutate({ messages: next.slice(-20).map(({ role, content }) => ({ role, content })) });
  };

  const empty = turns.length === 0;

  const composer = (
    <form
      className="border-default focus-within:border-emphasis bg-default flex items-end gap-2 rounded-3xl border p-2 shadow-[0_1px_2px_rgba(0,0,0,.04)] transition-colors"
      onSubmit={(e) => {
        e.preventDefault();
        send(draft);
      }}>
      <textarea
        rows={1}
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
        placeholder={configured ? t("assistant_placeholder") : t("assistant_not_configured")}
        aria-label={t("assistant_page_title")}
        className="text-emphasis placeholder:text-muted max-h-40 min-h-[44px] flex-1 resize-none border-0 bg-transparent px-3 py-2.5 text-[15px] focus:outline-none focus:ring-0"
      />
      <button
        type="submit"
        disabled={!configured || !draft.trim() || chat.isPending}
        aria-label={t("assistant_send")}
        className="bg-inverted text-inverted grid h-10 w-10 flex-none place-items-center rounded-full transition-opacity disabled:opacity-30">
        <Icon name="arrow-up" className="h-4 w-4" />
      </button>
    </form>
  );

  if (empty) {
    return (
      <div
        className="mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center"
        data-testid="assistant-page">
        <h1 className="text-emphasis text-center text-[34px] font-semibold tracking-[-0.025em]">
          {t("assistant_page_heading")}
        </h1>
        <p className="text-subtle mx-auto mt-2 max-w-md text-center text-[15px]">{t("assistant_subtitle")}</p>
        <div className="mt-8">{composer}</div>
        {configured && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => send(t(key))}
                className="border-subtle text-default hover:border-emphasis bg-default rounded-full border px-3.5 py-1.5 text-sm transition-colors">
                {t(key)}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-140px)] max-w-2xl flex-col" data-testid="assistant-page">
      <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto pb-4 pr-1" aria-live="polite">
        {turns.map((turn, index) => (
          <div
            key={index}
            className={classNames("flex", turn.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={classNames(
                "max-w-[85%] rounded-3xl px-4 py-3 text-[15px] leading-relaxed",
                turn.role === "user"
                  ? "bg-inverted text-inverted"
                  : "bg-default border-subtle text-emphasis border"
              )}>
              <p className="whitespace-pre-line">{turn.content}</p>
              {!!turn.actions?.length && (
                <ul className="border-subtle mt-2 space-y-1 border-t pt-2 text-sm">
                  {turn.actions.map((action, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <Icon name="check" className="h-3.5 w-3.5 flex-none" />
                      {describeAction(action, t)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
        {chat.isPending && (
          <div className="text-subtle flex items-center gap-2 text-sm">
            <Icon name="loader" className="h-4 w-4 animate-spin" />
            {t("assistant_working")}
          </div>
        )}
      </div>
      <div className="pt-2">{composer}</div>
    </div>
  );
}

function describeAction(action: Action, t: (key: string, o?: Record<string, unknown>) => string) {
  switch (action.type) {
    case "service_created":
      return t("assistant_did_create", { title: action.title, minutes: action.minutes });
    case "service_updated":
      return t("assistant_did_update", { title: action.title });
    case "profile_updated":
      return t("assistant_did_profile");
    case "look_updated":
      return t("assistant_did_look");
  }
}
