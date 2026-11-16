import { parseAsString, useQueryState } from "nuqs";

/** The bookings search text, kept in the URL (?search=) so it survives reloads and tab switches. */
export function useBookingSearch() {
  return useQueryState("search", parseAsString.withDefault("").withOptions({ clearOnDefault: true }));
}
