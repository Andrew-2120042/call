import slugify from "@calcom/lib/slugify";
import type { PrismaClient } from "@calcom/prisma";
import type { Prisma } from "@calcom/prisma/client";
import { uniqueSlug } from "../../calendly-import/lib/mapCalendly";
import type {
  AssistantPageSnapshot,
  AssistantServiceSummary,
  IAssistantActions,
  NewService,
  ServicePatch,
} from "../lib/types";

const serviceSelect = {
  id: true,
  title: true,
  slug: true,
  length: true,
  description: true,
  requiresConfirmation: true,
  hidden: true,
} as const;

type ServiceRow = {
  id: number;
  title: string;
  slug: string;
  length: number;
  description: string | null;
  requiresConfirmation: boolean;
  hidden: boolean;
};

export class AssistantActionsRepository implements IAssistantActions {
  constructor(
    private readonly prismaClient: PrismaClient,
    private readonly options: {
      webappUrl: string;
      username: string | null;
      profileId: number | null;
      defaultLocations: Prisma.EventTypeCreateInput["locations"];
    }
  ) {}

  private toSummary(row: ServiceRow): AssistantServiceSummary {
    return {
      id: row.id,
      title: row.title,
      minutes: row.length,
      description: row.description,
      needsApproval: row.requiresConfirmation,
      hidden: row.hidden,
      url: `${this.options.webappUrl}/${this.options.username ?? ""}/${row.slug}`,
    };
  }

  async getPage(userId: number): Promise<AssistantPageSnapshot> {
    const [user, services] = await Promise.all([
      this.prismaClient.user.findUnique({
        where: { id: userId },
        select: { name: true, bio: true },
      }),
      this.prismaClient.eventType.findMany({
        where: { userId, teamId: null, parentId: null },
        orderBy: [{ position: "desc" }, { id: "asc" }],
        select: serviceSelect,
      }),
    ]);
    return {
      name: user?.name ?? "",
      bio: user?.bio ?? "",
      services: services.map((row) => this.toSummary(row)),
    };
  }

  async createService(userId: number, input: NewService) {
    const existing = await this.prismaClient.eventType.findMany({
      where: { userId },
      select: { slug: true },
    });
    const slug = uniqueSlug(
      slugify(input.title) || `meeting-${input.minutes}`,
      new Set(existing.map((row) => row.slug))
    );
    const row = await this.prismaClient.eventType.create({
      data: {
        title: input.title,
        slug,
        length: input.minutes,
        description: input.description ?? null,
        requiresConfirmation: input.needsApproval,
        owner: { connect: { id: userId } },
        users: { connect: { id: userId } },
        locations: this.options.defaultLocations,
        metadata: { createdBy: "assistant" },
        ...(this.options.profileId ? { profile: { connect: { id: this.options.profileId } } } : {}),
      },
      select: serviceSelect,
    });
    return this.toSummary(row);
  }

  async updateService(userId: number, serviceId: number, patch: ServicePatch) {
    const result = await this.prismaClient.eventType.updateMany({
      where: { id: serviceId, userId, teamId: null },
      data: {
        ...(patch.title !== undefined ? { title: patch.title } : {}),
        ...(patch.minutes !== undefined ? { length: patch.minutes } : {}),
        ...(patch.description !== undefined ? { description: patch.description } : {}),
        ...(patch.needsApproval !== undefined ? { requiresConfirmation: patch.needsApproval } : {}),
        ...(patch.hidden !== undefined ? { hidden: patch.hidden } : {}),
      },
    });
    if (result.count === 0) return null;
    const row = await this.prismaClient.eventType.findUnique({
      where: { id: serviceId },
      select: serviceSelect,
    });
    return row ? this.toSummary(row) : null;
  }

  async updateProfile(userId: number, patch: { name?: string; bio?: string }) {
    await this.prismaClient.user.update({ where: { id: userId }, data: patch });
  }
}
