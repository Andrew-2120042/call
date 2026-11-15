import type { PrismaClient } from "@calcom/prisma";
import type { MembershipRole } from "@calcom/prisma/enums";

export type TeamProfile = {
  id: number;
  name: string;
  slug: string | null;
  logoUrl: string | null;
  bio: string | null;
  hideBookATeamMember: boolean;
};

export type TeamMemberRow = {
  membershipId: number;
  userId: number;
  role: MembershipRole;
  accepted: boolean;
  name: string | null;
  email: string;
  username: string | null;
  avatarUrl: string | null;
  /** False for someone invited by email who has not created an account yet. */
  hasAccount: boolean;
};

export type TeamListItem = TeamProfile & {
  role: MembershipRole;
  accepted: boolean;
  memberCount: number;
};

const teamProfileSelect = {
  id: true,
  name: true,
  slug: true,
  logoUrl: true,
  bio: true,
  hideBookATeamMember: true,
} as const;

export class TeamManagementRepository {
  constructor(private readonly prismaClient: PrismaClient) {}

  async findById(teamId: number): Promise<TeamProfile | null> {
    return this.prismaClient.team.findFirst({
      where: { id: teamId, isOrganization: false, parentId: null },
      select: teamProfileSelect,
    });
  }

  async findBySlug(slug: string): Promise<TeamProfile | null> {
    return this.prismaClient.team.findFirst({
      where: { slug, isOrganization: false, parentId: null },
      select: teamProfileSelect,
    });
  }

  async isSlugTaken({ slug, excludeTeamId }: { slug: string; excludeTeamId?: number }): Promise<boolean> {
    const team = await this.prismaClient.team.findFirst({
      where: { slug, parentId: null, ...(excludeTeamId ? { id: { not: excludeTeamId } } : {}) },
      select: { id: true },
    });
    return !!team;
  }

  async createWithOwner({
    name,
    slug,
    bio,
    ownerId,
    ownerRole,
  }: {
    name: string;
    slug: string;
    bio: string | null;
    ownerId: number;
    ownerRole: MembershipRole;
  }): Promise<TeamProfile> {
    return this.prismaClient.team.create({
      data: {
        name,
        slug,
        bio,
        members: { create: { userId: ownerId, role: ownerRole, accepted: true } },
      },
      select: teamProfileSelect,
    });
  }

  async update(
    teamId: number,
    data: Partial<Pick<TeamProfile, "name" | "slug" | "bio" | "logoUrl" | "hideBookATeamMember">>
  ): Promise<TeamProfile> {
    return this.prismaClient.team.update({ where: { id: teamId }, data, select: teamProfileSelect });
  }

  async delete(teamId: number): Promise<void> {
    await this.prismaClient.$transaction([
      this.prismaClient.verificationToken.deleteMany({ where: { teamId } }),
      this.prismaClient.team.delete({ where: { id: teamId } }),
    ]);
  }

  async listForUser(userId: number): Promise<TeamListItem[]> {
    const memberships = await this.prismaClient.membership.findMany({
      where: { userId, team: { isOrganization: false, parentId: null } },
      orderBy: { createdAt: "asc" },
      select: {
        role: true,
        accepted: true,
        team: {
          select: {
            ...teamProfileSelect,
            _count: { select: { members: { where: { accepted: true } } } },
          },
        },
      },
    });
    return memberships.map(({ role, accepted, team: { _count, ...team } }) => ({
      ...team,
      role,
      accepted,
      memberCount: _count.members,
    }));
  }

  async findMembership({ userId, teamId }: { userId: number; teamId: number }) {
    return this.prismaClient.membership.findUnique({
      where: { userId_teamId: { userId, teamId } },
      select: { id: true, userId: true, teamId: true, role: true, accepted: true },
    });
  }

  async findMembershipById(membershipId: number) {
    return this.prismaClient.membership.findUnique({
      where: { id: membershipId },
      select: { id: true, userId: true, teamId: true, role: true, accepted: true },
    });
  }

  async listMembers(teamId: number): Promise<TeamMemberRow[]> {
    const memberships = await this.prismaClient.membership.findMany({
      where: { teamId },
      orderBy: [{ accepted: "desc" }, { createdAt: "asc" }],
      select: {
        id: true,
        role: true,
        accepted: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            avatarUrl: true,
            password: { select: { userId: true } },
          },
        },
      },
    });
    return memberships.map(({ id, role, accepted, user }) => ({
      membershipId: id,
      userId: user.id,
      role,
      accepted,
      name: user.name,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl,
      hasAccount: !!user.password || !!user.username,
    }));
  }

  async findUserByEmail(email: string) {
    return this.prismaClient.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, locale: true, username: true },
    });
  }

  async findUserById(userId: number) {
    return this.prismaClient.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, locale: true },
    });
  }

  /** Placeholder account for an invited email; signup with the invite token turns it into a real account. */
  async createInvitedUser({ email, teamId }: { email: string; teamId: number }) {
    return this.prismaClient.user.create({
      data: { email, invitedTo: teamId },
      select: { id: true, email: true, name: true, locale: true, username: true },
    });
  }

  async createMembership({
    userId,
    teamId,
    role,
    accepted,
  }: {
    userId: number;
    teamId: number;
    role: MembershipRole;
    accepted: boolean;
  }) {
    return this.prismaClient.membership.create({
      data: { userId, teamId, role, accepted },
      select: { id: true },
    });
  }

  async acceptMembership({ userId, teamId }: { userId: number; teamId: number }): Promise<void> {
    await this.prismaClient.membership.update({
      where: { userId_teamId: { userId, teamId } },
      data: { accepted: true },
    });
  }

  async updateRole({ membershipId, role }: { membershipId: number; role: MembershipRole }): Promise<void> {
    await this.prismaClient.membership.update({ where: { id: membershipId }, data: { role } });
  }

  /** Removing someone also takes them off every team service they were hosting. */
  async deleteMembership({ userId, teamId }: { userId: number; teamId: number }): Promise<void> {
    await this.prismaClient.$transaction([
      this.prismaClient.host.deleteMany({ where: { userId, eventType: { teamId } } }),
      this.prismaClient.membership.delete({ where: { userId_teamId: { userId, teamId } } }),
    ]);
  }

  async createToken({
    identifier,
    token,
    expires,
    teamId,
  }: {
    identifier: string;
    token: string;
    expires: Date;
    teamId: number;
  }): Promise<void> {
    await this.prismaClient.verificationToken.create({
      data: { identifier, token, expires, teamId },
    });
  }

  async deleteTokensByIdentifier({
    identifier,
    teamId,
  }: {
    identifier: string;
    teamId: number;
  }): Promise<void> {
    await this.prismaClient.verificationToken.deleteMany({ where: { identifier, teamId } });
  }

  async findActiveTokenByIdentifier({
    identifier,
    teamId,
    now,
  }: {
    identifier: string;
    teamId: number;
    now: Date;
  }) {
    return this.prismaClient.verificationToken.findFirst({
      where: { identifier, teamId, expires: { gt: now } },
      orderBy: { createdAt: "desc" },
      select: { token: true, expires: true },
    });
  }

  async findToken(token: string) {
    return this.prismaClient.verificationToken.findUnique({
      where: { token },
      select: { id: true, identifier: true, expires: true, teamId: true },
    });
  }

  async deleteToken(tokenId: number): Promise<void> {
    await this.prismaClient.verificationToken.delete({ where: { id: tokenId } });
  }

  async countTeamServices(teamId: number): Promise<number> {
    return this.prismaClient.eventType.count({ where: { teamId } });
  }
}
