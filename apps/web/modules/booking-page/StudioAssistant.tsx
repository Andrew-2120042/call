"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Icon } from "@calcom/ui/components/icon";
import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import {
  type AssistantAction,
  describeAssistantAction,
} from "@calcom/web/modules/assistant/describeAssistantAction";

type Turn = { role: "user" | "assistant"; content: string; actions?: AssistantAction[] };

const SUGGESTIONS = [
  "assistant_ex_service_prompt",
  "assistant_ex_bio_prompt",
  "assistant_ex_look_prompt",
] as const;

type Props = {
  /** Text to send straight away (from an Enhance suggestion). */
  initialPrompt?: string;
  /** Called after the assistant changed something, so the editor can reload what it shows. */
  onChanged: () => void;
};

/** The assistant inside the editor, so owners never leave the page they're working on. */
export function StudioAssistant({ initialPrompt, onChanged }: Props) {
  const { t } = useLocale();
  const status = trpc.viewer.assistant.status.useQuery();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const sentInitial = useRef(false);
  const configured = status.data?.configured ?? true;

  const chat = trpc.viewer.assistant.chat.useMutation({
    onSuccess: (result) => {
      setTurns((current) => [
        ...current,
        { role: "assistant", content: result.reply, actions: result.actions },
      ]);
      if (result.actions.length) onChanged();
    },
    onError: (error) => setTurns((current) => [...current, { role: "assistant", content: error.message }]),
  });

  const send = (raw: string) => {
    const content = raw.trim();
    if (!content || chat.isPending || !configured) return;
    const next: Turn[] = [...turns, { role: "user", content }];
    setTurns(next);
    setText("");
    chat.mutate({ messages: next.slice(-20).map(({ role, content }) => ({ role, content })) });
  };

  useEffect(() => {
    if (!initialPrompt || sentInitial.current || status.isPending) return;
    sentInitial.current = true;
    send(initialPrompt);
  });

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, chat.isPending]);

  return (
    <div className="flex h-full min-h-[420px] flex-col" data-testid="studio-assistant">
      {!configured && (
        <div className="mb-4 rounded-2xl border border-[#e4e3df] p-4 text-[13px]" role="status">
          <p className="font-semibold">{t("assistant_off_title")}</p>
          <p className="mt-0.5 text-[#6b6a66]">{t("assistant_off_body")}</p>
        </div>
      )}

      <div ref={listRef} className="no-scrollbar flex-1 overflow-y-auto" aria-live="polite">
        {turns.length === 0 ? (
          <div>
            <p className="text-[13px] leading-relaxed text-[#6b6a66]">{t("assistant_subtitle")}</p>
            <div className="mt-4 flex flex-col" style={{ rowGap: 8 }}>
              {SUGGESTIONS.map((key) => (
                <button
                  key={key}
                  type="button"
                  disabled={!configured}
                  onClick={() => send(t(key))}
                  className="rounded-2xl border border-[#ebeae6] px-4 py-3 text-left text-[13.5px] transition hover:border-[#bdbcb7] disabled:opacity-50">
                  {t(key)}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col pb-2" style={{ rowGap: 16 }}>
            {turns.map((turn, index) => (
              <div
                key={index}
                className={classNames("flex", turn.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={classNames(
                    "max-w-[88%] text-[14px] leading-relaxed",
                    turn.role === "user" ? "bg-[#121212] px-4 py-2.5 text-white" : "text-[#121212]"
                  )}
                  style={turn.role === "user" ? { borderRadius: "18px 18px 6px 18px" } : undefined}>
                  <p className="whitespace-pre-line">
                    {turn.content.replace(/\*\*(.+?)\*\*/g, "$1").replace(/^\s*[-*]\s+/gm, "• ")}
                  </p>
                  {!!turn.actions?.length && (
                    <ul
                      className="mt-2.5 flex flex-col rounded-2xl border border-[#ebeae6] p-3 text-[13px]"
                      style={{ rowGap: 6 }}>
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
              <span className="flex items-center gap-2 text-[13px] text-[#6b6a66]">
                <Icon name="loader" className="h-4 w-4 animate-spin" />
                {t("assistant_working")}
              </span>
            )}
          </div>
        )}
      </div>

      <form
        className="mt-3 flex items-end gap-2 rounded-[22px] border border-[#e4e3df] p-1.5 pl-4 focus-within:border-[#121212]"
        onSubmit={(event) => {
          event.preventDefault();
          send(text);
        }}>
        <textarea
          rows={1}
          value={text}
          disabled={!configured}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              send(text);
            }
          }}
          placeholder={t("assistant_placeholder")}
          aria-label={t("assistant_page_title")}
          className="no-scrollbar max-h-32 flex-1 resize-none border-0 bg-transparent py-2 text-[14px] focus:outline-none focus:ring-0"
        />
        <button
          type="submit"
          disabled={!configured || !text.trim() || chat.isPending}
          aria-label={t("assistant_send")}
          className="grid h-9 w-9 flex-none place-items-center rounded-full bg-[#121212] text-white transition-opacity disabled:opacity-25">
          <Icon name="arrow-up" className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
