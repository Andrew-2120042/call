import { timingSafeEqual } from "node:crypto";
import process from "node:process";
import { getWaitlistService } from "@calcom/features/waitlist/lib/getWaitlistService";
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

// Run every few minutes: expires unclaimed offers, offers each slot to the next person, drops past slots.
async function postHandler(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  const result = await getWaitlistService().processExpirations();
  return NextResponse.json({ ok: true, ...result });
}

export const POST = defaultResponderForAppDir(postHandler);
export const GET = defaultResponderForAppDir(postHandler);
