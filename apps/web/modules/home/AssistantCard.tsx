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

/** The assistant on Home: owners describe what they want and it sets it up (services, bio, look). */
export function AssistantCard() {
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

  return (
    <section className="bg-default border-subtle rounded-3xl border p-5" data-testid="assistant-card">
      <div className="flex items-center gap-2">
        <Icon name="sparkles" className="text-emphasis h-4 w-4" />
        <h2 className="text-emphasis text-base font-semibold">{t("assistant_title")}</h2>
      </div>
      <p className="text-subtle mt-1 text-sm">{t("assistant_subtitle")}</p>

      {turns.length > 0 && (
        <div ref={listRef} className="mt-4 max-h-[320px] space-y-3 overflow-y-auto pr-1" aria-live="polite">
          {turns.map((turn, index) => (
            <div
              key={index}
              className={classNames("flex", turn.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={classNames(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  turn.role === "user" ? "bg-inverted text-inverted" : "bg-subtle text-emphasis"
                )}>
                <p className="whitespace-pre-line">{turn.content}</p>
                {!!turn.actions?.length && (
                  <ul className="border-subtle mt-2 space-y-1 border-t pt-2 text-xs">
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
      )}

      <form
        className="border-default focus-within:border-emphasis mt-4 flex items-end gap-2 rounded-2xl border bg-transparent p-2 transition-colors"
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}>
        <textarea
          rows={1}
          value={draft}
          disabled={!configured}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(draft);
            }
          }}
          placeholder={configured ? t("assistant_placeholder") : t("assistant_not_configured")}
          aria-label={t("assistant_title")}
          className="text-emphasis placeholder:text-muted max-h-32 min-h-[40px] flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm focus:outline-none focus:ring-0"
        />
        <button
          type="submit"
          disabled={!configured || !draft.trim() || chat.isPending}
          aria-label={t("assistant_send")}
          className="bg-inverted text-inverted grid h-9 w-9 flex-none place-items-center rounded-full transition-opacity disabled:opacity-30">
          <Icon name="arrow-up" className="h-4 w-4" />
        </button>
      </form>

      {turns.length === 0 && configured && (
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => send(t(key))}
              className="border-subtle text-default hover:border-emphasis rounded-full border px-3 py-1.5 text-xs transition-colors">
              {t(key)}
            </button>
          ))}
        </div>
      )}
    </section>
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
