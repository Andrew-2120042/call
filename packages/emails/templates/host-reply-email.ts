import { EMAIL_FROM_NAME } from "@calcom/lib/constants";
import type { TFunction } from "i18next";
import renderEmail from "../src/renderEmail";
import BaseEmail from "./_base-email";
import { formatWaitlistTime } from "./waitlist-email";

export type HostReplyEmailData = {
  to: { name: string; email: string; timeZone: string };
  host: { name: string; email: string };
  serviceTitle: string;
  startTime: Date;
  message: string;
  t: TFunction;
};

const RAW = { interpolation: { escapeValue: false } } as const;

/** A personal message from the host about a booking request. Replies go straight to the host's own inbox. */
export class HostReplyEmail extends BaseEmail {
  constructor(private readonly data: HostReplyEmailData) {
    super();
  }

  protected async getNodeMailerPayload(): Promise<Record<string, unknown>> {
    const { t, to, host, serviceTitle, startTime, message } = this.data;
    const when = formatWaitlistTime(startTime, to.timeZone);
    const subject = t("host_reply_subject", { hostName: host.name, eventTitle: serviceTitle, ...RAW });
    const title = t("host_reply_title", { hostName: host.name, ...RAW });
    return {
      to: `${to.name} <${to.email}>`,
      from: `${host.name} via ${EMAIL_FROM_NAME} <${this.getMailerOptions().from}>`,
      replyTo: `${host.name} <${host.email}>`,
      subject,
      html: await renderEmail("ActionEmail", {
        subject,
        title,
        body: message,
        whenLabel: t("when"),
        when,
        serviceLabel: t("what"),
        service: serviceTitle,
      }),
      text: [title, message, `${t("what")}: ${serviceTitle}`, `${t("when")}: ${when}`].join("\n\n"),
    };
  }
}
