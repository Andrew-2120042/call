import dayjs from "@calcom/dayjs";
import { EMAIL_FROM_NAME } from "@calcom/lib/constants";
import type { TFunction } from "i18next";
import renderEmail from "../src/renderEmail";
import BaseEmail from "./_base-email";

export type RebookOfferEmailData = {
  to: { name: string; email: string; timeZone: string };
  hostName: string;
  serviceTitle: string;
  startTime: Date;
  bookUrl: string;
  moreTimesUrl: string;
  t: TFunction;
};

// The renderer escapes text itself; i18next escaping on top would show "&#x2F;" to the reader.
const RAW = { interpolation: { escapeValue: false } } as const;

/** Sent to a client a few minutes after they cancel: one open time they can take in a click, or the full list. */
export class RebookOfferEmail extends BaseEmail {
  constructor(private readonly data: RebookOfferEmailData) {
    super();
  }

  protected async getNodeMailerPayload(): Promise<Record<string, unknown>> {
    const { t, to, hostName, serviceTitle, startTime } = this.data;
    const local = dayjs(startTime).tz(to.timeZone);
    const shortTime = local.format("ddd h:mma");
    const when = `${local.format("dddd, MMMM D, YYYY h:mma")} (${to.timeZone})`;
    const firstName = to.name.split(" ")[0] || to.name;
    const subject = t("rebook_offer_subject", { hostName, ...RAW });
    const title = t("rebook_offer_title", { hostName, ...RAW });
    const body = t("rebook_offer_body", { name: firstName, hostName, ...RAW });
    const cta = { label: t("rebook_offer_cta", { time: shortTime, ...RAW }), href: this.data.bookUrl };
    const secondaryCta = { label: t("rebook_offer_more_times"), href: this.data.moreTimesUrl };
    return {
      to: `${to.name} <${to.email}>`,
      from: `${EMAIL_FROM_NAME} <${this.getMailerOptions().from}>`,
      subject,
      html: await renderEmail("ActionEmail", {
        subject,
        title,
        body,
        whenLabel: t("when"),
        when,
        serviceLabel: t("what"),
        service: serviceTitle,
        cta,
        secondaryCta,
      }),
      text: [title, body, `${cta.label}: ${cta.href}`, `${secondaryCta.label}: ${secondaryCta.href}`].join(
        "\n\n"
      ),
    };
  }
}
