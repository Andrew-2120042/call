import { MembershipRole } from "@calcom/prisma/enums";
import { z } from "zod";

const teamId = z.number().int().positive();
const inviteRole = z.enum([MembershipRole.MEMBER, MembershipRole.ADMIN]);

export const ZTeamIdInput = z.object({ teamId });

export const ZTeamAvailabilityInput = z.object({ teamId, timeZone: z.string().min(1).max(64) });

export const ZCreateTeamInput = z.object({
  name: z.string().trim().min(1).max(80),
  slug: z.string().trim().max(80).optional(),
  bio: z.string().max(500).nullish(),
});

export const ZUpdateTeamInput = z.object({
  teamId,
  name: z.string().trim().min(1).max(80).optional(),
  slug: z.string().trim().min(1).max(80).optional(),
  bio: z.string().max(500).nullish(),
  /** A data URL from the logo picker, or null to remove the logo. */
  logo: z.string().startsWith("data:image/").max(3_000_000).nullish(),
  hideBookATeamMember: z.boolean().optional(),
  aiRoutingEnabled: z.boolean().optional(),
});

export const ZInviteInput = z.object({
  teamId,
  emails: z.array(z.string().trim().email()).min(1).max(20),
  role: inviteRole,
});

export const ZInviteLinkInput = z.object({ teamId, regenerate: z.boolean().optional() });

export const ZTokenInput = z.object({ token: z.string().min(16).max(200) });

export const ZMembershipInput = z.object({ membershipId: z.number().int().positive() });

export const ZChangeRoleInput = ZMembershipInput.extend({ role: inviteRole });
