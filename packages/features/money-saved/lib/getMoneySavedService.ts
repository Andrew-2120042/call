import { prisma } from "@calcom/prisma";
import { MoneySavedRepository } from "../repositories/MoneySavedRepository";
import { MoneySavedService } from "../services/MoneySavedService";

let service: MoneySavedService | null = null;

export function getMoneySavedService(): MoneySavedService {
  if (service) return service;
  service = new MoneySavedService(new MoneySavedRepository(prisma));
  return service;
}
