import type { BlogArtSpec } from "@/components/blog-art";

// Hero art for each post: three stickers that say what the post is about. Unlisted posts use the default.
export const BLOG_ART: Record<string, BlogArtSpec> = {
  "best-scheduling-software-2027": { stickers: ["compare", "calendar", "confirm"], labels: ["9 tools tested", "Best picks", "Free plans"], palette: "riso" },
  "free-meeting-scheduler": { stickers: ["free", "calendar", "envelope"], labels: ["$0 plans", "Unlimited links", "Reminders"], palette: "matcha" },
  "calendly-alternatives": { stickers: ["compare", "waitlist", "team"], labels: ["8 alternatives", "Waitlists", "Team pricing"], palette: "candy" },
  "cal-com-alternatives": { stickers: ["compare", "calendar", "team"], labels: ["6 alternatives", "Less setup", "Flat price"], palette: "aqua" },
  "how-to-get-more-leads": { stickers: ["call", "growth", "calendar"], labels: ["Answer fast", "More leads", "Booked calls"], palette: "sunset" },
  "how-to-get-clients-on-calls": { stickers: ["call", "confirm", "clock"], labels: ["Book in a minute", "Confirmed", "On time"], palette: "clay" },
  "booking-app-with-waitlist": { stickers: ["waitlist", "envelope", "confirm"], labels: ["People waiting", "Offer sent", "Slot filled"], palette: "matcha" },
  "team-scheduling-without-per-seat-pricing": { stickers: ["team", "free", "calendar"], labels: ["10 people", "One price", "Shared page"], palette: "candy" },
  "booking-software-approve-requests": { stickers: ["envelope", "confirm", "call"], labels: ["Request in", "Approved", "Booked"], palette: "aqua" },
  "calendly-vs-cal-com": { stickers: ["calendar", "compare", "calendar"], labels: ["Calendly", "Side by side", "Cal.com"], palette: "candy" },
  "is-calendly-free": { stickers: ["free", "compare", "calendar"], labels: ["Free plan", "Limits", "Upgrades"], palette: "matcha" },
  "round-robin-scheduling": { stickers: ["team", "clock", "calendar"], labels: ["Your team", "Whoever's free", "One link"], palette: "aqua" },
  "fill-last-minute-cancellations": { stickers: ["waitlist", "envelope", "calendar"], labels: ["Waitlist", "Offer sent", "Slot filled"], palette: "riso" },
  "reduce-appointment-no-shows": { stickers: ["clock", "confirm", "envelope"], labels: ["Reminder", "Confirmed", "Or released"], palette: "sunset" },
};

export const DEFAULT_ART: BlogArtSpec = { stickers: ["calendar", "waitlist", "confirm"], palette: "riso" };
