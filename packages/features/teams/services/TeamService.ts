import { randomBytes } from "node:crypto";
import { ErrorCode } from "@calcom/lib/errorCodes";
import { ErrorWithCode } from "@calcom/lib/errors";
import slugify from "@calcom/lib/slugify";
import { MembershipRole } from "@calcom/prisma/enums";
import type { PlanFeature } from "../../plans/lib/entitlements";
import type { TeamManagementRepository, TeamProfile } from "../repositories/TeamManagementRepository";

export type InviteRole = typeof MembershipRole.MEMBER | typeof MembershipRole.ADMIN;

export type TeamInviteMessage = {
  to: string;
  inviterName: string;
  teamName: string;
  joinLink: string;
  isExistingUser: boolean;
  locale: string | null;
};

export interface ITeamServiceDeps {
  repository: TeamManagementRepository;
  hasPlanFeature: (userId: number, feature: PlanFeature) => Promise<boolean>;
  sendInvite: (message: TeamInviteMessage) => Promise<void>;
  webappUrl: string;
  now?: () => Date;
  generateToken?: () => string;
}

const INVITE_DAYS = 7;
const LINK_INVITE_DAYS = 30;
const MAX_INVITES_PER_REQUEST = 20;
const MANAGER_ROLES: MembershipRole[] = [MembershipRole.ADMIN, MembershipRole.OWNER];

export const inviteLinkIdentifier = (teamId: number) => `invite-link-for-team-${teamId}`;

export class TeamService {
  private readonly now: () => Date;
  private readonly generateToken: () => string;

  constructor(private readonly deps: ITeamServiceDeps) {
    this.now = deps.now ?? (() => new Date());
    this.generateToken = deps.generateToken ?? (() => randomBytes(32).toString("hex"));
  }

  private get repo() {
    return this.deps.repository;
  }

  private async requireRole(userId: number, teamId: number, roles: MembershipRole[]) {
    const membership = await this.repo.findMembership({ userId, teamId });
    if (!membership?.accepted || !roles.includes(membership.role)) {
      throw ErrorWithCode.Factory.Forbidden("You don't have permission to do that in this team");
    }
    return membership;
  }

  private async requireTeam(teamId: number): Promise<TeamProfile> {
    const team = await this.repo.findById(teamId);
    if (!team) throw new ErrorWithCode(ErrorCode.NotFound, `Team ${teamId} not found`);
    return team;
  }

  private async assertSlugAvailable(slug: string, excludeTeamId?: number) {
    if (!slug) throw ErrorWithCode.Factory.BadRequest("The team URL can't be empty");
    if (await this.repo.isSlugTaken({ slug, excludeTeamId })) {
      throw new ErrorWithCode(ErrorCode.BadRequest, "team_url_taken");
    }
  }

  /** Team booking pages run on the owner's Team plan and pause when it ends. */
  async isTeamSchedulingActive(teamId: number) {
    const ownerId = await this.repo.findOwnerUserId(teamId);
    if (!ownerId) return false;
    return this.deps.hasPlanFeature(ownerId, "teamScheduling");
  }

  async getPublicPage(slug: string) {
    const team = await this.repo.findBySlug(slug);
    if (!team || !(await this.isTeamSchedulingActive(team.id))) return null;
    const [services, members] = await Promise.all([
      this.repo.listPublicServices(team.id),
      team.hideBookATeamMember ? Promise.resolve([]) : this.repo.listPublicMembers(team.id),
    ]);
    return { team, services, members };
  }

  async listForUser(userId: number) {
    const teams = await this.repo.listForUser(userId);
    return {
      teams: teams.filter((team) => team.accepted),
      invites: teams.filter((team) => !team.accepted),
    };
  }

  async canCreateTeam(userId: number) {
    return this.deps.hasPlanFeature(userId, "teamScheduling");
  }

  async create({
    userId,
    name,
    slug,
    bio,
  }: {
    userId: number;
    name: string;
    slug?: string;
    bio?: string | null;
  }) {
    if (!(await this.canCreateTeam(userId))) {
      throw new ErrorWithCode(ErrorCode.Forbidden, "team_plan_required");
    }
    const trimmedName = name.trim();
    if (!trimmedName) throw ErrorWithCode.Factory.BadRequest("A team needs a name");
    const finalSlug = slugify(slug?.trim() || trimmedName);
    await this.assertSlugAvailable(finalSlug);
    return this.repo.createWithOwner({
      name: trimmedName,
      slug: finalSlug,
      bio: bio?.trim() || null,
      ownerId: userId,
      ownerRole: MembershipRole.OWNER,
    });
  }

