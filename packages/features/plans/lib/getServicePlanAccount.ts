import { prisma } from "@calcom/prisma";
import { MembershipRole } from "@calcom/prisma/enums";

/**
 * Whose plan covers a service's paid settings: the owner of a personal service, or the owner of the team
 * for a team service (so admins on a Free account can still use what the team pays for).
 */
export async function getServicePlanAccountId(eventTypeId: number): Promise<number | null> {
  const eventType = await prisma.eventType.findUnique({
    where: { id: eventTypeId },
    select: { userId: true, teamId: true },
  });
  if (!eventType) return null;
  if (!eventType.teamId) return eventType.userId;
  const owner = await prisma.membership.findFirst({
    where: { teamId: eventType.teamId, role: MembershipRole.OWNER, accepted: true },
    select: { userId: true },
  });
  return owner?.userId ?? null;
}
