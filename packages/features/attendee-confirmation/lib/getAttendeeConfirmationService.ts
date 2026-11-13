import {
  AttendeeConfirmationRequestEmail,
  HostUnconfirmedBookingEmail,
} from "@calcom/emails/templates/attendee-confirmation-email";
import { getTranslation } from "@calcom/i18n/server";
import { getPlanService } from "@calcom/features/plans/lib/getPlanService";
import { WEBAPP_URL } from "@calcom/lib/constants";
import logger from "@calcom/lib/logger";
import { prisma } from "@calcom/prisma";
import {
  AttendeeConfirmationRepository,
  type ConfirmationBooking,
} from "../repositories/AttendeeConfirmationRepository";
import {
  AttendeeConfirmationService,
  type IAttendeeConfirmationNotifier,
  type ReleaseBooking,
} from "../services/AttendeeConfirmationService";

const log = logger.getSubLogger({ prefix: ["[attendee-confirmation]"] });

const hostNameOf = (booking: ConfirmationBooking) =>
  booking.user?.name || booking.user?.username || booking.eventType?.title || "";

const notifier: IAttendeeConfirmationNotifier = {
  async sendRequest({ booking, confirmUrl, deadline }) {
    const attendee = booking.attendees[0];
    const t = await getTranslation(attendee.locale || "en", "common");
    await new AttendeeConfirmationRequestEmail({
      to: { name: attendee.name, email: attendee.email, timeZone: attendee.timeZone },
      serviceTitle: booking.eventType?.title ?? booking.title,
      startTime: booking.startTime,
      hostName: hostNameOf(booking),
      confirmUrl,
      deadline,
      t,
    }).sendEmail();
  },
  async sendMissedToHost({ booking, released }) {
    if (!booking.user) return;
    const t = await getTranslation(booking.user.locale || "en", "common");
    await new HostUnconfirmedBookingEmail({
      to: { name: booking.user.name ?? "", email: booking.user.email, timeZone: booking.user.timeZone },
      serviceTitle: booking.eventType?.title ?? booking.title,
      startTime: booking.startTime,
      attendeeName: booking.attendees[0]?.name ?? "",
      released,
      bookingUrl: `${WEBAPP_URL}/booking/${booking.uid}`,
      t,
    }).sendEmail();
  },
};

// Cancels through the regular cancellation flow (as the host) so calendars, emails, webhooks and the
// waitlist all react exactly as they would to a manual cancellation.
const releaseBooking: ReleaseBooking = async (booking) => {
  if (!booking.user) throw new Error(`Booking ${booking.id} has no host`);
  const { getBookingCancelService } = await import(
    "@calcom/features/bookings/di/BookingCancelService.container"
  );
  const t = await getTranslation(booking.user.locale || "en", "common");
  await getBookingCancelService().cancelBooking({
    bookingData: {
      uid: booking.uid,
      cancellationReason: t("attendance_confirm_deadline_passed"),
      cancelledBy: booking.user.email,
    },
    bookingMeta: { userId: booking.user.id },
  });
};

let service: AttendeeConfirmationService | null = null;

export function getAttendeeConfirmationService(): AttendeeConfirmationService {
  if (service) return service;
  service = new AttendeeConfirmationService({
    repository: new AttendeeConfirmationRepository(prisma),
    notifier,
    releaseBooking,
    webappUrl: WEBAPP_URL,
    logger: log,
    isHostEntitled: (userId) => getPlanService().hasFeature(userId, "confirmOrRelease"),
  });
  return service;
}
