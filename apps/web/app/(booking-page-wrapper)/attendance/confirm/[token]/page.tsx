"use client";

import dayjs from "@calcom/dayjs";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button } from "@calcom/ui/components/button";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Confirmation = {
  status: "REQUESTED" | "CONFIRMED" | "MISSED" | "CANCELLED";
  deadline: string;
  bookingStatus: string;
  startTime: string;
  timeZone: string;
  eventTitle: string;
  hostName: string | null;
};

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: Confirmation }
  | { kind: "confirmed"; data: Confirmation };

const formatInZone = (iso: string, timeZone: string) =>
  `${dayjs(iso).tz(timeZone).format("dddd, MMMM D, YYYY h:mma")} (${timeZone})`;

// React escapes text itself; i18next escaping on top would print entities like "&#x2F;".
const RAW = { interpolation: { escapeValue: false } };

export default function ConfirmAttendancePage() {
  const { t } = useLocale();
  const params = useParams();
  const token = typeof params?.token === "string" ? params.token : "";
  const [state, setState] = useState<State>({ kind: "loading" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/attendance/confirm?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const body = await res.json();
        if (cancelled) return;
        if (!res.ok)
          return setState({ kind: "error", message: body.message ?? t("attendance_confirm_invalid") });
        setState(
          body.status === "CONFIRMED" ? { kind: "confirmed", data: body } : { kind: "ready", data: body }
        );
      })
      .catch(() => !cancelled && setState({ kind: "error", message: t("attendance_confirm_invalid") }));
    return () => {
      cancelled = true;
    };
  }, [token, t]);

  const confirm = async (data: Confirmation) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/attendance/confirm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.message ?? t("something_went_wrong"));
        return;
      }
      setState({ kind: "confirmed", data });
    } catch {
      setError(t("something_went_wrong"));
    } finally {
      setSubmitting(false);
    }
  };

  const unavailableMessage = (data: Confirmation) =>
    data.bookingStatus !== "ACCEPTED" || data.status === "CANCELLED"
      ? t("attendance_confirm_booking_cancelled")
      : t("attendance_confirm_deadline_passed");

  return (
    <main className="flex min-h-screen items-center justify-center bg-subtle px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-subtle bg-default p-8 text-center shadow-sm">
        {state.kind === "loading" && <p className="text-subtle">{t("loading")}</p>}
        {state.kind === "error" && (
          <>
            <h1 className="text-emphasis text-xl font-semibold">{t("attendance_confirm_title")}</h1>
            <p className="text-subtle mt-2">{state.message}</p>
          </>
        )}
        {(state.kind === "ready" || state.kind === "confirmed") && (
          <>
            <h1 className="text-emphasis text-xl font-semibold">
              {state.kind === "confirmed"
                ? t("attendance_confirmed_title")
                : t("attendee_confirmation_request_title")}
            </h1>
            <p className="text-emphasis mt-4 font-medium">{state.data.eventTitle}</p>
            {state.data.hostName && <p className="text-subtle">{state.data.hostName}</p>}
            <p className="text-default mt-2">{formatInZone(state.data.startTime, state.data.timeZone)}</p>
            {state.kind === "confirmed" ? (
              <p className="text-subtle mt-4">
                {t("attendance_confirmed_body", { hostName: state.data.hostName ?? "", ...RAW })}
              </p>
            ) : state.data.status === "REQUESTED" && new Date(state.data.deadline) > new Date() ? (
              <Button
                className="mt-6 w-full justify-center"
                loading={submitting}
                onClick={() => confirm(state.data)}>
                {t("attendee_confirmation_request_cta")}
              </Button>
            ) : (
              <p className="text-subtle mt-4">{unavailableMessage(state.data)}</p>
            )}
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          </>
        )}
      </div>
    </main>
  );
}
