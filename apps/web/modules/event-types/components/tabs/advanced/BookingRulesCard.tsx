"use client";

import { WEBAPP_URL } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Button } from "@calcom/ui/components/button";
import { showToast } from "@calcom/ui/components/toast";
import { useEffect, useState } from "react";
import { SettingsCardSkeleton } from "~/shell/skeletons";

const REMINDER_CHOICES = [
  { minutes: 10080, key: "booking_rules_reminder_week" },
  { minutes: 2880, key: "booking_rules_reminder_two_days" },
  { minutes: 1440, key: "booking_rules_reminder_day" },
  { minutes: 120, key: "booking_rules_reminder_two_hours" },
  { minutes: 60, key: "booking_rules_reminder_hour" },
] as const;

type Draft = {
  waitlistEnabled: boolean;
  waitlistOfferMode: "IN_ORDER" | "EVERYONE";
  confirmEnabled: boolean;
  attendeeConfirmationHours: number;
  releaseUnconfirmedBookings: boolean;
  attendeeReminderMinutes: number[];
};

/**
 * Nodslot booking rules (waitlist, confirm-or-release, reminders). Saves on its own through the
 * guarded event type update, so plan limits are enforced server-side exactly as for any other save.
 */
export function BookingRulesCard({ eventTypeId }: { eventTypeId: number }) {
  const { t } = useLocale();
  const utils = trpc.useUtils();
  const query = trpc.viewer.bookingRules.get.useQuery({ eventTypeId });
  const [draft, setDraft] = useState<Draft | null>(null);

  useEffect(() => {
    if (!query.data) return;
    setDraft({
      waitlistEnabled: query.data.waitlistEnabled,
      waitlistOfferMode: query.data.waitlistOfferMode,
      confirmEnabled: query.data.attendeeConfirmationHours != null,
      attendeeConfirmationHours: query.data.attendeeConfirmationHours ?? 24,
      releaseUnconfirmedBookings: query.data.releaseUnconfirmedBookings,
      attendeeReminderMinutes: query.data.attendeeReminderMinutes,
    });
  }, [query.data]);

  const mutation = trpc.viewer.eventTypesHeavy.update.useMutation({
    onSuccess: async () => {
      showToast(t("booking_rules_saved"), "success");
      await utils.viewer.bookingRules.get.invalidate({ eventTypeId });
    },
    onError: (error) => showToast(error.message, "error"),
  });

  if (query.isPending || !draft || !query.data) {
    return (
      <div className="mt-6">
        <SettingsCardSkeleton rows={3} />
      </div>
    );
  }
  const { features, limits } = query.data;

  const toggleReminder = (minutes: number) =>
    setDraft((current) => {
      if (!current) return current;
      const selected = current.attendeeReminderMinutes.includes(minutes);
      return {
        ...current,
        attendeeReminderMinutes: selected
          ? current.attendeeReminderMinutes.filter((m) => m !== minutes)
          : [...current.attendeeReminderMinutes, minutes].sort((a, b) => b - a),
      };
    });

  const save = () =>
    mutation.mutate({
      id: eventTypeId,
      waitlistEnabled: draft.waitlistEnabled,
      waitlistOfferMode: draft.waitlistOfferMode,
      attendeeConfirmationHours: draft.confirmEnabled ? draft.attendeeConfirmationHours : null,
      releaseUnconfirmedBookings: draft.releaseUnconfirmedBookings,
      attendeeReminderMinutes: draft.attendeeReminderMinutes,
    });

  const proBadge = <span className="bg-emphasis text-emphasis ml-2 rounded px-1.5 py-0.5 text-xs">Pro</span>;

  return (
    <section className="border-subtle mt-6 rounded-lg border p-6" data-testid="booking-rules-card">
      <h3 className="text-emphasis text-base font-semibold">{t("booking_rules_title")}</h3>
      <p className="text-subtle mt-1 text-sm">{t("booking_rules_description")}</p>

      <label className="mt-5 flex items-start gap-3">
        <input
          type="checkbox"
          className="mt-1"
          checked={draft.waitlistEnabled}
          onChange={(e) => setDraft({ ...draft, waitlistEnabled: e.target.checked })}
        />
        <span>
          <span className="text-emphasis font-medium">{t("booking_rules_waitlist")}</span>
          {!features.waitlist && proBadge}
          <span className="text-subtle block text-sm">{t("booking_rules_waitlist_help")}</span>
          {query.data.waitlistEnabled && (
            <span className="text-subtle mt-1 block text-sm">
              {t("booking_rules_waitlist_link")}{" "}
              <a
                className="underline"
                href={`${WEBAPP_URL}/waitlist/join/${eventTypeId}`}
                target="_blank"
                rel="noreferrer">
                {`${WEBAPP_URL}/waitlist/join/${eventTypeId}`}
              </a>
            </span>
          )}
        </span>
      </label>
      {draft.waitlistEnabled && (
        <fieldset className="ml-7 mt-3 space-y-2" data-testid="waitlist-offer-mode">
          <legend className="text-emphasis mb-1 text-sm font-medium">{t("waitlist_offer_mode_title")}</legend>
          {(["IN_ORDER", "EVERYONE"] as const).map((mode) => (
            <label key={mode} className="flex items-start gap-2 text-sm">
              <input
                type="radio"
                name="waitlistOfferMode"
                className="mt-1"
                checked={draft.waitlistOfferMode === mode}
                onChange={() => setDraft({ ...draft, waitlistOfferMode: mode })}
                data-testid={`waitlist-offer-mode-${mode}`}
              />
              <span>
                <span className="text-emphasis block">
                  {t(mode === "IN_ORDER" ? "waitlist_offer_mode_in_order" : "waitlist_offer_mode_everyone")}
                </span>
                <span className="text-subtle block">
                  {t(
                    mode === "IN_ORDER"
                      ? "waitlist_offer_mode_in_order_help"
                      : "waitlist_offer_mode_everyone_help"
                  )}
                </span>
              </span>
            </label>
          ))}
        </fieldset>
      )}

      <label className="mt-5 flex items-start gap-3">
        <input
          type="checkbox"
          className="mt-1"
          checked={draft.confirmEnabled}
          onChange={(e) => setDraft({ ...draft, confirmEnabled: e.target.checked })}
        />
        <span>
          <span className="text-emphasis font-medium">{t("booking_rules_confirm")}</span>
          {!features.confirmOrRelease && proBadge}
          <span className="text-subtle block text-sm">{t("booking_rules_confirm_help")}</span>
        </span>
      </label>
      {draft.confirmEnabled && (
        <div className="ml-7 mt-3 space-y-3">
          <label className="text-default flex items-center gap-2 text-sm">
            {t("booking_rules_confirm_hours")}
            <input
              type="number"
              min={1}
              max={168}
              className="border-default w-20 rounded-md border px-2 py-1"
              value={draft.attendeeConfirmationHours}
              onChange={(e) => setDraft({ ...draft, attendeeConfirmationHours: Number(e.target.value) })}
            />
          </label>
          <label className="text-default flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.releaseUnconfirmedBookings}
              onChange={(e) => setDraft({ ...draft, releaseUnconfirmedBookings: e.target.checked })}
            />
            {t("booking_rules_release")}
          </label>
        </div>
      )}

      <div className="mt-5">
        <span className="text-emphasis font-medium">{t("booking_rules_reminders")}</span>
        {!features.multipleReminders && (
          <span className="text-subtle ml-2 text-sm">
            {t("booking_rules_reminders_limit", { count: limits.maxRemindersPerService })}
          </span>
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          {draft.attendeeReminderMinutes
            .filter((minutes) => !REMINDER_CHOICES.some((choice) => choice.minutes === minutes))
            .map((minutes) => (
              <button
                key={minutes}
                type="button"
                aria-pressed
                onClick={() => toggleReminder(minutes)}
                className="bg-inverted text-inverted rounded-md border border-transparent px-3 py-1 text-sm">
                {minutes % 1440 === 0
                  ? t("booking_rules_reminder_days", { count: minutes / 1440 })
                  : minutes % 60 === 0
                    ? t("booking_rules_reminder_hours", { count: minutes / 60 })
                    : t("booking_rules_reminder_minutes", { count: minutes })}
              </button>
            ))}
          {REMINDER_CHOICES.map((choice) => {
            const selected = draft.attendeeReminderMinutes.includes(choice.minutes);
            return (
              <button
                key={choice.minutes}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleReminder(choice.minutes)}
                className={`rounded-md border px-3 py-1 text-sm ${
                  selected ? "bg-inverted text-inverted border-transparent" : "border-default text-default"
                }`}>
                {t(choice.key)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <Button type="button" loading={mutation.isPending} onClick={save}>
          {t("booking_rules_save")}
        </Button>
      </div>
    </section>
  );
}
