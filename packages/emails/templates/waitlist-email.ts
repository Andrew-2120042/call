import dayjs from "@calcom/dayjs";
import { EMAIL_FROM_NAME } from "@calcom/lib/constants";
import type { TFunction } from "i18next";
import renderEmail from "../src/renderEmail";
import BaseEmail from "./_base-email";

type WaitlistEmailBase = {
  to: { name: string; email: string; timeZone: string };
  hostName: string;
  serviceTitle: string;
  startTime: Date;
  t: TFunction;
};

// i18next HTML-escapes interpolated values ("/" becomes "&#x2F;"); the email renderer already escapes
// text and subjects are plain text, so escaping here would show entities to the reader.
const RAW = { interpolation: { escapeValue: false } } as const;

export const formatWaitlistTime = (date: Date, timeZone: string, locale = "en") =>
  `${dayjs(date).tz(timeZone).locale(locale).format("dddd, MMMM D, YYYY h:mma")} (${timeZone})`;

abstract class WaitlistBaseEmail<T extends WaitlistEmailBase> extends BaseEmail {
  constructor(protected readonly data: T) {
    super();
  }

  protected abstract content(): {
    subject: string;
    title: string;
    body: string;
    cta?: { label: string; href: string };
  };

  protected async getNodeMailerPayload(): Promise<Record<string, unknown>> {
    const { subject, title, body, cta } = this.content();
    const { t } = this.data;
    const when = formatWaitlistTime(this.data.startTime, this.data.to.timeZone);
    return {
      to: `${this.data.to.name} <${this.data.to.email}>`,
      from: `${EMAIL_FROM_NAME} <${this.getMailerOptions().from}>`,
      subject,
      html: await renderEmail("WaitlistEmail", {
        subject,
        title,
        body,
        whenLabel: t("when"),
        when,
        serviceLabel: t("what"),
        service: this.data.serviceTitle,
        cta,
      }),
      text: [
        title,
        body,
        `${t("what")}: ${this.data.serviceTitle}`,
        `${t("when")}: ${when}`,
        cta ? `${cta.label}: ${cta.href}` : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
    };
  }
}

export class WaitlistJoinedEmail extends WaitlistBaseEmail<WaitlistEmailBase & { position: number }> {
  protected content() {
    const { t, serviceTitle, hostName, position, startTime, to } = this.data;
    const date = formatWaitlistTime(startTime, to.timeZone);
    return {
      subject: t("waitlist_joined_subject", { eventTitle: serviceTitle, ...RAW }),
      title: t("waitlist_joined_title"),
      body: t("waitlist_joined_body", { date, hostName, position, ...RAW }),
    };
  }
}

export class WaitlistOfferEmail extends WaitlistBaseEmail<
  WaitlistEmailBase & { claimUrl: string; offerExpiresAt: Date }
> {
  protected content() {
    const { t, serviceTitle, hostName, startTime, to, claimUrl, offerExpiresAt } = this.data;
    const date = formatWaitlistTime(startTime, to.timeZone);
    return {
      subject: t("waitlist_offer_subject", { eventTitle: serviceTitle, date, ...RAW }),
      title: t("waitlist_offer_title"),
      body: t("waitlist_offer_body", {
        date,
        hostName,
        expiresAt: formatWaitlistTime(offerExpiresAt, to.timeZone),
        ...RAW,
      }),
      cta: { label: t("waitlist_offer_cta"), href: claimUrl },
    };
  }
}
