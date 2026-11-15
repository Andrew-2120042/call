import { createHash } from "node:crypto";
import prisma from "@calcom/prisma";
import type { ApiKey } from "@calcom/prisma/client";

function hashAPIKey(apiKey: string): string {
  return createHash("sha256").update(apiKey).digest("hex");
}

export async function findValidApiKey(apiKey: string, appId: string): Promise<ApiKey | null> {
  // Keys are stored hashed without their display prefix (API_KEY_PREFIX), so strip it before hashing.
  const prefix = process.env.API_KEY_PREFIX ?? "cal_";
  const rawKey = apiKey.startsWith(prefix) ? apiKey.slice(prefix.length) : apiKey;
  const hashedKey = hashAPIKey(rawKey);

  return prisma.apiKey.findFirst({
    where: {
      hashedKey,
      appId,
      OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
    },
  });
}
