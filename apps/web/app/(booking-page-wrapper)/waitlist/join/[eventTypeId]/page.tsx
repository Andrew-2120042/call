"use client";

import dayjs from "@calcom/dayjs";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button } from "@calcom/ui/components/button";
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
  takenTimes: { start: string; end: string }[];
};

const RAW = { interpolation: { escapeValue: false } };

export default function JoinWaitlistPage() {
  const { t, i18n } = useLocale();
  const params = useParams();
  const searchParams = useSearchParams();
  const eventTypeId = Number(params?.eventTypeId);
  const timeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const [date, setDate] = useState(searchParams?.get("date") ?? dayjs().add(1, "day").format("YYYY-MM-DD"));
  const [options, setOptions] = useState<Options | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<{ start: string; end: string } | null>(null);
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
    const common = "border-default w-full rounded-md border px-3 py-2";
    if (field.type === "textarea") {
      return (
        <textarea
          className={common}
          required={field.required}
          value={(value as string) ?? ""}
          onChange={(e) => set(e.target.value)}
        />
      );
    }
    if ((field.type === "select" || field.type === "radio") && field.options) {
      return (
        <select
          className={common}
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
      );
    }
    if (field.type === "boolean") {
      return <input type="checkbox" checked={!!value} onChange={(e) => set(e.target.checked)} />;
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
        type={inputType}
        className={common}
        required={field.required}
        value={(value as string) ?? ""}
        onChange={(e) => set(e.target.value)}
      />
    );
  };

  return (
    <main className="bg-subtle flex min-h-screen justify-center px-4 py-12">
      <div className="bg-default border-subtle w-full max-w-lg rounded-2xl border p-8 shadow-sm">
        {loadError && <p className="text-subtle">{loadError}</p>}
        {!loadError && !options && <p className="text-subtle">{t("loading")}</p>}
        {options && result && (
          <div className="text-center">
            <h1 className="text-emphasis text-xl font-semibold">{t("waitlist_joined_title")}</h1>
            <p className="text-subtle mt-2">{t("waitlist_join_position", { position: result.position })}</p>
          </div>
        )}
        {options && !result && (
          <>
            <h1 className="text-emphasis text-xl font-semibold">
              {t("waitlist_join_title", { title: options.title, ...RAW })}
            </h1>
            {options.hostName && <p className="text-subtle">{options.hostName}</p>}
            <p className="text-subtle mt-2 text-sm">{t("waitlist_join_help")}</p>

            <label className="text-emphasis mt-5 block text-sm font-medium">
              {t("date")}
              <input
                type="date"
                className="border-default mt-1 block rounded-md border px-3 py-2"
                value={date}
                min={dayjs().format("YYYY-MM-DD")}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>

            <div className="mt-4 flex flex-wrap gap-2">
              {options.takenTimes.length === 0 && (
                <p className="text-subtle text-sm">{t("waitlist_join_no_taken")}</p>
              )}
              {options.takenTimes.map((slot) => (
                <button
                  key={slot.start}
                  type="button"
                  aria-pressed={selected?.start === slot.start}
                  onClick={() => setSelected(slot)}
                  className={`rounded-full border px-4 py-2 text-sm ${selected?.start === slot.start ? "bg-inverted text-inverted border-transparent" : "border-default text-default"}`}>
                  {dayjs(slot.start).tz(timeZone).format("h:mma")}
                </button>
              ))}
            </div>

            {selected && (
              <form className="mt-6 space-y-4" onSubmit={submit}>
                {options.fields.map((field) => (
                  <label key={field.name} className="block text-sm">
                    <span className="text-emphasis font-medium">
                      {t(field.label)}
                      {!field.required && <span className="text-subtle"> ({t("optional")})</span>}
                    </span>
                    <span className="mt-1 block">{fieldInput(field)}</span>
                  </label>
                ))}
                {submitError && <p className="text-sm text-red-600">{submitError}</p>}
                <Button type="submit" className="w-full justify-center" loading={submitting}>
                  {t("waitlist_join_cta", {
                    time: dayjs(selected.start).tz(timeZone).format("ddd, MMM D h:mma"),
                    ...RAW,
                  })}
                </Button>
              </form>
            )}
          </>
        )}
      </div>
    </main>
  );
}
