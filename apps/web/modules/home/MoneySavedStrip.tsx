"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Icon } from "@calcom/ui/components/icon";
import { showToast } from "@calcom/ui/components/toast";
import { useState } from "react";

const joinParts = (parts: string[], and: string) =>
  parts.length <= 1 ? (parts[0] ?? "") : `${parts.slice(0, -1).join(", ")} ${and} ${parts[parts.length - 1]}`;

/** "Saved this month": sessions the waitlist and rebooking won back, each valued at its own service's price. */
export function MoneySavedStrip() {
  const { t } = useLocale();
  const utils = trpc.useUtils();
  const query = trpc.viewer.home.moneySaved.useQuery();
  const [editing, setEditing] = useState(false);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const save = trpc.viewer.home.setServicePrices.useMutation({
    onSuccess: async () => {
      setEditing(false);
      await utils.viewer.home.moneySaved.invalidate();
    },
    onError: (error) => showToast(error.message, "error"),
  });

  if (!query.data) return null;
  const { refilled, rebooked, caught, sessionsSaved, amountSaved, unpriced, services } = query.data;
  const nothingYet = sessionsSaved === 0 && caught === 0;
  const parts = [
    refilled > 0 && t(refilled === 1 ? "money_saved_refilled_one" : "money_saved_refilled_other", { count: refilled }),
    rebooked > 0 && t(rebooked === 1 ? "money_saved_rebooked_one" : "money_saved_rebooked_other", { count: rebooked }),
    caught > 0 && t(caught === 1 ? "money_saved_caught_one" : "money_saved_caught_other", { count: caught }),
  ].filter((part): part is string => !!part);
  // Services that saved sessions this month first, so the prices that matter are at the top.
  const ordered = [...services].sort((a, b) => b.savedThisMonth - a.savedThisMonth);

  const openEditor = () => {
    setDrafts(Object.fromEntries(services.map((s) => [s.id, s.price ? String(s.price) : ""])));
    setEditing(true);
  };
  const submit = () =>
    save.mutate({
      prices: services.map((s) => {
        const value = Math.round(Number(drafts[s.id]));
        return { eventTypeId: s.id, price: drafts[s.id] && value >= 1 ? value : null };
      }),
    });

  return (
    <section className="border-subtle mt-6 rounded-lg border" data-testid="money-saved">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4">
        <div className="min-w-0 flex-1">
          <p className="text-subtle text-[12px] uppercase tracking-wide">{t("money_saved_title")}</p>
          <p className="text-emphasis mt-1 text-[14px] leading-snug">
            {nothingYet ? t("money_saved_empty") : t("money_saved_line", { parts: joinParts(parts, t("and")) })}
          </p>
        </div>
        {amountSaved !== null && (
          <div className="text-right">
            <span className="text-emphasis block text-[26px] font-light leading-none tracking-[-0.02em] tabular-nums">
              ${amountSaved.toLocaleString("en-US")}
            </span>
            <span className="text-subtle text-[12px]">
              {unpriced > 0 ? t("money_saved_kept_partial", { count: unpriced }) : t("money_saved_kept")}
            </span>
          </div>
        )}
        {services.length > 0 && !editing && (
          <button
            type="button"
            onClick={openEditor}
            className="border-subtle text-default hover:text-emphasis inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-[12px] transition">
            <Icon name="pencil" className="h-3.5 w-3.5" />
            {services.some((s) => s.price) ? t("money_saved_edit_prices") : t("money_saved_set_prices")}
          </button>
        )}
      </div>

      {editing && (
        <form
          className="border-subtle border-t px-5 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}>
          <p className="text-subtle text-[12px]">{t("money_saved_prices_help")}</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {ordered.map((service) => (
              <li key={service.id} className="flex items-center justify-between gap-3">
                <label htmlFor={`price-${service.id}`} className="text-emphasis min-w-0 truncate text-[13px]">
                  {service.title}
                  {service.savedThisMonth > 0 && (
                    <span className="text-subtle ml-1.5 text-[12px]">
                      {t("money_saved_service_count", { count: service.savedThisMonth })}
                    </span>
                  )}
                </label>
                <span className="border-subtle flex h-8 flex-none items-center rounded-md border px-2 text-[13px]">
                  $
                  <input
                    id={`price-${service.id}`}
                    inputMode="numeric"
                    value={drafts[service.id] ?? ""}
                    onChange={(e) => setDrafts({ ...drafts, [service.id]: e.target.value.replace(/[^\d]/g, "") })}
                    placeholder="0"
                    className="w-16 bg-transparent px-1 outline-none"
                  />
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(false)} className="text-subtle h-8 px-3 text-[12px]">
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={save.isPending}
              className="bg-inverted text-inverted h-8 rounded-md px-3 text-[12px] font-medium disabled:opacity-50">
              {t("save")}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
