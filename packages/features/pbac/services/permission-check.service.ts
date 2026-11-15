import { prisma as defaultPrisma } from "@calcom/prisma";
import type { PrismaClient } from "@calcom/prisma";
import { MembershipRole } from "@calcom/prisma/enums";

type CheckArgs = {
  userId: number;
  teamId?: number | null;
  /** Kept for call-site compatibility; access is decided by team role. */
  permission?: string;
  fallbackRoles?: MembershipRole[];
};

type TeamIdsArgs = {
  userId: number;
  permission?: string;
  fallbackRoles?: MembershipRole[];
  orgId?: number | null;
};

const DEFAULT_ROLES: MembershipRole[] = [MembershipRole.ADMIN, MembershipRole.OWNER];

/**
 * Team access checks based on accepted membership and role. A user only ever has a permission on a team
 * they have joined, with one of the roles the caller allows (admins and owners by default).
 */
export class PermissionCheckService {
  private readonly prismaClient: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prismaClient = prismaClient ?? defaultPrisma;
  }

  async checkPermission({ userId, teamId, fallbackRoles }: CheckArgs): Promise<boolean> {
    if (!teamId) return false;
    const roles = fallbackRoles?.length ? fallbackRoles : DEFAULT_ROLES;
    const membership = await this.prismaClient.membership.findFirst({
      where: { userId, teamId, accepted: true, role: { in: roles } },
      select: { id: true },
    });
    return !!membership;
  }

  async hasPermission(args: CheckArgs): Promise<boolean> {
    return this.checkPermission(args);
  }

  async getTeamIdsWithPermission({ userId, fallbackRoles }: TeamIdsArgs): Promise<number[]> {
    const roles = fallbackRoles?.length ? fallbackRoles : DEFAULT_ROLES;
    const memberships = await this.prismaClient.membership.findMany({
      where: { userId, accepted: true, role: { in: roles } },
      select: { teamId: true },
    });
    return memberships.map((membership) => membership.teamId);
  }
}
