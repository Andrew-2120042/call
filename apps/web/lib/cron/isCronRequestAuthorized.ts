import { timingSafeEqual } from "node:crypto";
import process from "node:process";

/** Cron jobs authenticate with CRON_API_KEY (header or ?apiKey=); compared in constant time. */
export function isCronRequestAuthorized(
  request: { headers: Pick<Headers, "get">; nextUrl: { searchParams: URLSearchParams } },
  expected = process.env.CRON_API_KEY
): boolean {
  const provided = request.headers.get("authorization") || request.nextUrl.searchParams.get("apiKey");
  if (!expected || !provided) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  return a.length === b.length && timingSafeEqual(a, b);
}
