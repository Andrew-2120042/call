"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useBookingConfirmation } from "@calcom/web/components/booking/hooks/useBookingConfirmation";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button } from "@calcom/ui/components/button";
import { TextArea } from "@calcom/ui/components/form";

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
          <Button color="destructive" onClick={() => decide(false)} loading={isPending}>
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
      <div className="mt-3 flex justify-end gap-2">
        <Button
          color="secondary"
          StartIcon="x"
          onClick={() => setDeclining(true)}
          disabled={isPending}
          data-testid="host-decline">
          {t("decline_booking")}
        </Button>
        <Button StartIcon="check" onClick={() => decide(true)} loading={isPending} data-testid="host-accept">
          {t("accept_booking")}
        </Button>
      </div>
    </div>
  );
}
