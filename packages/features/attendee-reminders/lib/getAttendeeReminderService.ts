import { AttendeeReminderEmail } from "@calcom/emails/templates/attendee-confirmation-email";
import { getTranslation } from "@calcom/i18n/server";
import { WEBAPP_URL } from "@calcom/lib/constants";
import logger from "@calcom/lib/logger";
import { prisma } from "@calcom/prisma";
import { AttendeeReminderRepository } from "../repositories/AttendeeReminderRepository";
import { AttendeeReminderService, type IAttendeeReminderNotifier } from "../services/AttendeeReminderService";

const notifier: IAttendeeReminderNotifier = {
  async sendReminder({ booking, attendee, manageUrl }) {
    const t = await getTranslation(attendee.locale || "en", "common");
    await new AttendeeReminderEmail({
      to: { name: attendee.name, email: attendee.email, timeZone: attendee.timeZone },
      serviceTitle: booking.eventType?.title ?? booking.title,
      startTime: booking.startTime,
      hostName: booking.user?.name || booking.user?.username || "",
      manageUrl,
      t,
    }).sendEmail();
  },
};

let service: AttendeeReminderService | null = null;

export function getAttendeeReminderService(): AttendeeReminderService {
  if (service) return service;
  service = new AttendeeReminderService({
    repository: new AttendeeReminderRepository(prisma),
    notifier,
    webappUrl: WEBAPP_URL,
    logger: logger.getSubLogger({ prefix: ["[reminders]"] }),
  });
  return service;
}
