import logger from "@calcom/lib/logger";
import { prisma } from "@calcom/prisma";
import { CalendarHealthRepository } from "../repositories/CalendarHealthRepository";
import { CalendarHealthService } from "../services/CalendarHealthService";
import { CalendarHealthEmailNotifier } from "./CalendarHealthEmailNotifier";
import { probeCalendarCredential } from "./probeCalendarCredential";

let service: CalendarHealthService | null = null;

export function getCalendarHealthService(): CalendarHealthService {
  if (service) return service;
  service = new CalendarHealthService({
    repository: new CalendarHealthRepository(prisma),
    probe: probeCalendarCredential,
    notifier: new CalendarHealthEmailNotifier(),
    logger: logger.getSubLogger({ prefix: ["[calendar-health]"] }),
  });
  return service;
}
