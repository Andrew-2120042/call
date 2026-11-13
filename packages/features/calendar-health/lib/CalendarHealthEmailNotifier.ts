import { CalendarBrokenEmail } from "@calcom/emails/templates/calendar-health-email";
import { getTranslation } from "@calcom/i18n/server";
import { WEBAPP_URL } from "@calcom/lib/constants";
import { prisma } from "@calcom/prisma";
import type { ICalendarHealthNotifier } from "../services/CalendarHealthService";

export class CalendarHealthEmailNotifier implements ICalendarHealthNotifier {
  async sendBroken(params: { userId: number; appName: string; error: string }) {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { name: true, email: true, locale: true },
    });
    if (!user) return;
    const t = await getTranslation(user.locale || "en", "common");
    await new CalendarBrokenEmail({
      to: { name: user.name || user.email, email: user.email },
      appName: params.appName,
      error: params.error,
      reconnectUrl: `${WEBAPP_URL}/apps/installed/calendar`,
      t,
    }).sendEmail();
  }
}
