import type { MoneySavedCounts, MoneySavedRepository } from "../repositories/MoneySavedRepository";

export type MoneySavedSummary = MoneySavedCounts & {
  /** Sessions that would otherwise have been lost: refilled by the waitlist or rebooked after a cancel. */
  sessionsSaved: number;
  sessionValue: number | null;
  /** Dollars kept this month; null until the host tells us what a session is worth. */
  amountSaved: number | null;
  monthStart: Date;
};

const startOfMonthUtc = (now: Date) => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

/**
 * "This month Calbee refilled 3 sessions and caught 2 no-shows": proof the tool pays for itself. A caught no-show
 * isn't counted as money saved, because the time is only saved if someone else then books it.
 */
export class MoneySavedService {
  constructor(private repository: MoneySavedRepository) {}

  async getSummary(userId: number, now = new Date()): Promise<MoneySavedSummary> {
    const monthStart = startOfMonthUtc(now);
    const [counts, sessionValue] = await Promise.all([
      this.repository.countSince(userId, monthStart),
      this.repository.findSessionValue(userId),
    ]);
    const sessionsSaved = counts.refilled + counts.rebooked;
    return {
      ...counts,
      sessionsSaved,
      sessionValue,
      amountSaved: sessionValue === null ? null : sessionsSaved * sessionValue,
      monthStart,
    };
  }

  setSessionValue(userId: number, value: number | null) {
    return this.repository.saveSessionValue(userId, value);
  }
}
