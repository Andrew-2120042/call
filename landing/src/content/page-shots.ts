import { type ReleaseImage, SHOTS } from "./releases";

// Which real app screenshot shows each feature best.
export const FEATURE_SHOTS: Record<string, ReleaseImage> = {
  "waitlist-scheduling": SHOTS.waitlist,
  "booking-approval": SHOTS.requests,
  "no-show-protection": SHOTS.upcoming,
  "ai-booking-summaries": SHOTS.requests,
  "team-scheduling": SHOTS.teams,
};

export const COMPARE_SHOT = SHOTS.home;
