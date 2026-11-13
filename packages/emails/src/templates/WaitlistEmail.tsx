import { BaseEmailHtml, CallToAction, Info } from "../components";

export type WaitlistEmailProps = {
  subject: string;
  title: string;
  body: string;
  whenLabel: string;
  when: string;
  serviceLabel: string;
  service: string;
  cta?: { label: string; href: string };
};

export const WaitlistEmail = (
  props: WaitlistEmailProps & Partial<React.ComponentProps<typeof BaseEmailHtml>>
) => {
  return (
    <BaseEmailHtml
      subject={props.subject}
      title={props.title}
      headerType="calendarCircle"
      callToAction={props.cta ? <CallToAction label={props.cta.label} href={props.cta.href} /> : null}>
      <p style={{ fontWeight: 400, lineHeight: "24px", margin: "0 0 16px" }}>{props.body}</p>
      <Info label={props.serviceLabel} description={props.service} withSpacer />
      <Info label={props.whenLabel} description={props.when} withSpacer />
    </BaseEmailHtml>
  );
};
