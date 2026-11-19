const RENAMED: Record<string, string> = { Calcutta: "Kolkata", Saigon: "Ho Chi Minh City", Kiev: "Kyiv" };

/** "America/New_York" -> "New York (GMT-5)": the place people recognise, never the raw IANA id. */
export function timeZoneLabel(timeZone: string, at: Date = new Date()): string {
  if (!timeZone) return "";
  const lastPart = timeZone.split("/").pop() ?? timeZone;
  const city = RENAMED[lastPart] ?? lastPart.replace(/_/g, " ");
  let offset = "";
  try {
    offset =
      new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "shortOffset" })
        .formatToParts(at)
        .find((part) => part.type === "timeZoneName")?.value ?? "";
  } catch {
    return city;
  }
  return offset ? `${city} (${offset})` : city;
}
