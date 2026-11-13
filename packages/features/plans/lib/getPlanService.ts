import process from "node:process";
import { WEBAPP_URL } from "@calcom/lib/constants";
import logger from "@calcom/lib/logger";
import { prisma } from "@calcom/prisma";
import { PlanSubscriptionRepository } from "../repositories/PlanSubscriptionRepository";
import { PlanService } from "../services/PlanService";
import { createPolarGateway } from "./polarGateway";

let service: PlanService | null = null;

/** Billing is off (everyone is on Free) until POLAR_ACCESS_TOKEN and the product ids are configured. */
export function getPlanService(): PlanService {
  if (service) return service;
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  service = new PlanService({
    repository: new PlanSubscriptionRepository(prisma),
    polar: accessToken
      ? createPolarGateway({
          accessToken,
          environment: process.env.POLAR_ENVIRONMENT === "production" ? "production" : "sandbox",
        })
      : null,
    productIds: { pro: process.env.POLAR_PRO_PRODUCT_ID, team: process.env.POLAR_TEAM_PRODUCT_ID },
    webappUrl: WEBAPP_URL,
    logger: logger.getSubLogger({ prefix: ["[plans]"] }),
  });
  return service;
}
