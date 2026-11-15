import { MembershipRole } from "@calcom/prisma/enums";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TeamManagementRepository } from "../../repositories/TeamManagementRepository";
import { inviteLinkIdentifier, TeamService, type TeamInviteMessage } from "../TeamService";

type User = {
  id: number;
  email: string;
  name: string | null;
  locale: string | null;
  username: string | null;
};
type Membership = { id: number; userId: number; teamId: number; role: MembershipRole; accepted: boolean };
type Token = { id: number; identifier: string; token: string; expires: Date; teamId: number };
type Team = {
  id: number;
  name: string;
  slug: string | null;
  logoUrl: string | null;
  bio: string | null;
  hideBookATeamMember: boolean;
};

const NOW = new Date("2026-11-15T10:00:00Z");

// Enough of the repository's behaviour to exercise the service's rules without a database.
function createFakeRepository() {
  const users: User[] = [
    { id: 1, email: "owner@example.com", name: "Olive", locale: "en", username: "olive" },
    { id: 2, email: "admin@example.com", name: "Ada", locale: "en", username: "ada" },
    { id: 3, email: "member@example.com", name: "Max", locale: "en", username: "max" },
    { id: 4, email: "outsider@example.com", name: "Oscar", locale: "en", username: "oscar" },
  ];
  const teams: Team[] = [];
  const memberships: Membership[] = [];
  const tokens: Token[] = [];
  let nextId = 100;

  const repo = {
    findById: async (teamId: number) => teams.find((team) => team.id === teamId) ?? null,
    findBySlug: async (slug: string) => teams.find((team) => team.slug === slug) ?? null,
    isSlugTaken: async ({ slug, excludeTeamId }: { slug: string; excludeTeamId?: number }) =>
      teams.some((team) => team.slug === slug && team.id !== excludeTeamId),
    createWithOwner: async ({
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
    }) => {
      const team = { id: nextId++, name, slug, bio, logoUrl: null, hideBookATeamMember: false };
      teams.push(team);
      memberships.push({ id: nextId++, userId: ownerId, teamId: team.id, role: ownerRole, accepted: true });
      return team;
    },
    update: async (teamId: number, data: Partial<Team>) => {
      const team = teams.find((t) => t.id === teamId);
      if (!team) throw new Error("missing team");
      Object.assign(team, data);
      return team;
    },
    delete: async (teamId: number) => {
      teams.splice(
        teams.findIndex((team) => team.id === teamId),
        1
      );
    },
    listForUser: async (userId: number) =>
      memberships
        .filter((m) => m.userId === userId)
        .map((m) => ({
          ...(teams.find((team) => team.id === m.teamId) as Team),
          role: m.role,
          accepted: m.accepted,
          memberCount: memberships.filter((x) => x.teamId === m.teamId && x.accepted).length,
        })),
    findMembership: async ({ userId, teamId }: { userId: number; teamId: number }) =>
      memberships.find((m) => m.userId === userId && m.teamId === teamId) ?? null,
    findMembershipById: async (id: number) => memberships.find((m) => m.id === id) ?? null,
    listMembers: async (teamId: number) => memberships.filter((m) => m.teamId === teamId),
    findUserByEmail: async (email: string) => users.find((user) => user.email === email) ?? null,
    findUserById: async (id: number) => users.find((user) => user.id === id) ?? null,
    createInvitedUser: async ({ email }: { email: string; teamId: number }) => {
      const user = { id: nextId++, email, name: null, locale: null, username: null };
      users.push(user);
      return user;
    },
    createMembership: async (data: Omit<Membership, "id">) => {
      const membership = { id: nextId++, ...data };
      memberships.push(membership);
      return { id: membership.id };
    },
    acceptMembership: async ({ userId, teamId }: { userId: number; teamId: number }) => {
      const membership = memberships.find((m) => m.userId === userId && m.teamId === teamId);
      if (membership) membership.accepted = true;
    },
    updateRole: async ({ membershipId, role }: { membershipId: number; role: MembershipRole }) => {
      const membership = memberships.find((m) => m.id === membershipId);
      if (membership) membership.role = role;
    },
    deleteMembership: async ({ userId, teamId }: { userId: number; teamId: number }) => {
      memberships.splice(
        memberships.findIndex((m) => m.userId === userId && m.teamId === teamId),
        1
      );
    },
    createToken: async (data: Omit<Token, "id">) => {
      tokens.push({ id: nextId++, ...data });
    },
    deleteTokensByIdentifier: async ({ identifier, teamId }: { identifier: string; teamId: number }) => {
      for (let i = tokens.length - 1; i >= 0; i--) {
        if (tokens[i].identifier === identifier && tokens[i].teamId === teamId) tokens.splice(i, 1);
      }
    },
    findActiveTokenByIdentifier: async ({
      identifier,
      teamId,
      now,
    }: {
      identifier: string;
      teamId: number;
      now: Date;
    }) => tokens.find((t) => t.identifier === identifier && t.teamId === teamId && t.expires > now) ?? null,
    findToken: async (token: string) => tokens.find((t) => t.token === token) ?? null,
    deleteToken: async (id: number) => {
      tokens.splice(
        tokens.findIndex((t) => t.id === id),
        1
      );
    },
    countTeamServices: async () => 0,
  };

  return { repo: repo as unknown as TeamManagementRepository, users, memberships, tokens };
}

