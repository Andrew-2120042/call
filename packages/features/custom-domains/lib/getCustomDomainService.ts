import { promises as dns } from "node:dns";
import process from "node:process";
import { getPlanService } from "@calcom/features/plans/lib/getPlanService";
import { WEBAPP_URL, WEBSITE_URL } from "@calcom/lib/constants";
import { prisma } from "@calcom/prisma";
import { CustomDomainRepository } from "../repositories/CustomDomainRepository";
import { CustomDomainService } from "../services/CustomDomainService";
import { createVercelDomainHost } from "./vercelDomainHost";

let service: CustomDomainService | null = null;

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
};

export function getCustomDomainService(): CustomDomainService {
  if (service) return service;
  const token = process.env.VERCEL_DOMAINS_API_TOKEN;
  const projectId = process.env.VERCEL_DOMAINS_PROJECT_ID;
  service = new CustomDomainService({
    repository: new CustomDomainRepository(prisma),
    dns,
    host:
      token && projectId
        ? createVercelDomainHost({ token, projectId, teamId: process.env.VERCEL_DOMAINS_TEAM_ID })
        : null,
    isEntitled: (userId) => getPlanService().hasFeature(userId, "customDomain"),
    reservedHosts: [hostOf(WEBAPP_URL), hostOf(WEBSITE_URL), "localhost", "vercel.app"].filter(
      (host): host is string => !!host
    ),
    cnameTarget: process.env.CUSTOM_DOMAIN_CNAME_TARGET || null,
  });
  return service;
}