  async get({ userId, teamId }: { userId: number; teamId: number }) {
    const membership = await this.requireRole(userId, teamId, [
      MembershipRole.MEMBER,
      MembershipRole.ADMIN,
      MembershipRole.OWNER,
    ]);
    const [team, members] = await Promise.all([this.requireTeam(teamId), this.repo.listMembers(teamId)]);
    return { team, members, myRole: membership.role };
  }

  async update({
    userId,
    teamId,
    data,
  }: {
    userId: number;
    teamId: number;
    data: {
      name?: string;
      slug?: string;
      bio?: string | null;
      logoUrl?: string | null;
      hideBookATeamMember?: boolean;
    };
  }) {
    await this.requireRole(userId, teamId, MANAGER_ROLES);
    const patch: Parameters<TeamManagementRepository["update"]>[1] = {};
    if (data.name !== undefined) {
      const name = data.name.trim();
      if (!name) throw ErrorWithCode.Factory.BadRequest("A team needs a name");
      patch.name = name;
    }
    if (data.slug !== undefined) {
      const slug = slugify(data.slug.trim());
      await this.assertSlugAvailable(slug, teamId);
      patch.slug = slug;
    }
    if (data.bio !== undefined) patch.bio = data.bio?.trim() || null;
    if (data.logoUrl !== undefined) patch.logoUrl = data.logoUrl;
    if (data.hideBookATeamMember !== undefined) patch.hideBookATeamMember = data.hideBookATeamMember;
    return this.repo.update(teamId, patch);
  }

  async delete({ userId, teamId }: { userId: number; teamId: number }) {
    await this.requireRole(userId, teamId, [MembershipRole.OWNER]);
    await this.repo.delete(teamId);
  }

  async invite({
    userId,
    teamId,
    emails,
    role,
  }: {
    userId: number;
    teamId: number;
    emails: string[];
    role: InviteRole;
  }) {
    await this.requireRole(userId, teamId, MANAGER_ROLES);
    const team = await this.requireTeam(teamId);
    const inviter = await this.repo.findUserById(userId);
    const uniqueEmails = Array.from(
      new Set(emails.map((email) => email.trim().toLowerCase()).filter(Boolean))
    );
    if (!uniqueEmails.length) throw ErrorWithCode.Factory.BadRequest("Add at least one email address");
    if (uniqueEmails.length > MAX_INVITES_PER_REQUEST) {
      throw ErrorWithCode.Factory.BadRequest(
        `You can invite up to ${MAX_INVITES_PER_REQUEST} people at a time`
      );
    }

    const invited: string[] = [];
    const alreadyMembers: string[] = [];
    for (const email of uniqueEmails) {
      const existing = await this.repo.findUserByEmail(email);
      const user = existing ?? (await this.repo.createInvitedUser({ email, teamId }));
      const membership = await this.repo.findMembership({ userId: user.id, teamId });
      if (membership?.accepted) {
        alreadyMembers.push(email);
        continue;
      }
      if (!membership) {
        await this.repo.createMembership({ userId: user.id, teamId, role, accepted: false });
      }

      // Someone with an account accepts from their Teams page; anyone else needs a signup link carrying the token.
      const isExistingUser = !!existing?.username;
      let joinLink = `${this.deps.webappUrl}/teams`;
      if (!isExistingUser) {
        const token = this.generateToken();
        await this.repo.deleteTokensByIdentifier({ identifier: email, teamId });
        await this.repo.createToken({
          identifier: email,
          token,
          teamId,
          expires: new Date(this.now().getTime() + INVITE_DAYS * 24 * 60 * 60 * 1000),
        });
        joinLink = `${this.deps.webappUrl}/signup?token=${token}&callbackUrl=/teams`;
      }

      await this.deps.sendInvite({
        to: email,
        inviterName: inviter?.name || inviter?.email || "",
        teamName: team.name,
        joinLink,
        isExistingUser,
        locale: user.locale,
      });
      invited.push(email);
    }
    return { invited, alreadyMembers };
  }

  /** Returns the team's shareable invite link, creating one when none is active. */
  async getInviteLink({
    userId,
    teamId,
    regenerate = false,
  }: {
    userId: number;
    teamId: number;
    regenerate?: boolean;
  }) {
    await this.requireRole(userId, teamId, MANAGER_ROLES);
    const identifier = inviteLinkIdentifier(teamId);
    const now = this.now();
    if (regenerate) {
      await this.repo.deleteTokensByIdentifier({ identifier, teamId });
    } else {
      const active = await this.repo.findActiveTokenByIdentifier({ identifier, teamId, now });
      if (active) return { link: this.joinUrl(active.token), expires: active.expires };
    }
    const token = this.generateToken();
    const expires = new Date(now.getTime() + LINK_INVITE_DAYS * 24 * 60 * 60 * 1000);
    await this.repo.createToken({ identifier, token, teamId, expires });
    return { link: this.joinUrl(token), expires };
  }

