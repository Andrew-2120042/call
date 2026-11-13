import { getAttendeeReminderService } from "@calcom/features/attendee-reminders/lib/getAttendeeReminderService";
import { isCronRequestAuthorized } from "@lib/cron/isCronRequestAuthorized";
import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Run every few minutes: sends due reminder emails to attendees, each exactly once.
async function postHandler(request: NextRequest) {
  if (!isCronRequestAuthorized(request)) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  const result = await getAttendeeReminderService().sendDueReminders();
  return NextResponse.json({ ok: true, ...result });
}

export const POST = defaultResponderForAppDir(postHandler);
export const GET = defaultResponderForAppDir(postHandler);
