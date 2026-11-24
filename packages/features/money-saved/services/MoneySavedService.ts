import type { MoneySavedRepository, ServiceOption } from "../repositories/MoneySavedRepository";

export type MoneySavedSummary = {
  refilled: number;
  rebooked: number;
  caught: number;
  sessionsSaved: number;
  /** Sum of each saved session's own service price; null when none of them has a price yet. */
  amountSaved: number | null;
  /** Saved sessions whose service has no price, so they're missing from the amount. */
  unpriced: number;
  services: (ServiceOption & { price: number | null; savedThisMonth: number })[];
  monthStart: Date;
};

const startOfMonthUtc = (now: Date) => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

/**
 * "This month Calbee refilled 3 sessions and caught 2 no-shows": proof the tool pays for itself. Each saved
 * session is valued at its own service's price. A caught no-show isn't money until someone else books the time.
 */
export class MoneySavedService {
  constructor(private repository: MoneySavedRepository) {}

  async getSummary(userId: number, now = new Date()): Promise<MoneySavedSummary> {
    const monthStart = startOfMonthUtc(now);
    const [saved, caught, services, prices] = await Promise.all([
      this.repository.findSavedSessionsSince(userId, monthStart),
      this.repository.countCaughtNoShowsSince(userId, monthStart),
      this.repository.findServices(userId),
      this.repository.findServicePrices(userId),
    ]);

    const savedByService = new Map<number, number>();
    let amount = 0;
    let unpriced = 0;
    for (const session of saved) {
      if (session.eventTypeId !== null) savedByService.set(session.eventTypeId, (savedByService.get(session.eventTypeId) ?? 0) + 1);
      const price = session.eventTypeId !== null ? prices[String(session.eventTypeId)] : undefined;
      if (price) amount += price;
      else unpriced++;
    }
    const priced = saved.length - unpriced;
    return {
      refilled: saved.filter((s) => s.via === "waitlist").length,
      rebooked: saved.filter((s) => s.via === "rebook").length,
      caught,
      sessionsSaved: saved.length,
      amountSaved: priced > 0 ? amount : null,
      unpriced,
      services: services.map((s) => ({ ...s, price: prices[String(s.id)] ?? null, savedThisMonth: savedByService.get(s.id) ?? 0 })),
      monthStart,
    };
  }

  async setServicePrices(userId: number, prices: { eventTypeId: number; price: number | null }[]) {
    const owned = new Set((await this.repository.findServices(userId)).map((s) => s.id));
    const next: Record<string, number> = await this.repository.findServicePrices(userId);
    for (const { eventTypeId, price } of prices) {
      if (!owned.has(eventTypeId)) continue;
      if (price === null) delete next[String(eventTypeId)];
      else next[String(eventTypeId)] = price;
    }
    await this.repository.saveServicePrices(userId, next);
  }
}
