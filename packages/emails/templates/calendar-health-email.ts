import { EMAIL_FROM_NAME } from "@calcom/lib/constants";
import type { TFunction } from "i18next";
import renderEmail from "../src/renderEmail";
import BaseEmail from "./_base-email";

const RAW = { interpolation: { escapeValue: false } } as const;

export class CalendarBrokenEmail extends BaseEmail {
  constructor(
    private readonly data: {
      to: { name: string; email: string };
      appName: string;
      error: string;
      reconnectUrl: string;
      t: TFunction;
    }
  ) {
    super();
  }

  protected async getNodeMailerPayload(): Promise<Record<string, unknown>> {
    const { t, appName, error, reconnectUrl, to } = this.data;
    const subject = t("calendar_health_subject", { appName, ...RAW });
    const title = t("calendar_health_title", { appName, ...RAW });
    const body = t("calendar_health_body", RAW);
    const cta = { label: t("calendar_health_cta"), href: reconnectUrl };
    return {
      to: `${to.name} <${to.email}>`,
      from: `${EMAIL_FROM_NAME} <${this.getMailerOptions().from}>`,
      subject,
      html: await renderEmail("ActionEmail", {
        subject,
        title,
        body,
        serviceLabel: t("calendar_health_calendar_label"),
        service: appName,
        whenLabel: t("calendar_health_problem_label"),
        when: error,
        cta,
      }),
      text: [
        title,
        body,
        `${t("calendar_health_problem_label")}: ${error}`,
        `${cta.label}: ${cta.href}`,
      ].join("\n\n"),
    };
  }
}
