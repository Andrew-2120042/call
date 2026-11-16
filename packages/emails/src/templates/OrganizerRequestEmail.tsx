import { WEBAPP_URL } from "@calcom/lib/constants";
import { symmetricEncrypt } from "@calcom/lib/crypto";

import { CallToAction, Separator, CallToActionTable } from "../components";
import { OrganizerScheduledEmail } from "./OrganizerScheduledEmail";

/** The AI's read of a booking request, shown to the host in the request email when available. */
export type RequestInsightForEmail = {
  summary: string;
  fitLabel: string;
  spam: boolean;
  spamLabel: string;
  heading: string;
  reviewLabel: string;
  reviewUrl: string;
};

const FIT_COLORS: Record<string, string> = { good: "#15803d", unclear: "#b45309", poor: "#6b7280" };

const InsightBox = ({ insight, fit }: { insight: RequestInsightForEmail; fit: string }) => (
  <div
    style={{
      marginTop: "16px",
      padding: "14px 16px",
      borderRadius: "10px",
      border: "1px solid #e5e7eb",
      background: "#f9fafb",
      textAlign: "left",
    }}>
    <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#111827" }}>
      {insight.heading}{" "}
      <span style={{ marginLeft: "6px", fontSize: "12px", fontWeight: 600, color: FIT_COLORS[fit] ?? "#374151" }}>
        {insight.fitLabel}
      </span>
      {insight.spam && (
        <span style={{ marginLeft: "8px", fontSize: "12px", fontWeight: 600, color: "#b91c1c" }}>
          {insight.spamLabel}
        </span>
      )}
    </p>
    <p style={{ margin: "6px 0 0", fontSize: "14px", lineHeight: "22px", color: "#374151" }}>{insight.summary}</p>
    <p style={{ margin: "8px 0 0", fontSize: "13px" }}>
      <a href={insight.reviewUrl} style={{ color: "#2563eb", textDecoration: "underline" }}>
        {insight.reviewLabel}
      </a>
    </p>
  </div>
);

export const OrganizerRequestEmail = (
  props: React.ComponentProps<typeof OrganizerScheduledEmail> & {
    requestInsight?: RequestInsightForEmail;
    requestInsightFit?: string;
  }
) => {
  const seedData = {
    bookingUid: props.calEvent.uid,
    userId: props.calEvent.organizer.id,
    platformClientId: props.calEvent.platformClientId,
    platformRescheduleUrl: props.calEvent.platformRescheduleUrl,
    platformCancelUrl: props.calEvent.platformCancelUrl,
    platformBookingUrl: props.calEvent.platformBookingUrl,
  };
  const token = symmetricEncrypt(JSON.stringify(seedData), process.env.CALENDSO_ENCRYPTION_KEY || "");
  //TODO: We should switch to using org domain if available
  const actionHref = `${WEBAPP_URL}/api/link/?token=${encodeURIComponent(token)}`;
  return (
    <OrganizerScheduledEmail
      title={
        props.title || props.calEvent.recurringEvent?.count
          ? "event_awaiting_approval_recurring"
          : "event_awaiting_approval"
      }
      subtitle={
        <>
          {props.calEvent.organizer.language.translate("someone_requested_an_event")}
          {props.requestInsight && (
            <InsightBox insight={props.requestInsight} fit={props.requestInsightFit ?? "unclear"} />
          )}
        </>
      }
      headerType="calendarCircle"
      subject="event_awaiting_approval_subject"
      callToAction={
        <CallToActionTable>
          <CallToAction
            label={props.calEvent.organizer.language.translate("confirm")}
            href={`${actionHref}&action=accept`}
            startIconName="confirmIcon"
          />
          <Separator />
          <CallToAction
            label={props.calEvent.organizer.language.translate("reject")}
            href={`${actionHref}&action=reject`}
            startIconName="rejectIcon"
            secondary
          />
        </CallToActionTable>
      }
      {...props}
    />
  );
};
