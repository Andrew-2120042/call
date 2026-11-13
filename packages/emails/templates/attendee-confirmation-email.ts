import { EMAIL_FROM_NAME } from "@calcom/lib/constants";
import type { TFunction } from "i18next";
import renderEmail from "../src/renderEmail";
import BaseEmail from "./_base-email";
import { formatWaitlistTime as formatInZone } from "./waitlist-email";

// i18next escapes interpolated values ("/" → "&#x2F;"); output is escaped by the renderer instead.
const RAW = { interpolation: { escapeValue: false } } as const;

type Person = { name: string; email: string; timeZone: string };

type CommonData = {
  to: Person;
  serviceTitle: string;
  startTime: Date;
  t: TFunction;
};

abstract class ActionBaseEmail<T extends CommonData> extends BaseEmail {
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
    const when = formatInZone(this.data.startTime, this.data.to.timeZone);
    return {
      to: `${this.data.to.name} <${this.data.to.email}>`,
      from: `${EMAIL_FROM_NAME} <${this.getMailerOptions().from}>`,
      subject,
      html: await renderEmail("ActionEmail", {
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

export class AttendeeConfirmationRequestEmail extends ActionBaseEmail<
  CommonData & { hostName: string; confirmUrl: string; deadline: Date }
> {
  protected content() {
    const { t, serviceTitle, hostName, startTime, to, confirmUrl, deadline } = this.data;
    const date = formatInZone(startTime, to.timeZone);
    return {
      subject: t("attendee_confirmation_request_subject", { eventTitle: serviceTitle, date, ...RAW }),
      title: t("attendee_confirmation_request_title"),
      body: t("attendee_confirmation_request_body", {
        date,
        hostName,
        deadline: formatInZone(deadline, to.timeZone),
        ...RAW,
      }),
      cta: { label: t("attendee_confirmation_request_cta"), href: confirmUrl },
    };
  }
}

export class HostUnconfirmedBookingEmail extends ActionBaseEmail<
  CommonData & { attendeeName: string; released: boolean; bookingUrl: string }
> {
  protected content() {
    const { t, serviceTitle, attendeeName, startTime, to, released, bookingUrl } = this.data;
    const date = formatInZone(startTime, to.timeZone);
    return {
      subject: t(released ? "host_unconfirmed_released_subject" : "host_unconfirmed_subject", {
        attendeeName,
        date,
        ...RAW,
      }),
      title: t(released ? "host_unconfirmed_released_title" : "host_unconfirmed_title"),
      body: t(released ? "host_unconfirmed_released_body" : "host_unconfirmed_body", {
        attendeeName,
        eventTitle: serviceTitle,
        date,
        ...RAW,
      }),
      cta: { label: t("view_booking"), href: bookingUrl },
    };
  }
}

export class AttendeeReminderEmail extends ActionBaseEmail<
  CommonData & { hostName: string; manageUrl: string }
> {
  protected content() {
    const { t, serviceTitle, hostName, startTime, to, manageUrl } = this.data;
    const date = formatInZone(startTime, to.timeZone);
    return {
      subject: t("attendee_reminder_subject", { eventTitle: serviceTitle, date, ...RAW }),
      title: t("attendee_reminder_title"),
      body: t("attendee_reminder_body", { date, hostName, ...RAW }),
      cta: { label: t("attendee_reminder_cta"), href: manageUrl },
    };
  }
}