describe("TeamService", () => {
  let fake: ReturnType<typeof createFakeRepository>;
  let sent: TeamInviteMessage[];
  let hasTeamPlan: boolean;
  let service: TeamService;
  let tokenCounter: number;

  beforeEach(() => {
    fake = createFakeRepository();
    sent = [];
    hasTeamPlan = true;
    tokenCounter = 0;
    service = new TeamService({
      repository: fake.repo,
      hasPlanFeature: vi.fn(async () => hasTeamPlan),
      sendInvite: async (message) => {
        sent.push(message);
      },
      webappUrl: "https://app.test",
      now: () => NOW,
      generateToken: () => `token-${String(++tokenCounter).padStart(16, "0")}`,
    });
  });

  async function teamWithAdminAndMember() {
    const team = await service.create({ userId: 1, name: "Sales Team" });
    await fake.repo.createMembership({
      userId: 2,
      teamId: team.id,
      role: MembershipRole.ADMIN,
      accepted: true,
    });
    await fake.repo.createMembership({
      userId: 3,
      teamId: team.id,
      role: MembershipRole.MEMBER,
      accepted: true,
    });
    const membershipOf = (userId: number) =>
      fake.memberships.find((m) => m.userId === userId && m.teamId === team.id)?.id as number;
    return { team, membershipOf };
  }

  describe("create", () => {
    it("needs the Team plan", async () => {
      hasTeamPlan = false;
      await expect(service.create({ userId: 1, name: "Sales" })).rejects.toThrow("team_plan_required");
    });

    it("makes the creator the owner and derives the URL from the name", async () => {
      const team = await service.create({ userId: 1, name: "  Sales Team " });
      expect(team).toMatchObject({ name: "Sales Team", slug: "sales-team" });
      expect(await fake.repo.findMembership({ userId: 1, teamId: team.id })).toMatchObject({
        role: MembershipRole.OWNER,
        accepted: true,
      });
    });

    it("refuses a URL another team already uses", async () => {
      await service.create({ userId: 1, name: "Sales" });
      await expect(service.create({ userId: 2, name: "Other", slug: "sales" })).rejects.toThrow(
        "team_url_taken"
      );
    });
  });

  describe("invite", () => {
    it("only lets owners and admins invite", async () => {
      const { team } = await teamWithAdminAndMember();
      await expect(
        service.invite({
          userId: 3,
          teamId: team.id,
          emails: ["new@example.com"],
          role: MembershipRole.MEMBER,
        })
      ).rejects.toThrow("permission");
      await expect(
        service.invite({
          userId: 2,
          teamId: team.id,
          emails: ["new@example.com"],
          role: MembershipRole.MEMBER,
        })
      ).resolves.toMatchObject({ invited: ["new@example.com"] });
    });

    it("sends people without an account a single-use signup link", async () => {
      const team = await service.create({ userId: 1, name: "Sales" });
      await service.invite({
        userId: 1,
        teamId: team.id,
        emails: ["New@Example.com"],
        role: MembershipRole.MEMBER,
      });

      expect(sent).toHaveLength(1);
      expect(sent[0]).toMatchObject({
        to: "new@example.com",
        isExistingUser: false,
        teamName: "Sales",
        inviterName: "Olive",
      });
      expect(sent[0].joinLink).toBe(
        "https://app.test/signup?token=token-0000000000000001&callbackUrl=/teams"
      );
      expect(fake.tokens).toHaveLength(1);
      expect(fake.tokens[0].expires.getTime() - NOW.getTime()).toBe(7 * 24 * 60 * 60 * 1000);
      const invitedUser = await fake.repo.findUserByEmail("new@example.com");
      expect(
        await fake.repo.findMembership({ userId: invitedUser?.id as number, teamId: team.id })
      ).toMatchObject({
        accepted: false,
      });
    });

    it("points people who already have an account at their Teams page", async () => {
      const team = await service.create({ userId: 1, name: "Sales" });
      await service.invite({
        userId: 1,
        teamId: team.id,
        emails: ["outsider@example.com"],
        role: MembershipRole.ADMIN,
      });
      expect(sent[0]).toMatchObject({ isExistingUser: true, joinLink: "https://app.test/teams" });
      expect(fake.tokens).toHaveLength(0);
      expect(await fake.repo.findMembership({ userId: 4, teamId: team.id })).toMatchObject({
        role: MembershipRole.ADMIN,
        accepted: false,
      });
    });

    it("skips people already in the team and de-duplicates emails", async () => {
      const { team } = await teamWithAdminAndMember();
      const result = await service.invite({
        userId: 1,
        teamId: team.id,
        emails: ["member@example.com", "x@example.com", "X@example.com"],
        role: MembershipRole.MEMBER,
      });
      expect(result).toEqual({ invited: ["x@example.com"], alreadyMembers: ["member@example.com"] });
    });
  });

  describe("invite links", () => {
    it("reuses the active link and lets admins replace it", async () => {
      const team = await service.create({ userId: 1, name: "Sales" });
      const first = await service.getInviteLink({ userId: 1, teamId: team.id });
      expect(first.link).toBe("https://app.test/teams?token=token-0000000000000001");
      expect((await service.getInviteLink({ userId: 1, teamId: team.id })).link).toBe(first.link);
      const replaced = await service.getInviteLink({ userId: 1, teamId: team.id, regenerate: true });
      expect(replaced.link).not.toBe(first.link);
      expect(fake.tokens.filter((t) => t.identifier === inviteLinkIdentifier(team.id))).toHaveLength(1);
    });

    it("lets anyone with the link join as a member, and the link keeps working", async () => {
      const team = await service.create({ userId: 1, name: "Sales" });
      const { link } = await service.getInviteLink({ userId: 1, teamId: team.id });
      const token = new URL(link).searchParams.get("token") as string;

      expect(await service.previewInviteToken(token)).toMatchObject({
        team: { name: "Sales" },
        forEmail: null,
      });
      await service.joinWithToken({ userId: 4, token });
      await service.joinWithToken({ userId: 3, token });
      expect(await fake.repo.findMembership({ userId: 4, teamId: team.id })).toMatchObject({
        role: MembershipRole.MEMBER,
        accepted: true,
      });
      expect(await fake.repo.findMembership({ userId: 3, teamId: team.id })).toMatchObject({
        accepted: true,
      });
    });

    it("refuses an expired link", async () => {
      const team = await service.create({ userId: 1, name: "Sales" });
      await fake.repo.createToken({
        identifier: inviteLinkIdentifier(team.id),
        token: "expired-token-000000",
        expires: new Date(NOW.getTime() - 1),
        teamId: team.id,
      });
      expect(await service.previewInviteToken("expired-token-000000")).toBeNull();
      await expect(service.joinWithToken({ userId: 4, token: "expired-token-000000" })).rejects.toThrow(
        "invite_link_expired"
      );
    });

    it("keeps a personal invite for the person it was sent to", async () => {
      const team = await service.create({ userId: 1, name: "Sales" });
      await service.invite({
        userId: 1,
        teamId: team.id,
        emails: ["new@example.com"],
        role: MembershipRole.MEMBER,
      });
      await expect(service.joinWithToken({ userId: 4, token: "token-0000000000000001" })).rejects.toThrow(
        "different email"
      );
    });
  });

  describe("pending invites", () => {
    it("accepts and declines", async () => {
      const team = await service.create({ userId: 1, name: "Sales" });
      await service.invite({
        userId: 1,
        teamId: team.id,
        emails: ["outsider@example.com", "admin@example.com"],
        role: MembershipRole.MEMBER,
      });
      expect((await service.listForUser(4)).invites).toHaveLength(1);

      await service.acceptInvite({ userId: 4, teamId: team.id });
      expect(await service.listForUser(4)).toMatchObject({ teams: [{ name: "Sales" }], invites: [] });

      await service.declineInvite({ userId: 2, teamId: team.id });
      expect(await fake.repo.findMembership({ userId: 2, teamId: team.id })).toBeNull();
    });

    it("hides team details from people with only an invite", async () => {
      const team = await service.create({ userId: 1, name: "Sales" });
      await service.invite({
        userId: 1,
        teamId: team.id,
        emails: ["outsider@example.com"],
        role: MembershipRole.MEMBER,
      });
      await expect(service.get({ userId: 4, teamId: team.id })).rejects.toThrow("permission");
    });
  });

  describe("roles and removal", () => {
    it("protects the owner", async () => {
      const { team, membershipOf } = await teamWithAdminAndMember();
      await expect(
        service.changeRole({ userId: 2, membershipId: membershipOf(1), role: MembershipRole.MEMBER })
      ).rejects.toThrow("owner");
      await expect(service.removeMember({ userId: 2, membershipId: membershipOf(1) })).rejects.toThrow(
        "owner"
      );
      await expect(service.leave({ userId: 1, teamId: team.id })).rejects.toThrow("owner_cannot_leave_team");
      await expect(service.delete({ userId: 2, teamId: team.id })).rejects.toThrow("permission");
    });

    it("lets admins manage members but only the owner manage admins", async () => {
      const { membershipOf } = await teamWithAdminAndMember();
      await service.changeRole({ userId: 2, membershipId: membershipOf(3), role: MembershipRole.ADMIN });
      expect(fake.memberships.find((m) => m.id === membershipOf(3))?.role).toBe(MembershipRole.ADMIN);

      await expect(
        service.changeRole({ userId: 2, membershipId: membershipOf(3), role: MembershipRole.MEMBER })
      ).rejects.toThrow("Only the team owner");
      await expect(service.removeMember({ userId: 2, membershipId: membershipOf(3) })).rejects.toThrow(
        "Only the team owner"
      );

      await service.changeRole({ userId: 1, membershipId: membershipOf(3), role: MembershipRole.MEMBER });
      await service.removeMember({ userId: 2, membershipId: membershipOf(3) });
      expect(fake.memberships.some((m) => m.userId === 3)).toBe(false);
    });

    it("withdrawing an invite also kills its signup link", async () => {
      const team = await service.create({ userId: 1, name: "Sales" });
      await service.invite({
        userId: 1,
        teamId: team.id,
        emails: ["new@example.com"],
        role: MembershipRole.MEMBER,
      });
      const invited = await fake.repo.findUserByEmail("new@example.com");
      const membership = await fake.repo.findMembership({ userId: invited?.id as number, teamId: team.id });
      await service.removeMember({ userId: 1, membershipId: membership?.id as number });
      expect(fake.tokens).toHaveLength(0);
    });

    it("members can leave and the owner can delete the team", async () => {
      const { team } = await teamWithAdminAndMember();
      await service.leave({ userId: 3, teamId: team.id });
      expect(await fake.repo.findMembership({ userId: 3, teamId: team.id })).toBeNull();
      await service.delete({ userId: 1, teamId: team.id });
      expect(await fake.repo.findById(team.id)).toBeNull();
    });
  });

  describe("update", () => {
    it("lets admins rename the team and checks the new URL", async () => {
      const { team } = await teamWithAdminAndMember();
      await service.create({ userId: 4, name: "Support" });
      await expect(service.update({ userId: 3, teamId: team.id, data: { name: "x" } })).rejects.toThrow(
        "permission"
      );
      await expect(service.update({ userId: 2, teamId: team.id, data: { slug: "support" } })).rejects.toThrow(
        "team_url_taken"
      );
      expect(
        await service.update({
          userId: 2,
          teamId: team.id,
          data: { name: "Sales EU", slug: "Sales EU", bio: "  " },
        })
      ).toMatchObject({
        name: "Sales EU",
        slug: "sales-eu",
        bio: null,
      });
    });
  });
});
