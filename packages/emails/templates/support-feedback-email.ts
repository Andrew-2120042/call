import { APP_NAME, SUPPORT_MAIL_ADDRESS } from "@calcom/lib/constants";
import BaseEmail from "./_base-email";

export type SupportFeedbackEmailData = {
  kind: string;
  message: string;
  page: string | null;
  sender: { id: number; name: string | null; email: string; username: string | null };
};

/** Internal: what someone wrote in "Help & feedback", sent to the support inbox. Replying answers them. */
export class SupportFeedbackEmail extends BaseEmail {
  constructor(private readonly data: SupportFeedbackEmailData) {
    super();
  }

  protected async getNodeMailerPayload(): Promise<Record<string, unknown>> {
    const { kind, message, page, sender } = this.data;
    const who = sender.name ? `${sender.name} <${sender.email}>` : sender.email;
    return {
      to: SUPPORT_MAIL_ADDRESS,
      from: `${APP_NAME} <${this.getMailerOptions().from}>`,
      replyTo: who,
      subject: `[${APP_NAME} ${kind}] from ${sender.name || sender.email}`,
      text: [
        message,
        "",
        `From: ${who}`,
        `Account: #${sender.id}${sender.username ? ` (${sender.username})` : ""}`,
        page ? `Page: ${page}` : "",
      ]
        .filter((line) => line !== "")
        .join("\n"),
    };
  }
}
