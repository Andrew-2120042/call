import { getAttendeeConfirmationService } from "@calcom/features/attendee-confirmation/lib/getAttendeeConfirmationService";
import { isCronRequestAuthorized } from "@lib/cron/isCronRequestAuthorized";
import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Run every few minutes: sends "are you still coming?" emails and handles missed deadlines.
async function postHandler(request: NextRequest) {
  if (!isCronRequestAuthorized(request)) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  const service = getAttendeeConfirmationService();
  const missed = await service.processMissedDeadlines();
  const requests = await service.sendDueRequests();
  return NextResponse.json({ ok: true, ...requests, ...missed });
}

export const POST = defaultResponderForAppDir(postHandler);
export const GET = defaultResponderForAppDir(postHandler);
