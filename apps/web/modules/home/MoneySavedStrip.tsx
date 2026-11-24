"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Icon } from "@calcom/ui/components/icon";
import { showToast } from "@calcom/ui/components/toast";
import { useState } from "react";

const joinParts = (parts: string[], and: string) =>
  parts.length <= 1 ? (parts[0] ?? "") : `${parts.slice(0, -1).join(", ")} ${and} ${parts[parts.length - 1]}`;

/** "This month Calbee saved you…": the sessions the waitlist and rebooking won back, in dollars once priced. */
export function MoneySavedStrip() {
  const { t } = useLocale();
  const utils = trpc.useUtils();
  const query = trpc.viewer.home.moneySaved.useQuery();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const save = trpc.viewer.home.setSessionValue.useMutation({
    onSuccess: async () => {
      setEditing(false);
      await utils.viewer.home.moneySaved.invalidate();
    },
    onError: (error) => showToast(error.message, "error"),
  });

  if (!query.data) return null;
  const { refilled, rebooked, caught, sessionsSaved, amountSaved, sessionValue } = query.data;
  const nothingYet = sessionsSaved === 0 && caught === 0;
  const parts = [
    refilled > 0 && t(refilled === 1 ? "money_saved_refilled_one" : "money_saved_refilled_other", { count: refilled }),
    rebooked > 0 && t(rebooked === 1 ? "money_saved_rebooked_one" : "money_saved_rebooked_other", { count: rebooked }),
    caught > 0 && t(caught === 1 ? "money_saved_caught_one" : "money_saved_caught_other", { count: caught }),
  ].filter((part): part is string => !!part);

  const submit = () => {
    const value = Math.round(Number(draft));
    if (!Number.isFinite(value) || value < 1) return;
    save.mutate({ value });
  };

  return (
    <section
      className="border-subtle mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border px-5 py-4"
      data-testid="money-saved">
      <div className="min-w-0 flex-1">
        <p className="text-subtle text-[12px] uppercase tracking-wide">{t("money_saved_title")}</p>
        <p className="text-emphasis mt-1 text-[14px] leading-snug">
          {nothingYet
            ? t("money_saved_empty")
            : t("money_saved_line", { parts: joinParts(parts, t("and")) })}
        </p>
      </div>
      {amountSaved !== null && !editing ? (
        <button
          type="button"
          onClick={() => {
            setDraft(String(sessionValue ?? ""));
            setEditing(true);
          }}
          className="text-right"
          title={t("money_saved_edit_price")}>
          <span className="text-emphasis block text-[26px] font-light leading-none tracking-[-0.02em] tabular-nums">
            ${amountSaved.toLocaleString("en-US")}
          </span>
          <span className="text-subtle text-[12px]">{t("money_saved_kept", { price: sessionValue })}</span>
        </button>
      ) : editing || sessionValue === null ? (
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}>
          <label htmlFor="money-saved-price" className="text-subtle text-[12px]">
            {t("money_saved_price_label")}
          </label>
          <span className="border-subtle flex h-8 items-center rounded-md border px-2 text-[13px]">
            $
            <input
              id="money-saved-price"
              inputMode="numeric"
              value={draft}
              onChange={(e) => setDraft(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="120"
              className="w-16 bg-transparent px-1 outline-none"
            />
          </span>
          <button
            type="submit"
            disabled={save.isPending || !draft}
            className="bg-inverted text-inverted h-8 rounded-md px-3 text-[12px] font-medium disabled:opacity-50">
            {t("save")}
          </button>
        </form>
      ) : null}
      {!nothingYet && (
        <Icon name="chart-line" className="text-subtle hidden h-4 w-4 sm:block" aria-hidden />
      )}
    </section>
  );
}
