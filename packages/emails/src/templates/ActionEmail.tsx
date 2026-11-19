import { BaseEmailHtml, CallToAction, CallToActionTable, Info, Separator } from "../components";

export type ActionEmailProps = {
  subject: string;
  title: string;
  body: string;
  whenLabel: string;
  when: string;
  serviceLabel: string;
  service: string;
  cta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

export const ActionEmail = (
  props: ActionEmailProps & Partial<React.ComponentProps<typeof BaseEmailHtml>>
) => {
  return (
    <BaseEmailHtml
      subject={props.subject}
      title={props.title}
      headerType="calendarCircle"
      callToAction={
        props.cta && props.secondaryCta ? (
          <CallToActionTable>
            <CallToAction label={props.cta.label} href={props.cta.href} />
            <Separator />
            <CallToAction label={props.secondaryCta.label} href={props.secondaryCta.href} secondary />
          </CallToActionTable>
        ) : props.cta ? (
          <CallToAction label={props.cta.label} href={props.cta.href} />
        ) : null
      }>
      <p style={{ fontWeight: 400, lineHeight: "24px", margin: "0 0 16px", whiteSpace: "pre-line" }}>
        {props.body}
      </p>
      <Info label={props.serviceLabel} description={props.service} withSpacer />
      <Info label={props.whenLabel} description={props.when} withSpacer />
    </BaseEmailHtml>
  );
};
