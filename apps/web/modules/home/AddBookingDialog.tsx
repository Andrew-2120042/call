"use client";

import dayjs from "@calcom/dayjs";
import type { BookingCreateBody } from "@calcom/features/bookings/types";
import { post } from "@calcom/lib/fetch-wrapper";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import classNames from "@calcom/ui/classNames";
import { Icon } from "@calcom/ui/components/icon";
import { showToast } from "@calcom/ui/components/toast";
import { useLockBodyScroll } from "@lib/hooks/useLockBodyScroll";
import { useEffect, useMemo, useState } from "react";

type Question = { name: string; type: string; label: string; options: { label: string; value: string }[] };
type Service = { id: number; slug: string; title: string; length: number; questions: Question[] };
type Answer = string | boolean;
// The booking API merges `responses` into the body schema per event type, so it isn't part of BookingCreateBody.
type HostAddBookingBody = BookingCreateBody & { responses: Record<string, unknown> };
type CreatedBooking = { id?: number; status?: string };

/**
 * The host adds a booking straight onto their own calendar: pick a service and one of their free times, type the
 * client's name and email. It goes through the normal booking flow (calendar event, emails, reminders), and a
 * service that normally asks for approval is accepted right away, because the host is the one adding it.
 */
export function AddBookingDialog({
  services,
  username,
  day,
  onClose,
}: {
  services: Service[];
  username: string;
  day: string;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const utils = trpc.useUtils();
  useLockBodyScroll(true);
  const timeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const [serviceId, setServiceId] = useState(services[0]?.id ?? 0);
  const [date, setDate] = useState(day);
  const [slot, setSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const service = services.find((item) => item.id === serviceId);

  const range = useMemo(() => {
    const start = dayjs.tz(date, timeZone).startOf("day");
    return { startTime: start.toISOString(), endTime: start.endOf("day").toISOString() };
  }, [date, timeZone]);
  const schedule = trpc.viewer.slots.getSchedule.useQuery(
    { usernameList: [username], eventTypeId: serviceId, timeZone, isTeamEvent: false, ...range },
    { enabled: !!serviceId && !!username, retry: false, refetchOnWindowFocus: false }
  );
  const times = useMemo(() => {
    const slots = (schedule.data?.slots ?? {}) as Record<string, { time: string }[]>;
    return Object.values(slots)
      .flat()
      .map((entry) => entry.time)
      .filter((time) => dayjs(time).tz(timeZone).format("YYYY-MM-DD") === date);
  }, [schedule.data, date, timeZone]);

  useEffect(() => setSlot(null), [serviceId, date]);
  useEffect(() => setAnswers({}), [serviceId]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const confirm = trpc.viewer.bookings.confirm.useMutation();
  const questions = service?.questions ?? [];
  const answered = questions.every((question) => {
    const value = answers[question.name];
    return question.type === "boolean" ? value === true : typeof value === "string" && value.trim().length > 0;
  });
  const canSave =
    !!service && !!slot && name.trim().length > 0 && /\S+@\S+\.\S+/.test(email) && answered && !saving;
  // Multi-choice questions expect a list even when the host picks one option.
  const answerFor = (question: Question): unknown => {
    const value = answers[question.name];
    return question.type === "checkbox" || question.type === "multiselect" ? [value] : value;
  };

  const save = async () => {
    if (!service || !slot) return;
    setSaving(true);
    setError(null);
    try {
      const booking = await post<HostAddBookingBody, CreatedBooking>("/api/book/event", {
        eventTypeId: service.id,
        eventTypeSlug: service.slug,
        start: dayjs(slot).toISOString(),
        end: dayjs(slot).add(service.length, "minute").toISOString(),
        timeZone,
        language: "en",
        user: username,
        metadata: {},
        responses: {
          name: name.trim(),
          email: email.trim(),
          ...Object.fromEntries(questions.map((question) => [question.name, answerFor(question)])),
        },
      });
      if (booking.status === "PENDING" && typeof booking.id === "number") {
        await confirm.mutateAsync({ bookingId: booking.id, confirmed: true, emailsEnabled: true });
      }
      await Promise.all([utils.viewer.home.calendar.invalidate(), utils.viewer.home.invalidate()]);
      showToast(t("add_booking_done", { name: name.trim() }), "success");
      onClose();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      setError(message || t("add_booking_failed"));
    } finally {
      setSaving(false);
    }
  };

  const field = "border-default bg-default text-emphasis h-9 w-full rounded-md border px-3 text-[13px] outline-none focus:border-emphasis";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" data-testid="add-booking-dialog">
      <button type="button" aria-label={t("close")} className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-booking-title"
        className="bg-default border-subtle relative flex max-h-[90vh] w-full max-w-[460px] flex-col rounded-xl border shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 id="add-booking-title" className="text-emphasis text-[16px] font-semibold">
            {t("add_booking_title")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="text-subtle hover:bg-subtle hover:text-emphasis grid h-7 w-7 place-items-center rounded-md">
            <Icon name="x" className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-2 pt-4">
          <label className="block">
            <span className="text-default mb-1.5 block text-[12px] font-medium">{t("add_booking_service")}</span>
            <select
              value={serviceId}
              onChange={(event) => setServiceId(Number(event.target.value))}
              className={field}>
              {services.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} · {item.length} min
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-default mb-1.5 block text-[12px] font-medium">{t("add_booking_date")}</span>
            <input
              type="date"
              value={date}
              min={dayjs().format("YYYY-MM-DD")}
              onChange={(event) => event.target.value && setDate(event.target.value)}
              className={field}
            />
          </label>
          <div>
            <span className="text-default mb-1.5 block text-[12px] font-medium">{t("add_booking_time")}</span>
            {schedule.isLoading ? (
              <div className="grid grid-cols-4 gap-1.5" aria-hidden>
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className="bg-subtle h-8 animate-pulse rounded-md" />
                ))}
              </div>
            ) : times.length === 0 ? (
              <p className="text-subtle border-subtle rounded-md border border-dashed px-3 py-3 text-[12px]">
                {t("add_booking_no_times")}
              </p>
            ) : (
              <div className="grid max-h-40 grid-cols-4 gap-1.5 overflow-y-auto">
                {times.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSlot(time)}
                    className={classNames(
                      "h-8 rounded-md border text-[12px] transition",
                      slot === time
                        ? "bg-inverted text-inverted border-transparent"
                        : "border-subtle text-default hover:border-emphasis"
                    )}>
                    {dayjs(time).tz(timeZone).format("h:mma")}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-default mb-1.5 block text-[12px] font-medium">{t("add_booking_client_name")}</span>
              <input value={name} onChange={(event) => setName(event.target.value)} className={field} />
            </label>
            <label className="block">
              <span className="text-default mb-1.5 block text-[12px] font-medium">{t("add_booking_client_email")}</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={field}
              />
            </label>
          </div>
          {questions.map((question) => (
            <QuestionInput
              key={question.name}
              question={question}
              value={answers[question.name]}
              onChange={(value) => setAnswers((current) => ({ ...current, [question.name]: value }))}
              className={field}
            />
          ))}
          <p className="text-subtle text-[12px]">{t("add_booking_note")}</p>
          {error && <p className="rounded-md bg-red-500/10 px-3 py-2 text-[12px] text-red-400">{error}</p>}
        </div>
        <div className="border-subtle flex justify-end gap-2 border-t px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="border-subtle text-default hover:bg-subtle h-8 rounded-md border px-3 text-[13px]">
            {t("cancel")}
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={save}
            data-testid="add-booking-save"
            className="bg-inverted text-inverted h-8 rounded-md px-3.5 text-[13px] font-medium disabled:opacity-40">
            {saving ? t("add_booking_saving") : t("add_booking_save")}
          </button>
        </div>
      </div>
    </div>
  );
}

/** One of the service's required booking questions, answered by the host on the client's behalf. */
function QuestionInput({
  question,
  value,
  onChange,
  className,
}: {
  question: Question;
  value: Answer | undefined;
  onChange: (value: Answer) => void;
  className: string;
}) {
  const label = <span className="text-default mb-1.5 block text-[12px] font-medium">{question.label}</span>;
  if (question.type === "boolean") {
    return (
      <label className="text-default flex items-center gap-2 text-[13px]">
        <input type="checkbox" checked={value === true} onChange={(event) => onChange(event.target.checked)} />
        {question.label}
      </label>
    );
  }
  if (question.options.length > 0) {
    return (
      <label className="block">
        {label}
        <select
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          className={className}>
          <option value="" disabled>
            …
          </option>
          {question.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }
  if (question.type === "textarea") {
    return (
      <label className="block">
        {label}
        <textarea
          rows={3}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          className={`${className} h-auto py-2`}
        />
      </label>
    );
  }
  return (
    <label className="block">
      {label}
      <input
        type={question.type === "number" ? "number" : question.type === "phone" ? "tel" : "text"}
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange(event.target.value)}
        className={className}
      />
    </label>
  );
}
