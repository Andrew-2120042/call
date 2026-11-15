import { localeOptions } from "@calcom/lib/i18n";
import { trpc } from "@calcom/trpc/react";
import { BookingRulesCard } from "./BookingRulesCard";
import type { EventAdvancedBaseProps } from "./EventAdvancedTab";
import { EventAdvancedTab } from "./EventAdvancedTab";

const EventAdvancedWebWrapper = ({ ...props }: EventAdvancedBaseProps) => {
  const connectedCalendarsQuery = trpc.viewer.calendars.connectedCalendars.useQuery();
  const verifiedEmails = undefined;
  return (
    <>
      <EventAdvancedTab
        {...props}
        calendarsQuery={{
          data: connectedCalendarsQuery.data,
          isPending: connectedCalendarsQuery.isPending,
          error: connectedCalendarsQuery.error,
        }}
        showBookerLayoutSelector={true}
        verifiedEmails={verifiedEmails}
        localeOptions={localeOptions}
      />
      {props.eventType?.id ? <BookingRulesCard eventTypeId={props.eventType.id} /> : null}
    </>
  );
};

export default EventAdvancedWebWrapper;
