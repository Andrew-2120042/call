import { getBookingRequestInsightService } from "@calcom/features/booking-request-insights/lib/getBookingRequestInsightService";
import { isCronRequestAuthorized } from "@lib/cron/isCronRequestAuthorized";
import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Run every minute: writes an AI summary for new booking requests (no-op without ANTHROPIC_API_KEY).
async function postHandler(request: NextRequest) {
  if (!isCronRequestAuthorized(request)) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  const result = await getBookingRequestInsightService().analysePendingRequests();
  return NextResponse.json({ ok: true, ...result });
}

export const POST = defaultResponderForAppDir(postHandler);
export const GET = defaultResponderForAppDir(postHandler);
