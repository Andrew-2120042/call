import type { PrismaClient } from "@calcom/prisma";
import type { IPlanSubscriptionRepository, StoredSubscription } from "../services/PlanService";

const select = {
  userId: true,
  plan: true,
  status: true,
  polarSubscriptionId: true,
  polarCustomerId: true,
  polarProductId: true,
  currentPeriodEnd: true,
  cancelAtPeriodEnd: true,
  polarModifiedAt: true,
} as const;

export class PlanSubscriptionRepository implements IPlanSubscriptionRepository {
  constructor(private readonly prismaClient: PrismaClient) {}

  async findByUserId(userId: number): Promise<StoredSubscription | null> {
    return this.prismaClient.planSubscription.findUnique({ where: { userId }, select });
  }

  async upsertForUser(subscription: StoredSubscription) {
    const { userId, ...data } = subscription;
    await this.prismaClient.planSubscription.upsert({
      where: { userId },
      create: subscription,
      update: data,
    });
  }

  async clearBrandingRemoval(userId: number) {
    await this.prismaClient.user.updateMany({
      where: { id: userId, hideBranding: true },
      data: { hideBranding: false },
    });
  }

  async userExists(userId: number) {
    const count = await this.prismaClient.user.count({ where: { id: userId } });
    return count > 0;
  }
}
