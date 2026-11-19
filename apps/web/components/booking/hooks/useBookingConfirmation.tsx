import { useLocale } from "@calcom/lib/hooks/useLocale";
import { BookingStatus } from "@calcom/prisma/enums";
import { trpc } from "@calcom/trpc/react";
import { showToast } from "@calcom/ui/components/toast";
import { useState } from "react";

interface UseBookingConfirmationOptions {
  isRecurring?: boolean;
  isTabRecurring?: boolean;
  isTabUnconfirmed?: boolean;
  /** A client asks for a weekly series in one go, so a yes or no from their request answers every session. */
  wholeSeries?: boolean;
}

interface BookingConfirmParams {
  bookingId: number;
  confirmed: boolean;
  recurringEventId?: string | null;
  reason?: string;
}

export function useBookingConfirmation(options: UseBookingConfirmationOptions = {}) {
  const { t } = useLocale();
  const utils = trpc.useUtils();
  const [rejectionDialogIsOpen, setRejectionDialogIsOpen] = useState(false);

  const { isRecurring = false, wholeSeries = false } = options;

  const mutation = trpc.viewer.bookings.confirm.useMutation({
    onSuccess: (data) => {
      if (data?.status === BookingStatus.REJECTED) {
        setRejectionDialogIsOpen(false);
        showToast(t("booking_rejection_success"), "success");
      } else {
        showToast(t("booking_confirmation_success"), "success");
      }
      utils.viewer.bookings.invalidate();
      utils.viewer.me.bookingUnconfirmedCount.invalidate();
      utils.viewer.home.invalidate();
    },
    onError: (error) => {
      showToast(error.message || t("booking_confirmation_failed"), "error");
      utils.viewer.bookings.invalidate();
    },
  });

  const bookingConfirm = ({ bookingId, confirmed, recurringEventId, reason }: BookingConfirmParams) => {
    let body = {
      bookingId,
      confirmed,
      reason: reason || "",
    };

    // A request for a weekly series is answered for every session, wherever the host answers it.
    if (recurringEventId && (wholeSeries || isRecurring)) {
      body = Object.assign({}, body, { recurringEventId });
    }

    mutation.mutate(body);
  };

  const handleReject = () => {
    setRejectionDialogIsOpen(true);
  };

  return {
    bookingConfirm,
    handleReject,
    rejectionDialogIsOpen,
    setRejectionDialogIsOpen,
    isPending: mutation.isPending,
  };
}
