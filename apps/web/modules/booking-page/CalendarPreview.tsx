import type { ResolvedCalendar } from "@calcom/features/booking-page-theme/calendar";
import { calendarCssVars, SLOT_RADII } from "@calcom/features/booking-page-theme/calendar";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Icon } from "@calcom/ui/components/icon";
import type { ReactNode } from "react";

type Props = {
  calendar: ResolvedCalendar;
  background: string;
  ownerName: string;
  avatar: ReactNode;
  service: { title: string; length: number } | null;
};

const SLOT_HOURS = [9, 9.5, 11, 13.5, 15, 16.5];
const SELECTED_DAY = 18;

/**
 * A drawn stand-in for the calendar page on a phone, so edits show instantly before saving.
 * Phones always get the compact calendar, which is why the layout choice isn't drawn here.
 */
export function CalendarPreview({ calendar, background, ownerName, avatar, service }: Props) {
  const { t, i18n } = useLocale();
  const vars = calendarCssVars(calendar);
  const shown = (key: ResolvedCalendar["hide"][number]) => !calendar.hide.includes(key);
  const use24h = calendar.timeFormat === "24h";

  const formatSlot = (hour: number) => {
    const date = new Date(2026, 0, 1, Math.floor(hour), (hour % 1) * 60);
    return new Intl.DateTimeFormat(i18n.language, {
      hour: "numeric",
      minute: "2-digit",
      hour12: !use24h,
    }).format(date);
  };

  const weekdays = Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(i18n.language, { weekday: "narrow" }).format(new Date(2026, 1, index + 1))
  );
  // February 2026 starts on a Sunday, so the grid needs no leading blanks.
  const days = Array.from({ length: 28 }, (_, index) => index + 1);
  const monthLabel = new Intl.DateTimeFormat(i18n.language, { month: "long", year: "numeric" }).format(
    new Date(2026, 1, 1)
  );

  return (
    <div className="min-h-full px-3 py-5" style={{ background }} data-testid="calendar-preview">
      <div
        className="overflow-hidden text-left"
        style={{
          background: vars["--sw-cal-panel"],
          color: vars["--sw-cal-text"],
          border: `1px solid ${vars["--sw-cal-border"]}`,
          borderRadius: 20,
        }}>
        <div className="px-4 pb-3 pt-4">
          {shown("avatar") && (
            <div className="mb-2 flex items-center gap-2">
              <span className="block h-6 w-6 overflow-hidden rounded-full">{avatar}</span>
              <span className="text-[11px] font-semibold" style={{ color: vars["--sw-cal-subtle"] }}>
                {ownerName}
              </span>
            </div>
          )}
          <div className="text-[15px] font-bold leading-tight">
            {service?.title ?? t("studio_calendar_preview_service")}
          </div>
          {shown("description") && (
            <p className="mt-1 text-[11px] leading-snug" style={{ color: vars["--sw-cal-subtle"] }}>
              {t("studio_calendar_preview_description")}
            </p>
          )}
          <div className="mt-2 flex flex-col text-[11px] font-medium" style={{ rowGap: 4 }}>
            {shown("duration") && (
              <span className="flex items-center gap-1.5">
                <Icon name="clock" className="h-3 w-3" />
                {t("service_minutes", { count: service?.length ?? 30 })}
              </span>
            )}
            {shown("location") && (
              <span className="flex items-center gap-1.5">
                <Icon name="video" className="h-3 w-3" />
                {t("studio_calendar_preview_location")}
              </span>
            )}
            {shown("timezone") && (
              <span className="flex items-center gap-1.5">
                <Icon name="globe" className="h-3 w-3" />
                {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </span>
            )}
          </div>
        </div>

        <div className="px-4 pb-3" style={{ borderTop: `1px solid ${vars["--sw-cal-border"]}` }}>
          <div className="pb-2 pt-3 text-[12px] font-semibold">{monthLabel}</div>
          <div className="grid grid-cols-7 text-center text-[9px] font-semibold" style={{ rowGap: 4 }}>
            {weekdays.map((day, index) => (
              <span key={`${day}-${index}`} style={{ color: vars["--sw-cal-subtle"] }}>
                {day}
              </span>
            ))}
            {days.map((day) => {
              const selected = day === SELECTED_DAY;
              const available = day >= 9 && day % 7 !== 0 && day % 7 !== 1;
              return (
                <span
                  key={day}
                  className="mx-auto grid h-7 w-7 place-items-center text-[10.5px] font-medium"
                  style={{
                    borderRadius: 8,
                    background: selected
                      ? vars["--sw-cal-accent"]
                      : available
                        ? vars["--sw-cal-muted"]
                        : "transparent",
                    color: selected
                      ? vars["--sw-cal-accent-text"]
                      : available
                        ? vars["--sw-cal-text"]
                        : vars["--sw-cal-subtle"],
                  }}>
                  {day}
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col px-4 pb-4" style={{ rowGap: 6 }}>
          {SLOT_HOURS.map((hour) => (
            <span
              key={hour}
              className="block py-1.5 text-center text-[11px] font-semibold"
              style={{
                border: `1px solid ${vars["--sw-cal-slot-border"]}`,
                borderRadius: SLOT_RADII[calendar.slotShape],
                fontVariantNumeric: "tabular-nums",
              }}>
              {formatSlot(hour)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
