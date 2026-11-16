"use client";

import { DOCS_URL, SUPPORT_MAIL_ADDRESS } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import classNames from "@calcom/ui/classNames";
import { Button } from "@calcom/ui/components/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@calcom/ui/components/dialog";
import { showToast } from "@calcom/ui/components/toast";
import { useEffect, useState } from "react";

export const OPEN_FEEDBACK_EVENT = "sw:open-feedback";
const KINDS = ["feedback", "problem", "question"] as const;
type Kind = (typeof KINDS)[number];

/** "Help & feedback" from the sidebar: write to us without leaving the app, or jump to the docs. */
export function FeedbackDialog() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<Kind>("feedback");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(OPEN_FEEDBACK_EVENT, show);
    return () => window.removeEventListener(OPEN_FEEDBACK_EVENT, show);
  }, []);

  const send = async () => {
    setSending(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind, message, page: window.location.pathname }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.message || t("something_went_wrong"));
      showToast(t("feedback_sent"), "success");
      setMessage("");
      setOpen(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("something_went_wrong"), "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent data-testid="feedback-dialog">
        <DialogTitle className="text-emphasis text-lg font-semibold">{t("help_and_feedback")}</DialogTitle>
        <DialogDescription className="text-subtle mt-1 text-sm">{t("feedback_description")}</DialogDescription>
        <div className="mt-4 flex gap-2" role="radiogroup" aria-label={t("feedback_kind_label")}>
          {KINDS.map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={kind === option}
              onClick={() => setKind(option)}
              className={classNames(
                "rounded-full border px-3 py-1.5 text-sm transition",
                kind === option
                  ? "border-emphasis bg-inverted text-inverted"
                  : "border-default text-default hover:border-emphasis"
              )}
              data-testid={`feedback-kind-${option}`}>
              {t(`feedback_kind_${option}`)}
            </button>
          ))}
        </div>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={4000}
          rows={5}
          placeholder={t(`feedback_placeholder_${kind}`)}
          aria-label={t("feedback_message_label")}
          className="border-default bg-default text-emphasis focus:border-emphasis mt-3 w-full resize-none rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none"
          data-testid="feedback-message"
        />
        <p className="text-subtle mt-2 text-xs">
          {t("feedback_reply_note")}{" "}
          <a className="underline" href={DOCS_URL} target="_blank" rel="noreferrer">
            {t("feedback_docs_link")}
          </a>
          {" · "}
          <a className="underline" href={`mailto:${SUPPORT_MAIL_ADDRESS}`}>
            {SUPPORT_MAIL_ADDRESS}
          </a>
        </p>
        <DialogFooter>
          <Button color="secondary" onClick={() => setOpen(false)} disabled={sending}>
            {t("cancel")}
          </Button>
          <Button onClick={send} loading={sending} disabled={message.trim().length < 3} data-testid="feedback-send">
            {t("send")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
