export const releaseDate = (iso: string, label?: string) =>
  label ?? new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
