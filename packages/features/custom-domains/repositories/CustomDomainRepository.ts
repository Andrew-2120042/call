import type { PrismaClient } from "@calcom/prisma";

export type StoredCustomDomain = {
  userId: number;
  domain: string;
  verificationToken: string;
  verifiedAt: Date | null;
  lastCheckedAt: Date | null;
};

const select = {
  userId: true,
  domain: true,
  verificationToken: true,
  verifiedAt: true,
  lastCheckedAt: true,
} as const;

export class CustomDomainRepository {
  constructor(private readonly prismaClient: PrismaClient) {}

  findByUserId(userId: number): Promise<StoredCustomDomain | null> {
    return this.prismaClient.customDomain.findUnique({ where: { userId }, select });
  }

  findByDomainIncludeUsername(domain: string) {
    return this.prismaClient.customDomain.findUnique({
      where: { domain },
      select: { ...select, user: { select: { username: true } } },
    });
  }

  async isDomainTaken(domain: string, exceptUserId: number) {
    const count = await this.prismaClient.customDomain.count({
      where: { domain, NOT: { userId: exceptUserId } },
    });
    return count > 0;
  }

  async upsertForUser(data: { userId: number; domain: string; verificationToken: string }) {
    await this.prismaClient.customDomain.upsert({
      where: { userId: data.userId },
      create: data,
      update: { domain: data.domain, verificationToken: data.verificationToken, verifiedAt: null },
    });
  }

  async markChecked(userId: number, verifiedAt: Date | null, checkedAt: Date) {
    await this.prismaClient.customDomain.update({
      where: { userId },
      data: { verifiedAt, lastCheckedAt: checkedAt },
    });
  }

  async deleteForUser(userId: number) {
    await this.prismaClient.customDomain.deleteMany({ where: { userId } });
  }
}
