import { timingSafeEqual } from "node:crypto";
import process from "node:process";
import { getAttendeeConfirmationService } from "@calcom/features/attendee-confirmation/lib/getAttendeeConfirmationService";
import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function isAuthorized(request: NextRequest) {
  const expected = process.env.CRON_API_KEY;
  const provided = request.headers.get("authorization") || request.nextUrl.searchParams.get("apiKey");
  if (!expected || !provided) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Run every few minutes: sends "are you still coming?" emails and handles missed deadlines.
async function postHandler(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  const service = getAttendeeConfirmationService();
  const missed = await service.processMissedDeadlines();
  const requests = await service.sendDueRequests();
  return NextResponse.json({ ok: true, ...requests, ...missed });
}

export const POST = defaultResponderForAppDir(postHandler);
export const GET = defaultResponderForAppDir(postHandler);
