import process from "node:process";
import { WEBAPP_URL } from "@calcom/lib/constants";
import logger from "@calcom/lib/logger";
import { prisma } from "@calcom/prisma";
import { PlanSubscriptionRepository } from "../repositories/PlanSubscriptionRepository";
import type { IBillingGateway, PlanProductIds } from "../services/PlanService";
import { PlanService } from "../services/PlanService";
import { createDodoGateway } from "./dodoGateway";
import { createPolarGateway } from "./polarGateway";

let service: PlanService | null = null;

/** Dodo when DODO_API_KEY is set, otherwise Polar when POLAR_ACCESS_TOKEN is; with neither, everyone is on Free. */
export function billingProvider(): "dodo" | "polar" | null {
  if (process.env.DODO_API_KEY) return "dodo";
  if (process.env.POLAR_ACCESS_TOKEN) return "polar";
  return null;
}

function billingSetup(): { gateway: IBillingGateway | null; productIds: PlanProductIds } {
  const provider = billingProvider();
  if (provider === "dodo") {
    return {
      gateway: createDodoGateway({
        apiKey: process.env.DODO_API_KEY ?? "",
        environment: process.env.DODO_ENVIRONMENT === "live_mode" ? "live_mode" : "test_mode",
      }),
      productIds: { pro: process.env.DODO_PRO_PRODUCT_ID, team: process.env.DODO_TEAM_PRODUCT_ID },
    };
  }
  if (provider === "polar") {
    return {
      gateway: createPolarGateway({
        accessToken: process.env.POLAR_ACCESS_TOKEN ?? "",
        environment: process.env.POLAR_ENVIRONMENT === "production" ? "production" : "sandbox",
      }),
      productIds: { pro: process.env.POLAR_PRO_PRODUCT_ID, team: process.env.POLAR_TEAM_PRODUCT_ID },
    };
  }
  return { gateway: null, productIds: {} };
}

export function getPlanService(): PlanService {
  if (service) return service;
  service = new PlanService({
    repository: new PlanSubscriptionRepository(prisma),
    ...billingSetup(),
    webappUrl: WEBAPP_URL,
    logger: logger.getSubLogger({ prefix: ["[plans]"] }),
  });
  return service;
}
