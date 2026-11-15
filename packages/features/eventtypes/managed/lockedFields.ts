// Shared by the server (sync and save checks) and the editor (read-only fields); no database imports here.

/** Fields a managed service's template decides for every member's copy. */
export const MANAGED_LOCKED_FIELDS = [
  "title",
  "description",
  "interfaceLanguage",
  "slug",
  "length",
  "offsetStart",
  "recurringEvent",
  "minimumRescheduleNotice",
  "disableGuests",
  "disableCancelling",
  "disableRescheduling",
  "requiresCancellationReason",
  "allowReschedulingCancelledBookings",
  "requiresConfirmation",
  "requiresConfirmationForFreeEmail",
  "requiresConfirmationWillBlockSlot",
  "eventName",
  "hideCalendarNotes",
  "hideCalendarEventDetails",
  "minimumBookingNotice",
  "beforeEventBuffer",
  "afterEventBuffer",
  "successRedirectUrl",
  "seatsPerTimeSlot",
  "seatsShowAttendees",
  "seatsShowAvailabilityCount",
  "forwardParamsSuccessRedirect",
  "periodType",
  "periodDays",
  "periodStartDate",
  "periodEndDate",
  "periodCountCalendarDays",
  "bookingLimits",
  "onlyShowFirstAvailableSlot",
  "slotInterval",
  "bookingFields",
  "durationLimits",
  "lockTimeZoneToggleOnBookingPage",
  "lockedTimeZone",
  "requiresBookerEmailVerification",
  "eventTypeColor",
  "allowReschedulingPastBookings",
  "hideOrganizerEmail",
  "customReplyToEmail",
  "waitlistEnabled",
  "attendeeConfirmationHours",
  "releaseUnconfirmedBookings",
  "attendeeReminderMinutes",
] as const;

/** Each member controls these on their own copy. */
export const MANAGED_MEMBER_EDITABLE_FIELDS = new Set<string>([
  "locations",
  "schedule",
  "scheduleId",
  "scheduleName",
  "availability",
  "destinationCalendar",
  "hidden",
]);

const lockedSet = new Set<string>(MANAGED_LOCKED_FIELDS);

/** Template-controlled fields that a save of a member's copy is trying to change. */
export function lockedFieldsInUpdate(update: Record<string, unknown>): string[] {
  return Object.keys(update).filter((key) => update[key] !== undefined && lockedSet.has(key));
}
