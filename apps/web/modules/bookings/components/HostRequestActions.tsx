"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button } from "@calcom/ui/components/button";
import { TextArea } from "@calcom/ui/components/form";
import { useBookingConfirmation } from "@calcom/web/components/booking/hooks/useBookingConfirmation";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** Accept or decline a booking request from its own page; declining can carry an optional note to the client. */
export function HostRequestActions({ bookingId }: { bookingId: number }) {
  const { t } = useLocale();
  const router = useRouter();
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState("");
  const { bookingConfirm, isPending } = useBookingConfirmation({});

  const decide = (confirmed: boolean) => {
    bookingConfirm({ bookingId, confirmed, reason: confirmed ? undefined : reason });
    // The page is server-rendered; refresh once the change has had a moment to land.
    setTimeout(() => router.refresh(), 1200);
  };

  if (declining) {
    return (
      <div className="border-subtle space-y-3 border-t pt-4">
        <p className="text-emphasis text-xs font-semibold">{t("decline_booking")}</p>
        <TextArea
          name="rejectionReason"
          placeholder={t("decline_note_placeholder")}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
        />
        <div className="flex justify-end gap-2">
          <Button color="secondary" onClick={() => setDeclining(false)} disabled={isPending}>
            {t("cancel")}
          </Button>
          <Button
            size="lg"
            color="secondary"
            onClick={() => decide(false)}
            loading={isPending}
            className="h-10">
            {t("decline_request")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-subtle border-t pt-4">
      <p className="text-emphasis text-xs font-semibold">{t("request_decide_title")}</p>
      <p className="text-subtle mt-0.5 text-xs">{t("request_decide_hint")}</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Button
          size="lg"
          color="secondary"
          StartIcon="x"
          onClick={() => setDeclining(true)}
          disabled={isPending}
          className="h-11 justify-center text-sm"
          data-testid="host-decline">
          {t("decline_booking")}
        </Button>
        <Button
          size="lg"
          StartIcon="check"
          onClick={() => decide(true)}
          loading={isPending}
          className="h-11 justify-center text-sm"
          data-testid="host-accept">
          {t("accept_booking")}
        </Button>
      </div>
    </div>
  );
}
