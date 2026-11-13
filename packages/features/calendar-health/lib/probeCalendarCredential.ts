import {
  getCalendarCredentials,
  getConnectedCalendars,
} from "@calcom/features/calendars/lib/CalendarManager";
import { buildNonDelegationCredentials } from "@calcom/lib/delegationCredential";
import { prisma } from "@calcom/prisma";
import { credentialForCalendarServiceSelect } from "@calcom/prisma/selects/credential";
import type { ProbeResult } from "../services/CalendarHealthService";

/** Lists the connection's calendars, the same call the app makes when showing them; any error means it's broken. */
export async function probeCalendarCredential(credentialId: number): Promise<ProbeResult> {
  const credential = await prisma.credential.findUnique({
    where: { id: credentialId },
    select: credentialForCalendarServiceSelect,
  });
  if (!credential) return { ok: true };
  const calendarCredentials = getCalendarCredentials(buildNonDelegationCredentials([credential]));
  if (calendarCredentials.length === 0) return { ok: true };
  const { connectedCalendars } = await getConnectedCalendars(calendarCredentials, [], undefined);
  const failed = connectedCalendars.find((calendar) => calendar.error);
  return failed?.error ? { ok: false, error: failed.error.message } : { ok: true };
}
