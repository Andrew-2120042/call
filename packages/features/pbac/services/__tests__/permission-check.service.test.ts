import type { PrismaClient } from "@calcom/prisma";
import { MembershipRole } from "@calcom/prisma/enums";
import { describe, expect, it, vi } from "vitest";
import { PermissionCheckService } from "../permission-check.service";

type Row = { userId: number; teamId: number; accepted: boolean; role: MembershipRole };

// Answers the two queries the service makes, from an in-memory membership table.
function fakePrisma(rows: Row[]) {
  const matches = (
    row: Row,
    where: { userId: number; teamId?: number; accepted: boolean; role: { in: MembershipRole[] } }
  ) =>
    row.userId === where.userId &&
    (where.teamId === undefined || row.teamId === where.teamId) &&
    row.accepted === where.accepted &&
    where.role.in.includes(row.role);
  return {
    membership: {
      findFirst: vi.fn(async ({ where }) => (rows.some((row) => matches(row, where)) ? { id: 1 } : null)),
      findMany: vi.fn(async ({ where }) =>
        rows.filter((row) => matches(row, where)).map((row) => ({ teamId: row.teamId }))
      ),
    },
  } as unknown as PrismaClient;
}

const rows: Row[] = [
  { userId: 1, teamId: 10, accepted: true, role: MembershipRole.OWNER },
  { userId: 2, teamId: 10, accepted: true, role: MembershipRole.ADMIN },
  { userId: 3, teamId: 10, accepted: true, role: MembershipRole.MEMBER },
  { userId: 4, teamId: 10, accepted: false, role: MembershipRole.ADMIN },
  { userId: 1, teamId: 20, accepted: true, role: MembershipRole.MEMBER },
];

describe("PermissionCheckService", () => {
  const service = new PermissionCheckService(fakePrisma(rows));

  it("allows owners and admins by default", async () => {
    expect(await service.checkPermission({ userId: 1, teamId: 10, permission: "eventType.update" })).toBe(
      true
    );
    expect(await service.checkPermission({ userId: 2, teamId: 10, permission: "eventType.update" })).toBe(
      true
    );
  });

  it("refuses plain members, people outside the team and invites not yet accepted", async () => {
    expect(await service.checkPermission({ userId: 3, teamId: 10 })).toBe(false);
    expect(await service.checkPermission({ userId: 99, teamId: 10 })).toBe(false);
    expect(await service.checkPermission({ userId: 4, teamId: 10 })).toBe(false);
  });

  it("lets the caller widen the allowed roles", async () => {
    expect(
      await service.checkPermission({ userId: 3, teamId: 10, fallbackRoles: [MembershipRole.MEMBER] })
    ).toBe(true);
  });

  it("never grants anything without a team", async () => {
    expect(await service.checkPermission({ userId: 1, teamId: null })).toBe(false);
    expect(await service.hasPermission({ userId: 1 })).toBe(false);
  });

  it("lists only teams where the user holds an allowed role", async () => {
    expect(await service.getTeamIdsWithPermission({ userId: 1 })).toEqual([10]);
    expect(
      await service.getTeamIdsWithPermission({ userId: 1, fallbackRoles: [MembershipRole.MEMBER] })
    ).toEqual([20]);
    expect(await service.getTeamIdsWithPermission({ userId: 4 })).toEqual([]);
  });
});
