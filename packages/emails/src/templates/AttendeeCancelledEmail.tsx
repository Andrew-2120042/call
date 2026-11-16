import { WEBAPP_URL } from "@calcom/lib/constants";

import { CallToAction, CallToActionTable } from "../components";
import { AttendeeScheduledEmail } from "./AttendeeScheduledEmail";

/** The client's cancellation email. "Pick a new time" opens the cancelled booking, which suggests new times. */
export const AttendeeCancelledEmail = (props: React.ComponentProps<typeof AttendeeScheduledEmail>) => {
  const canRebook = !props.calEvent.team && !!props.calEvent.uid;
  return (
    <AttendeeScheduledEmail
      title="event_request_cancelled"
      headerType="xCircle"
      subject="event_cancelled_subject"
      callToAction={
        canRebook ? (
          <CallToActionTable>
            <CallToAction
              label={props.attendee.language.translate("rebook_email_cta")}
              href={`${WEBAPP_URL}/booking/${props.calEvent.uid}`}
            />
          </CallToActionTable>
        ) : null
      }
      {...props}
    />
  );
};
