import { getWaitlistService } from "@calcom/features/waitlist/lib/getWaitlistService";
import { isCronRequestAuthorized } from "@lib/cron/isCronRequestAuthorized";
import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Run every few minutes: expires unclaimed offers, offers each slot to the next person, drops past slots.
async function postHandler(request: NextRequest) {
  if (!isCronRequestAuthorized(request)) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  const result = await getWaitlistService().processExpirations();
  return NextResponse.json({ ok: true, ...result });
}

export const POST = defaultResponderForAppDir(postHandler);
export const GET = defaultResponderForAppDir(postHandler);
