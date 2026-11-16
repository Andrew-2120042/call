import { ErrorWithCode } from "@calcom/lib/errors";
import type { IFeedbackRepository } from "../repositories/FeedbackRepository";

export const FEEDBACK_KINDS = ["feedback", "problem", "question"] as const;
export type FeedbackKind = (typeof FEEDBACK_KINDS)[number];
export const MAX_FEEDBACK_LENGTH = 4000;
const DAILY_LIMIT = 20;

export type FeedbackEmail = {
  kind: FeedbackKind;
  message: string;
  page: string | null;
  sender: { id: number; name: string | null; email: string; username: string | null };
};

/** "Help & feedback" in the app: saves what the person wrote and emails it to support, reply-to them. */
export class FeedbackService {
  constructor(
    private readonly deps: {
      repository: IFeedbackRepository;
      sendToSupport: (email: FeedbackEmail) => Promise<void>;
      now?: () => Date;
      logger?: { error: (...args: unknown[]) => void };
    }
  ) {}

  async submit(input: { userId: number; kind: FeedbackKind; message: string; page?: string | null }) {
    const message = input.message.trim().slice(0, MAX_FEEDBACK_LENGTH);
    if (message.length < 3) throw ErrorWithCode.Factory.BadRequest("Write a few words so we can help");
    const sender = await this.deps.repository.findSender(input.userId);
    if (!sender) throw ErrorWithCode.Factory.NotFound("Account not found");

    const now = this.deps.now?.() ?? new Date();
    const sentToday = await this.deps.repository.countSince({
      userId: input.userId,
      since: new Date(now.getTime() - 24 * 60 * 60_000),
    });
    if (sentToday >= DAILY_LIMIT) {
      throw ErrorWithCode.Factory.BadRequest("You've sent a lot of messages today. Please try again tomorrow.");
    }

    // Saved first, so a mail outage never loses what someone took the time to write.
    const saved = await this.deps.repository.create({ userId: input.userId, kind: input.kind, message });
    try {
      await this.deps.sendToSupport({ kind: input.kind, message, page: input.page?.slice(0, 300) ?? null, sender });
    } catch (error) {
      this.deps.logger?.error("[feedback] saved but the support email failed", { id: saved.id, error });
    }
    return { id: saved.id };
  }
}
