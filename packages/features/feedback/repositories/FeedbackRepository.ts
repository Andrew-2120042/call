import type { PrismaClient } from "@calcom/prisma";

export class FeedbackRepository {
  constructor(private readonly prismaClient: PrismaClient) {}

  async create(data: { userId: number; kind: string; message: string }) {
    return this.prismaClient.feedback.create({
      data: { userId: data.userId, rating: data.kind, comment: data.message },
      select: { id: true },
    });
  }

  async countSince(params: { userId: number; since: Date }) {
    return this.prismaClient.feedback.count({ where: { userId: params.userId, date: { gte: params.since } } });
  }

  async findSender(userId: number) {
    return this.prismaClient.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, username: true },
    });
  }
}

export type IFeedbackRepository = Pick<FeedbackRepository, "create" | "countSince" | "findSender">;
