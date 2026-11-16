"use client";

import dayjs from "@calcom/dayjs";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Icon } from "@calcom/ui/components/icon";
import {
  BookingSummary,
  ClientHeader,
  ClientPageShell,
  fieldClass,
  LoadingCard,
  Notice,
  PrimaryButton,
} from "@calcom/web/modules/client-pages/ClientPage";
import classNames from "classnames";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type Field = {
  name: string;
  type: string;
  label: string;
  required: boolean;
  options: { label: string; value: string }[] | null;
};

type Options = {
  title: string;
  hostName: string | null;
  defaultLocation: string | null;
  fields: Field[];
  takenTimes: { start: string; end: string; waiting: number }[];
};

const RAW = { interpolation: { escapeValue: false } };
const DAYS_SHOWN = 21;

export default function JoinWaitlistPage() {
  const { t, i18n } = useLocale();
  const params = useParams();
  const searchParams = useSearchParams();
  const eventTypeId = Number(params?.eventTypeId);
  const timeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const [date, setDate] = useState(searchParams?.get("date") ?? dayjs().add(1, "day").format("YYYY-MM-DD"));
  const [options, setOptions] = useState<Options | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notAvailable, setNotAvailable] = useState(false);
  const [selected, setSelected] = useState<{ start: string; end: string; waiting: number } | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ position: number } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    setSelected(null);
    const res = await fetch(
      `/api/waitlist/options?eventTypeId=${eventTypeId}&date=${date}&timeZone=${encodeURIComponent(timeZone)}`
    );
    const body = await res.json();
    if (res.status === 404) return setNotAvailable(true);
    if (!res.ok) return setLoadError(body.message ?? t("something_went_wrong"));
    setOptions(body);
  }, [eventTypeId, date, timeZone, t]);

  useEffect(() => {
    if (Number.isInteger(eventTypeId) && eventTypeId > 0) load();
  }, [eventTypeId, load]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected || !options) return;
    setSubmitting(true);
    setSubmitError(null);
    const responses: Record<string, unknown> = { ...answers };
    if (options.defaultLocation) responses.location = { value: options.defaultLocation, optionValue: "" };
    try {
      const res = await fetch("/api/waitlist/join", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          eventTypeId,
          start: selected.start,
          end: selected.end,
          timeZone,
          language: i18n.language || "en",
          responses,
        }),
      });
      const body = await res.json();
      if (!res.ok) setSubmitError(body.message ?? t("something_went_wrong"));
      else setResult({ position: body.position });
    } catch {
      setSubmitError(t("something_went_wrong"));
    } finally {
      setSubmitting(false);
    }
  };

  const fieldInput = (field: Field) => {
    const value = answers[field.name];
    const set = (v: string | boolean) => setAnswers((current) => ({ ...current, [field.name]: v }));
    const id = `wl-${field.name}`;
    if (field.type === "textarea") {
      return (
        <textarea
          id={id}
          className={classNames(fieldClass, "resize-y py-2.5 leading-relaxed")}
          style={{ borderRadius: 14, minHeight: 88 }}
          required={field.required}
          value={(value as string) ?? ""}
          onChange={(e) => set(e.target.value)}
        />
      );
    }
    if ((field.type === "select" || field.type === "radio") && field.options) {
      return (
        <div className="relative">
          <select
            id={id}
            className={classNames(fieldClass, "appearance-none pr-10")}
            style={{ borderRadius: 14, height: 46 }}
            required={field.required}
            value={(value as string) ?? ""}
            onChange={(e) => set(e.target.value)}>
            <option value="" disabled>
              {t("select")}
            </option>
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Icon
            name="chevron-down"
            className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
          />
        </div>
      );
    }
    if (field.type === "boolean") {
      return (
        <input
          id={id}
          type="checkbox"
          className="h-5 w-5 rounded border-emphasis accent-[var(--cal-text-emphasis)]"
          checked={!!value}
          onChange={(e) => set(e.target.checked)}
        />
      );
    }
    const inputType =
      field.type === "email"
        ? "email"
        : field.type === "number"
          ? "number"
          : field.type === "phone"
            ? "tel"
            : "text";
    return (
      <input
        id={id}
        type={inputType}
        className={fieldClass}
        style={{ borderRadius: 14, height: 46 }}
        required={field.required}
        value={(value as string) ?? ""}
        onChange={(e) => set(e.target.value)}
      />
    );
  };

  const today = dayjs().tz(timeZone).startOf("day");
  const days = Array.from({ length: DAYS_SHOWN }, (_, index) => today.add(index, "day"));

  // An expected situation (the service has no waitlist), so it gets a calm message rather than an error.
  if (notAvailable) {
    return (
      <ClientPageShell testId="waitlist-join-page">
        <ClientHeader icon="calendar" title={t("waitlist_unavailable_title")} subtitle={t("waitlist_unavailable_body")} />
      </ClientPageShell>
    );
  }

  if (loadError) {
    return (
      <ClientPageShell testId="waitlist-join-page">
        <ClientHeader
          icon="circle-alert"
          tone="warning"
          title={t("something_went_wrong")}
          subtitle={loadError}
        />
      </ClientPageShell>
    );
  }

  if (!options) {
    return (
      <ClientPageShell testId="waitlist-join-page">
        <LoadingCard />
      </ClientPageShell>
    );
  }

  if (result) {
    return (
      <ClientPageShell testId="waitlist-join-page">
        <ClientHeader
          icon="check"
          tone="success"
          title={t("waitlist_joined_title")}
          subtitle={t("waitlist_join_position", { position: result.position })}
        />
        {selected && (
          <BookingSummary
            title={options.title}
            hostName={options.hostName}
            startTime={selected.start}
            endTime={selected.end}
            timeZone={timeZone}
          />
        )}
      </ClientPageShell>
    );
  }

  return (
    <ClientPageShell wide testId="waitlist-join-page">
      <ClientHeader
        icon="users"
        title={t("waitlist_join_title", { title: options.title, ...RAW })}
        subtitle={
          <>
            {options.hostName && <span className="block font-medium text-emphasis">{options.hostName}</span>}
            {t("waitlist_join_help")}
          </>
        }
      />

      <section className="mt-7">
        <div className="mb-2.5 flex items-baseline justify-between">
          <span className="text-[13px] font-semibold">{t("date")}</span>
          <span className="text-[12.5px] text-muted">{dayjs(date).format("MMMM YYYY")}</span>
        </div>
        <div className="no-scrollbar -mx-1 flex overflow-x-auto px-1 pb-1" style={{ columnGap: 8 }}>
          {days.map((day) => {
            const value = day.format("YYYY-MM-DD");
            const active = value === date;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                aria-label={day.format("dddd, MMMM D")}
                onClick={() => setDate(value)}
                className={classNames(
                  "flex flex-none flex-col items-center border transition",
                  active
                    ? "border-emphasis bg-inverted text-inverted"
                    : "border-default hover:border-emphasis"
                )}
                style={{ width: 56, padding: "9px 0 10px", borderRadius: 16 }}
                data-testid="waitlist-day">
                <span className={classNames("text-[11px] font-semibold uppercase", !active && "text-muted")}>
                  {day.format("ddd")}
                </span>
                <span className="mt-0.5 text-[15.5px] font-bold">{day.format("D")}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-2.5 text-[13px] font-semibold">{t("waitlist_join_pick_time")}</div>
        {options.takenTimes.length === 0 ? (
          <p className="bg-cal-muted px-4 py-3.5 text-[12.5px] text-subtle" style={{ borderRadius: 14 }}>
            {t("waitlist_join_no_taken")}
          </p>
        ) : (
          <div className="flex flex-wrap" style={{ gap: 8 }}>
            {options.takenTimes.map((slot) => {
              const active = selected?.start === slot.start;
              return (
                <button
                  key={slot.start}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelected(slot)}
                  className={classNames(
                    "border text-[13px] font-semibold transition",
                    active
                      ? "border-emphasis bg-inverted text-inverted"
                      : "border-default hover:border-emphasis"
                  )}
                  style={{
                    minHeight: 48,
                    padding: "6px 18px",
                    borderRadius: 16,
                    fontVariantNumeric: "tabular-nums",
                  }}>
                  <span className="block">{dayjs(slot.start).tz(timeZone).format("h:mma")}</span>
                  <span className={classNames("block text-[11px] font-medium", active ? "opacity-70" : "text-subtle")}>
                    {slot.waiting === 0
                      ? t("waitlist_nobody_waiting_short")
                      : t("waitlist_waiting_short", { count: slot.waiting })}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        {selected && (
          <p className="text-subtle mt-3 text-sm" data-testid="waitlist-position-preview">
            {selected.waiting === 0
              ? t("waitlist_you_would_be_first")
              : t("waitlist_you_would_be_nth", { count: selected.waiting, position: selected.waiting + 1 })}
          </p>
        )}
      </section>

      {selected && (
        <form
          className="mt-7 flex flex-col border-t border-subtle pt-6"
          style={{ rowGap: 18 }}
          onSubmit={submit}>
          {options.fields.map((field) => (
            <div key={field.name}>
              <label htmlFor={`wl-${field.name}`} className="mb-1.5 block text-[13px] font-semibold">
                {t(field.label)}
                {!field.required && <span className="font-normal text-muted"> ({t("optional")})</span>}
              </label>
              {fieldInput(field)}
            </div>
          ))}
          {submitError && <Notice tone="error">{submitError}</Notice>}
          <PrimaryButton type="submit" loading={submitting} testId="waitlist-join-submit">
            {t("waitlist_join_cta", {
              time: dayjs(selected.start).tz(timeZone).format("ddd, MMM D h:mma"),
              ...RAW,
            })}
          </PrimaryButton>
        </form>
      )}
    </ClientPageShell>
  );
}