  private joinUrl(token: string) {
    return `${this.deps.webappUrl}/teams?token=${token}`;
  }

  /** What the join page shows before someone accepts an invite link. */
  async previewInviteToken(token: string) {
    const found = await this.repo.findToken(token);
    if (!found?.teamId || found.expires.getTime() <= this.now().getTime()) return null;
    const team = await this.repo.findById(found.teamId);
    if (!team) return null;
    return { team, forEmail: found.identifier.includes("@") ? found.identifier : null };
  }

  async joinWithToken({ userId, token }: { userId: number; token: string }) {
    const found = await this.repo.findToken(token);
    if (!found?.teamId || found.expires.getTime() <= this.now().getTime()) {
      throw new ErrorWithCode(ErrorCode.BadRequest, "invite_link_expired");
    }
    const user = await this.repo.findUserById(userId);
    const isPersonalInvite = found.identifier.includes("@");
    if (isPersonalInvite && user?.email.toLowerCase() !== found.identifier.toLowerCase()) {
      throw ErrorWithCode.Factory.Forbidden("This invite was sent to a different email address");
    }
    const teamId = found.teamId;
    const membership = await this.repo.findMembership({ userId, teamId });
    if (!membership) {
      await this.repo.createMembership({ userId, teamId, role: MembershipRole.MEMBER, accepted: true });
    } else if (!membership.accepted) {
      await this.repo.acceptMembership({ userId, teamId });
    }
    if (isPersonalInvite) await this.repo.deleteToken(found.id);
    return { teamId };
  }

  async acceptInvite({ userId, teamId }: { userId: number; teamId: number }) {
    const membership = await this.repo.findMembership({ userId, teamId });
    if (!membership) throw new ErrorWithCode(ErrorCode.NotFound, "No invite to accept for this team");
    if (!membership.accepted) await this.repo.acceptMembership({ userId, teamId });
  }

  async declineInvite({ userId, teamId }: { userId: number; teamId: number }) {
    const membership = await this.repo.findMembership({ userId, teamId });
    if (!membership || membership.accepted) return;
    await this.repo.deleteMembership({ userId, teamId });
  }

  async leave({ userId, teamId }: { userId: number; teamId: number }) {
    const membership = await this.repo.findMembership({ userId, teamId });
    if (!membership) return;
    if (membership.role === MembershipRole.OWNER) {
      throw ErrorWithCode.Factory.BadRequest("owner_cannot_leave_team");
    }
    await this.repo.deleteMembership({ userId, teamId });
  }

  async changeRole({
    userId,
    membershipId,
    role,
  }: {
    userId: number;
    membershipId: number;
    role: InviteRole;
  }) {
    const target = await this.repo.findMembershipById(membershipId);
    if (!target) throw new ErrorWithCode(ErrorCode.NotFound, "Member not found");
    const actor = await this.requireRole(userId, target.teamId, MANAGER_ROLES);
    if (target.role === MembershipRole.OWNER) {
      throw ErrorWithCode.Factory.Forbidden("The team owner's role can't be changed");
    }
    if (target.role === MembershipRole.ADMIN && actor.role !== MembershipRole.OWNER) {
      throw ErrorWithCode.Factory.Forbidden("Only the team owner can change an admin's role");
    }
    await this.repo.updateRole({ membershipId, role });
  }

  async removeMember({ userId, membershipId }: { userId: number; membershipId: number }) {
    const target = await this.repo.findMembershipById(membershipId);
    if (!target) return;
    const actor = await this.requireRole(userId, target.teamId, MANAGER_ROLES);
    if (target.role === MembershipRole.OWNER) {
      throw ErrorWithCode.Factory.Forbidden("The team owner can't be removed");
    }
    if (target.role === MembershipRole.ADMIN && actor.role !== MembershipRole.OWNER) {
      throw ErrorWithCode.Factory.Forbidden("Only the team owner can remove an admin");
    }
    const removedUser = await this.repo.findUserById(target.userId);
    await this.repo.deleteMembership({ userId: target.userId, teamId: target.teamId });
    // An unaccepted invite's signup link must stop working once the invite is withdrawn.
    if (removedUser) {
      await this.repo.deleteTokensByIdentifier({ identifier: removedUser.email, teamId: target.teamId });
    }
  }
}
