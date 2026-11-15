import type { PrismaClient } from "@calcom/prisma";
import { Prisma } from "@calcom/prisma/client";

import { MANAGED_LOCKED_FIELDS } from "./lockedFields";

export { MANAGED_LOCKED_FIELDS };

/** Copied once when a member is added; afterwards each member controls these on their own copy. */
export const MANAGED_MEMBER_OWNED_FIELDS = ["locations"] as const;

const JSON_FIELDS = new Set<string>([
  "recurringEvent",
  "bookingLimits",
  "bookingFields",
  "durationLimits",
  "locations",
]);

type LockedField = (typeof MANAGED_LOCKED_FIELDS)[number];
type MemberOwnedField = (typeof MANAGED_MEMBER_OWNED_FIELDS)[number];
export type TemplateValues = Record<LockedField | MemberOwnedField, unknown>;

const templateSelect = Object.fromEntries(
  [...MANAGED_LOCKED_FIELDS, ...MANAGED_MEMBER_OWNED_FIELDS].map((field) => [field, true])
) as Record<LockedField | MemberOwnedField, true>;

// Prisma needs DbNull rather than null to clear a JSON column.
const toWriteValue = (field: string, value: unknown) =>
  JSON_FIELDS.has(field) && value === null ? Prisma.DbNull : value;

const toWriteData = (values: Partial<TemplateValues>) =>
  Object.fromEntries(Object.entries(values).map(([field, value]) => [field, toWriteValue(field, value)]));

export type ManagedChild = { id: number; userId: number | null; hidden: boolean };

export class ManagedEventTypeRepository {
  constructor(private readonly prismaClient: PrismaClient) {}

  async findTemplate(eventTypeId: number) {
    const template = await this.prismaClient.eventType.findUnique({
      where: { id: eventTypeId },
      select: { id: true, teamId: true, schedulingType: true, ...templateSelect },
    });
    if (!template) return null;
    const { id, teamId, schedulingType, ...values } = template;
    return { id, teamId, schedulingType, values: values as TemplateValues };
  }

  async listChildren(parentId: number): Promise<ManagedChild[]> {
    return this.prismaClient.eventType.findMany({
      where: { parentId },
      select: { id: true, userId: true, hidden: true },
    });
  }

  async listAcceptedMemberIds(teamId: number): Promise<number[]> {
    const memberships = await this.prismaClient.membership.findMany({
      where: { teamId, accepted: true },
      select: { userId: true },
    });
    return memberships.map((m) => m.userId);
  }

  /** Slugs each user already uses for their own services, to spot a clash before creating a copy. */
  async findConflictingSlugs({
    userIds,
    slug,
    parentId,
  }: {
    userIds: number[];
    slug: string;
    parentId: number;
  }) {
    const clashes = await this.prismaClient.eventType.findMany({
      where: { userId: { in: userIds }, slug, OR: [{ parentId: null }, { parentId: { not: parentId } }] },
      select: { userId: true },
    });
    return new Set(clashes.map((c) => c.userId).filter((id): id is number => id !== null));
  }

  async createChild({
    parentId,
    userId,
    hidden,
    values,
  }: {
    parentId: number;
    userId: number;
    hidden: boolean;
    values: TemplateValues;
  }) {
    await this.prismaClient.eventType.create({
      data: {
        ...(toWriteData(values) as Prisma.EventTypeCreateInput),
        hidden,
        parent: { connect: { id: parentId } },
        owner: { connect: { id: userId } },
        users: { connect: [{ id: userId }] },
      },
      select: { id: true },
    });
  }

  async updateChild({
    id,
    hidden,
    values,
  }: {
    id: number;
    hidden?: boolean;
    values: Partial<TemplateValues>;
  }) {
    await this.prismaClient.eventType.update({
      where: { id },
      data: {
        ...(toWriteData(values) as Prisma.EventTypeUpdateInput),
        ...(hidden === undefined ? {} : { hidden }),
      },
      select: { id: true },
    });
  }

  async deleteChildren(ids: number[]) {
    if (!ids.length) return;
    await this.prismaClient.eventType.deleteMany({ where: { id: { in: ids } } });
  }
}
