import authedProcedure from "../../../procedures/authedProcedure";
import { router } from "../../../trpc";
import {
  ZChangeRoleInput,
  ZCreateTeamInput,
  ZInviteInput,
  ZInviteLinkInput,
  ZMembershipInput,
  ZTeamAvailabilityInput,
  ZTeamIdInput,
  ZTokenInput,
  ZUpdateTeamInput,
} from "./types";

const loadService = async () => {
  const { getTeamService } = await import("@calcom/features/teams/lib/getTeamService");
  return getTeamService();
};

export const teamsRouter = router({
  list: authedProcedure.query(async ({ ctx }) => {
    const service = await loadService();
    const [lists, canCreate] = await Promise.all([
      service.listForUser(ctx.user.id),
      service.canCreateTeam(ctx.user.id),
    ]);
    return { ...lists, canCreate };
  }),
  get: authedProcedure.input(ZTeamIdInput).query(async ({ ctx, input }) => {
    return (await loadService()).get({ userId: ctx.user.id, teamId: input.teamId });
  }),
  insights: authedProcedure.input(ZTeamIdInput).query(async ({ ctx, input }) => {
    // Any member may see the team's numbers; get() throws for non-members.
    await (await loadService()).get({ userId: ctx.user.id, teamId: input.teamId });
    const { prisma } = await import("@calcom/prisma");
    const { TeamInsightsRepository } = await import(
      "@calcom/features/teams/repositories/TeamInsightsRepository"
    );
    const { TeamInsightsService } = await import("@calcom/features/teams/services/TeamInsightsService");
    return new TeamInsightsService(new TeamInsightsRepository(prisma)).get({ teamId: input.teamId });
  }),
  availability: authedProcedure.input(ZTeamAvailabilityInput).query(async ({ ctx, input }) => {
    await (await loadService()).get({ userId: ctx.user.id, teamId: input.teamId });
    const [
      { prisma },
      { default: dayjs },
      { TeamInsightsRepository },
      { TeamAvailabilityService },
      { getUserAvailabilityService },
    ] = await Promise.all([
      import("@calcom/prisma"),
      import("@calcom/dayjs"),
      import("@calcom/features/teams/repositories/TeamInsightsRepository"),
      import("@calcom/features/teams/services/TeamAvailabilityService"),
      import("@calcom/features/di/containers/GetUserAvailability"),
    ]);
    const { findUsersForAvailabilityCheck } = await import(
      "@calcom/features/availability/lib/findUsersForAvailabilityCheck"
    );
    const members = new TeamInsightsRepository(prisma);
    const availability = getUserAvailabilityService();
    const service = new TeamAvailabilityService({
      listMembers: async (teamId) =>
        (await members.listMembers(teamId)).map((m) => ({ id: m.id, name: m.name || m.email })),
      getFreeRanges: async ({ userId, from, to }) => {
        // The availability engine works on a fully loaded user (schedules, credentials, calendars).
        const user = await findUsersForAvailabilityCheck({ where: { id: userId } });
        if (!user) throw new Error(`User ${userId} not found`);
        const result = await availability
          .getUserAvailability(
            {
              userId,
              dateFrom: dayjs(from),
              dateTo: dayjs(to),
              returnDateOverrides: false,
              silentlyHandleCalendarFailures: true,
            },
            { user }
          )
          .catch(async (error: unknown) => {
            const { default: logger } = await import("@calcom/lib/logger");
            logger.warn("[team-coverage] couldn't read availability", { userId, error: String(error) });
            throw error;
          });
        return result.dateRanges.map((r) => ({ start: r.start.toDate(), end: r.end.toDate() }));
      },
    });
    return service.getCoverage({ teamId: input.teamId, timeZone: input.timeZone });
  }),
  create: authedProcedure.input(ZCreateTeamInput).mutation(async ({ ctx, input }) => {
    return (await loadService()).create({ userId: ctx.user.id, ...input });
  }),
  update: authedProcedure.input(ZUpdateTeamInput).mutation(async ({ ctx, input }) => {
    const { teamId, logo, ...data } = input;
    const service = await loadService();
    let logoUrl: string | null | undefined;
    if (logo === null) logoUrl = null;
    if (logo) {
      // Check permission before storing anything for this team.
      await service.get({ userId: ctx.user.id, teamId });
      const { uploadLogo } = await import("@calcom/lib/server/avatar");
      logoUrl = await uploadLogo({ teamId, logo });
    }
    return service.update({ userId: ctx.user.id, teamId, data: { ...data, logoUrl } });
  }),
  delete: authedProcedure.input(ZTeamIdInput).mutation(async ({ ctx, input }) => {
    await (await loadService()).delete({ userId: ctx.user.id, teamId: input.teamId });
  }),
  invite: authedProcedure.input(ZInviteInput).mutation(async ({ ctx, input }) => {
    return (await loadService()).invite({ userId: ctx.user.id, ...input });
  }),
  inviteLink: authedProcedure.input(ZInviteLinkInput).mutation(async ({ ctx, input }) => {
    return (await loadService()).getInviteLink({ userId: ctx.user.id, ...input });
  }),
  previewInvite: authedProcedure.input(ZTokenInput).query(async ({ input }) => {
    return (await loadService()).previewInviteToken(input.token);
  }),
  join: authedProcedure.input(ZTokenInput).mutation(async ({ ctx, input }) => {
    return (await loadService()).joinWithToken({ userId: ctx.user.id, token: input.token });
  }),
  acceptInvite: authedProcedure.input(ZTeamIdInput).mutation(async ({ ctx, input }) => {
    await (await loadService()).acceptInvite({ userId: ctx.user.id, teamId: input.teamId });
  }),
  declineInvite: authedProcedure.input(ZTeamIdInput).mutation(async ({ ctx, input }) => {
    await (await loadService()).declineInvite({ userId: ctx.user.id, teamId: input.teamId });
  }),
  leave: authedProcedure.input(ZTeamIdInput).mutation(async ({ ctx, input }) => {
    await (await loadService()).leave({ userId: ctx.user.id, teamId: input.teamId });
  }),
  changeRole: authedProcedure.input(ZChangeRoleInput).mutation(async ({ ctx, input }) => {
    await (await loadService()).changeRole({ userId: ctx.user.id, ...input });
  }),
  removeMember: authedProcedure.input(ZMembershipInput).mutation(async ({ ctx, input }) => {
    await (await loadService()).removeMember({ userId: ctx.user.id, membershipId: input.membershipId });
  }),
});
