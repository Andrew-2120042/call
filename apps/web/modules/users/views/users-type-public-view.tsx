"use client";

import type { CalendarLayout } from "@calcom/features/booking-page-theme/calendar";
import { calendarCssVars, resolveCalendar } from "@calcom/features/booking-page-theme/calendar";
import { pageLookStyle } from "@calcom/features/booking-page-theme/themes";
import { timePreferencesStore } from "@calcom/features/bookings/lib/timePreferences";
import { getBookerWrapperClasses } from "@calcom/features/bookings/Booker/utils/getBookerWrapperClasses";
import { BookerWebWrapper as Booker } from "@calcom/web/modules/bookings/components/BookerWebWrapper";
import BookingPageErrorBoundary from "@components/error/BookingPageErrorBoundary";
import type { inferSSRProps } from "@lib/types/inferSSRProps";
import type { getServerSideProps } from "@server/lib/[user]/[type]/getServerSideProps";
import type { EmbedProps } from "app/WithEmbedSSR";
import classNames from "classnames";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { BookerLayouts } from "@calcom/prisma/zod-utils";
import { detectBrowserTimeFormat, TimeFormat } from "@calcom/lib/timeFormat";
import { useStudioPreviewLook } from "@calcom/web/modules/booking-page/useStudioPreviewLook";

const BOOKER_LAYOUT: Record<CalendarLayout, BookerLayouts> = {
  month_view: BookerLayouts.MONTH_VIEW,
  week_view: BookerLayouts.WEEK_VIEW,
  column_view: BookerLayouts.COLUMN_VIEW,
};

export type PageProps = inferSSRProps<typeof getServerSideProps> & EmbedProps;

export const getMultipleDurationValue = (
  multipleDurationConfig: number[] | undefined,
  queryDuration: string | string[] | null | undefined,
  defaultValue: number
) => {
  if (!multipleDurationConfig) return null;
  if (multipleDurationConfig.includes(Number(queryDuration))) return Number(queryDuration);
  return defaultValue;
};

function Type({
  slug,
  user,
  isEmbed,
  booking,
  isBrandingHidden,
  eventData,
  orgBannerUrl,
  pageTheme: savedPageTheme,
  pageButtonShape: savedPageButtonShape,
  pageStyle: savedPageStyle,
}: PageProps) {
  const searchParams = useSearchParams();
  const { pageTheme, pageButtonShape, pageStyle } = useStudioPreviewLook({
    pageTheme: savedPageTheme,
    pageButtonShape: savedPageButtonShape,
    pageStyle: savedPageStyle,
  });
  const calendarOverride = pageStyle?.calendarByService?.[String(eventData.id)];
  const calendar = resolveCalendar(pageStyle?.calendar, calendarOverride);
  const ownerSetLayout =
    !!(pageStyle?.calendar?.layout || calendarOverride?.layout) ||
    pageStyle?.calendar?.allowLayoutSwitch !== undefined ||
    calendarOverride?.allowLayoutSwitch !== undefined;

  const bookerLayoutsOverride = useMemo(() => {
    if (!ownerSetLayout) return undefined;
    const defaultLayout = BOOKER_LAYOUT[calendar.layout];
    return {
      defaultLayout,
      enabledLayouts: calendar.allowLayoutSwitch
        ? [BookerLayouts.MONTH_VIEW, BookerLayouts.WEEK_VIEW, BookerLayouts.COLUMN_VIEW]
        : [defaultLayout],
    };
  }, [ownerSetLayout, calendar.layout, calendar.allowLayoutSwitch]);

  useEffect(() => {
    if (isEmbed) return;
    // setState rather than setTimeFormat so the owner's choice isn't written into the visitor's own preference.
    // "auto" restores the device default, which matters when the editor preview flips back from 12h/24h.
    timePreferencesStore.setState({
      timeFormat:
        calendar.timeFormat === "24h"
          ? TimeFormat.TWENTY_FOUR_HOUR
          : calendar.timeFormat === "12h"
            ? TimeFormat.TWELVE_HOUR
            : detectBrowserTimeFormat,
    });
  }, [isEmbed, calendar.timeFormat]);

  return (
    <BookingPageErrorBoundary>
      <main
        className={classNames(getBookerWrapperClasses({ isEmbed: !!isEmbed }), !isEmbed && "sw-booker")}
        data-sw-hide={isEmbed ? undefined : calendar.hide.join(" ")}
        style={
          isEmbed
            ? undefined
            : { ...pageLookStyle(pageTheme, pageButtonShape, pageStyle), ...calendarCssVars(calendar) }
        }>
        <Booker
          username={user}
          eventSlug={slug}
          bookingData={booking}
          hideBranding={isBrandingHidden}
          eventData={eventData}
          bookerLayoutsOverride={bookerLayoutsOverride}
          entity={{ ...eventData.entity, eventTypeId: eventData?.id }}
          durationConfig={eventData.metadata?.multipleDuration}
          orgBannerUrl={orgBannerUrl}
          /* TODO: Currently unused, evaluate it is needed-
           *       Possible alternative approach is to have onDurationChange.
           */
          duration={getMultipleDurationValue(
            eventData.metadata?.multipleDuration,
            searchParams?.get("duration"),
            eventData.length
          )}
        />
      </main>
    </BookingPageErrorBoundary>
  );
}

export default Type;
