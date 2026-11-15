import { SchedulingType } from "@calcom/prisma/enums";
import { beforeEach, describe, expect, it } from "vitest";
import type { ManagedChild, ManagedEventTypeRepository, TemplateValues } from "../ManagedEventTypeRepository";
import { ManagedEventTypeService } from "../ManagedEventTypeService";

type Child = ManagedChild & { values: Partial<TemplateValues> };

function setup(overrides: { schedulingType?: SchedulingType; teamId?: number | null } = {}) {
  const template = {
    id: 1,
    teamId: overrides.teamId === undefined ? 10 : overrides.teamId,
    schedulingType: overrides.schedulingType ?? SchedulingType.MANAGED,
    values: {
      title: "Onboarding call",
      slug: "onboarding",
      length: 30,
      locations: [{ type: "integrations:daily" }],
    } as unknown as TemplateValues,
  };
  const members = [100, 101, 102];
  const children: Child[] = [];
  const takenSlugs = new Map<number, string[]>([[102, ["onboarding"]]]);
  let nextId = 50;
  const repo = {
    findTemplate: async () => template,
    listChildren: async () => children.map(({ id, userId, hidden }) => ({ id, userId, hidden })),
    listAcceptedMemberIds: async () => members,
    findConflictingSlugs: async ({ userIds, slug }: { userIds: number[]; slug: string }) =>
      new Set(userIds.filter((id) => takenSlugs.get(id)?.includes(slug))),
    createChild: async ({
      userId,
      hidden,
      values,
    }: {
      userId: number;
      hidden: boolean;
      values: TemplateValues;
    }) => {
      children.push({ id: nextId++, userId, hidden, values: { ...values } });
    },
    updateChild: async ({
      id,
      hidden,
      values,
    }: {
      id: number;
      hidden?: boolean;
      values: Partial<TemplateValues>;
    }) => {
      const child = children.find((c) => c.id === id);
      if (!child) throw new Error("missing child");
      Object.assign(child.values, values);
      if (hidden !== undefined) child.hidden = hidden;
    },
    deleteChildren: async (ids: number[]) => {
      for (const id of ids)
        children.splice(
          children.findIndex((c) => c.id === id),
          1
        );
    },
  };
  return {
    template,
    children,
    service: new ManagedEventTypeService(repo as unknown as ManagedEventTypeRepository),
  };
}

describe("ManagedEventTypeService", () => {
  let ctx: ReturnType<typeof setup>;
  beforeEach(() => {
    ctx = setup();
  });

  it("creates a copy for each assigned member, including their starting location", async () => {
    const result = await ctx.service.sync({
      templateId: 1,
      assigned: [
        { userId: 100, hidden: false },
        { userId: 101, hidden: true },
      ],
    });
    expect(result.created).toEqual([100, 101]);
    expect(ctx.children.map((c) => [c.userId, c.hidden, c.values.slug, c.values.title])).toEqual([
      [100, false, "onboarding", "Onboarding call"],
      [101, true, "onboarding", "Onboarding call"],
    ]);
    expect(ctx.children[0].values.locations).toEqual([{ type: "integrations:daily" }]);
  });

  it("pushes template changes to copies but leaves each member's location alone", async () => {
    await ctx.service.sync({ templateId: 1, assigned: [{ userId: 100, hidden: false }] });
    ctx.children[0].values.locations = [
      { type: "integrations:zoom" },
    ] as unknown as TemplateValues["locations"];
    (ctx.template.values as Record<string, unknown>).title = "Kick-off call";
    (ctx.template.values as Record<string, unknown>).length = 45;

    await ctx.service.sync({ templateId: 1 });
    expect(ctx.children[0].values).toMatchObject({
      title: "Kick-off call",
      length: 45,
      locations: [{ type: "integrations:zoom" }],
    });
  });

  it("removes copies for members who are unassigned", async () => {
    await ctx.service.sync({
      templateId: 1,
      assigned: [
        { userId: 100, hidden: false },
        { userId: 101, hidden: false },
      ],
    });
    const result = await ctx.service.sync({ templateId: 1, assigned: [{ userId: 101, hidden: false }] });
    expect(result).toMatchObject({ created: [], removed: 1, updated: 1 });
    expect(ctx.children.map((c) => c.userId)).toEqual([101]);
  });

  it("only allows accepted team members", async () => {
    await expect(
      ctx.service.sync({ templateId: 1, assigned: [{ userId: 999, hidden: false }] })
    ).rejects.toThrow("Only team members");
    expect(ctx.children).toHaveLength(0);
  });

  it("refuses to create a copy that would clash with a member's own service URL", async () => {
    await expect(
      ctx.service.sync({ templateId: 1, assigned: [{ userId: 102, hidden: false }] })
    ).rejects.toThrow("/onboarding");
    expect(ctx.children).toHaveLength(0);
  });

  it("does nothing for services that aren't managed", async () => {
    ctx = setup({ schedulingType: SchedulingType.ROUND_ROBIN });
    expect(await ctx.service.sync({ templateId: 1, assigned: [{ userId: 100, hidden: false }] })).toEqual({
      created: [],
      updated: 0,
      removed: 0,
    });
    expect(ctx.children).toHaveLength(0);
  });
});
