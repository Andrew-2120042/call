import { getCalendarHealthService } from "@calcom/features/calendar-health/lib/getCalendarHealthService";
import { isCronRequestAuthorized } from "@lib/cron/isCronRequestAuthorized";
import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Run every 10 minutes: checks a batch of calendar connections not checked in the last hour and
// emails owners once when one stops syncing.
async function postHandler(request: NextRequest) {
  if (!isCronRequestAuthorized(request)) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  const result = await getCalendarHealthService().checkDue();
  return NextResponse.json({ ok: true, ...result });
}

export const POST = defaultResponderForAppDir(postHandler);
export const GET = defaultResponderForAppDir(postHandler);
