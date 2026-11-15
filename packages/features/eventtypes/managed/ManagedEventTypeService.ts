import { ErrorCode } from "@calcom/lib/errorCodes";
import { ErrorWithCode } from "@calcom/lib/errors";
import { SchedulingType } from "@calcom/prisma/enums";
import {
  MANAGED_LOCKED_FIELDS,
  MANAGED_MEMBER_OWNED_FIELDS,
  type ManagedEventTypeRepository,
  type TemplateValues,
} from "./ManagedEventTypeRepository";

export type AssignedMember = { userId: number; hidden: boolean };

export type SyncResult = { created: number[]; updated: number; removed: number };

/**
 * A managed service is a team-level template. Each assigned member gets their own copy on their personal page;
 * the template decides most settings, while each member keeps their own location and schedule.
 */
export class ManagedEventTypeService {
  constructor(private readonly repository: ManagedEventTypeRepository) {}

  /**
   * @param assigned the full list of members who should have a copy, or undefined to leave assignments
   *   unchanged and only push the template's current settings to existing copies.
   */
  async sync({
    templateId,
    assigned,
  }: {
    templateId: number;
    assigned?: AssignedMember[];
  }): Promise<SyncResult> {
    const template = await this.repository.findTemplate(templateId);
    if (!template || template.schedulingType !== SchedulingType.MANAGED)
      return { created: [], updated: 0, removed: 0 };
    if (!template.teamId) {
      throw new ErrorWithCode(ErrorCode.BadRequest, `Managed service ${templateId} must belong to a team`);
    }

    const children = await this.repository.listChildren(templateId);
    const lockedValues = pick(template.values, MANAGED_LOCKED_FIELDS);

    if (!assigned) {
      for (const child of children) await this.repository.updateChild({ id: child.id, values: lockedValues });
      return { created: [], updated: children.length, removed: 0 };
    }

    const memberIds = new Set(await this.repository.listAcceptedMemberIds(template.teamId));
    const notMembers = assigned.filter((a) => !memberIds.has(a.userId)).map((a) => a.userId);
    if (notMembers.length) {
      throw ErrorWithCode.Factory.BadRequest(
        `Only team members can be assigned (user ${notMembers.join(", ")})`
      );
    }

    const wanted = new Map(assigned.map((a) => [a.userId, a]));
    const existingByUser = new Map(
      children.filter((c) => c.userId !== null).map((c) => [c.userId as number, c])
    );
    const toCreate = assigned.filter((a) => !existingByUser.has(a.userId));
    const toRemove = children.filter((c) => c.userId === null || !wanted.has(c.userId));

    const slug = String(template.values.slug ?? "");
    const clashes = await this.repository.findConflictingSlugs({
      userIds: toCreate.map((a) => a.userId),
      slug,
      parentId: templateId,
    });
    if (clashes.size) {
      throw ErrorWithCode.Factory.BadRequest(
        `Some members already have a service at /${slug} (user ${Array.from(clashes).join(", ")}). Change the URL first.`
      );
    }

    for (const member of toCreate) {
      await this.repository.createChild({
        parentId: templateId,
        userId: member.userId,
        hidden: member.hidden,
        values: template.values,
      });
    }
    let updated = 0;
    for (const [userId, child] of Array.from(existingByUser)) {
      const member = wanted.get(userId);
      if (!member) continue;
      await this.repository.updateChild({ id: child.id, hidden: member.hidden, values: lockedValues });
      updated++;
    }
    await this.repository.deleteChildren(toRemove.map((c) => c.id));
    return { created: toCreate.map((a) => a.userId), updated, removed: toRemove.length };
  }
}

function pick(values: TemplateValues, fields: readonly string[]): Partial<TemplateValues> {
  return Object.fromEntries(
    fields.map((f) => [f, values[f as keyof TemplateValues]])
  ) as Partial<TemplateValues>;
}

export const managedMemberOwnedFields = MANAGED_MEMBER_OWNED_FIELDS;
