"use client";

import dayjs from "@calcom/dayjs";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import {
  BookingSummary,
  ClientHeader,
  ClientPageShell,
  LoadingCard,
  Notice,
  PrimaryButton,
} from "@calcom/web/modules/client-pages/ClientPage";
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

  if (state.kind === "loading") {
    return (
      <ClientPageShell testId="attendance-confirm-page">
        <LoadingCard />
      </ClientPageShell>
    );
  }

  if (state.kind === "error") {
    return (
      <ClientPageShell testId="attendance-confirm-page">
        <ClientHeader
          icon="circle-alert"
          tone="warning"
          title={t("attendance_confirm_title")}
          subtitle={state.message}
        />
      </ClientPageShell>
    );
  }

  const { data } = state;
  const confirmed = state.kind === "confirmed";
  const canConfirm = !confirmed && data.status === "REQUESTED" && new Date(data.deadline) > new Date();
  return (
    <ClientPageShell testId="attendance-confirm-page">
      <ClientHeader
        icon={confirmed ? "check" : canConfirm ? "calendar" : "circle-alert"}
        tone={confirmed ? "success" : canConfirm ? "neutral" : "warning"}
        title={confirmed ? t("attendance_confirmed_title") : t("attendee_confirmation_request_title")}
        subtitle={
          confirmed
            ? t("attendance_confirmed_body", { hostName: data.hostName ?? "", ...RAW })
            : canConfirm
              ? t("attendance_confirm_by", {
                  deadline: dayjs(data.deadline).tz(data.timeZone).format("ddd, MMM D, h:mma"),
                  ...RAW,
                })
              : unavailableMessage(data)
        }
      />
      <BookingSummary
        title={data.eventTitle}
        hostName={data.hostName}
        startTime={data.startTime}
        timeZone={data.timeZone}
      />
      {canConfirm && (
        <div className="mt-6">
          <PrimaryButton
            onClick={() => confirm(data)}
            loading={submitting}
            testId="attendance-confirm-button">
            {t("attendee_confirmation_request_cta")}
          </PrimaryButton>
        </div>
      )}
      {error && <Notice tone="error">{error}</Notice>}
    </ClientPageShell>
  );
}
