import type { BlogArtSpec } from "@/components/blog-art";

// Each post's hero art tells its own story in three stickers, read left to right. No two posts share a scene.
export const BLOG_ART: Record<string, BlogArtSpec> = {
  "best-scheduling-software-2027": { stickers: ["compare", "trophy", "calendar"], labels: ["9 tools tested", "Top picks", "Real bookings"], palette: "riso" },
  "free-meeting-scheduler": { stickers: ["coins", "free", "calendar"], labels: ["No card", "$0 plans", "Unlimited links"], palette: "matcha" },
  "calendly-alternatives": { stickers: ["calendar", "swap", "waitlist"], labels: ["Calendly", "Switch", "Fills cancellations"], palette: "candy" },
  "cal-com-alternatives": { stickers: ["gear", "swap", "confirm"], labels: ["Lots of settings", "Switch", "Ready in minutes"], palette: "aqua" },
  "how-to-get-more-leads": { stickers: ["magnet", "inbox", "growth"], labels: ["Attract", "Requests in", "More leads"], palette: "sunset" },
  "how-to-get-clients-on-calls": { stickers: ["phone", "video", "confirm"], labels: ["Book a call", "On the call", "They showed up"], palette: "clay" },
  "booking-app-with-waitlist": { stickers: ["cancelled", "waitlist", "envelope"], labels: ["Cancelled", "Next in line", "Offer sent"], palette: "matcha" },
  "team-scheduling-without-per-seat-pricing": { stickers: ["team", "coins", "calendar"], labels: ["10 people", "$69 flat", "One team page"], palette: "candy" },
  "booking-software-approve-requests": { stickers: ["inbox", "summary", "confirm"], labels: ["Request in", "AI summary", "Approved"], palette: "aqua" },
  "acuity-scheduling-alternatives": { stickers: ["coins", "swap", "calendar"], labels: ["Acuity", "Switch", "Free to start"], palette: "clay" },
  "youcanbookme-alternatives": { stickers: ["inbox", "swap", "waitlist"], labels: ["YouCanBookMe", "Switch", "Fills gaps"], palette: "aqua" },
  "savvycal-alternatives": { stickers: ["calendar", "swap", "free"], labels: ["SavvyCal", "Switch", "Free plans"], palette: "candy" },
  "tidycal-alternatives": { stickers: ["free", "swap", "calendar"], labels: ["TidyCal", "Switch", "More calendars"], palette: "matcha" },
  "doodle-alternatives": { stickers: ["question", "swap", "team"], labels: ["Doodle polls", "Switch", "Book clients"], palette: "sunset" },
  "setmore-alternatives": { stickers: ["team", "swap", "waitlist"], labels: ["Setmore", "Switch", "Waitlist"], palette: "riso" },
  "zoho-bookings-alternatives": { stickers: ["gear", "swap", "coins"], labels: ["Zoho Bookings", "Switch", "Flat price"], palette: "aqua" },
  "square-appointments-alternatives": { stickers: ["coins", "swap", "video"], labels: ["Square", "Switch", "Online sessions"], palette: "matcha" },
  "microsoft-bookings-alternatives": { stickers: ["inbox", "swap", "calendar"], labels: ["Microsoft Bookings", "Switch", "Works with Outlook"], palette: "candy" },
  "google-calendar-appointment-schedule-alternatives": { stickers: ["calendar", "swap", "trophy"], labels: ["Google Calendar", "Switch", "More pages"], palette: "clay" },
  "calendly-vs-cal-com": { stickers: ["calendar", "versus", "gear"], labels: ["Calendly", "Head to head", "Cal.com"], palette: "sunset" },
  "is-calendly-free": { stickers: ["question", "free", "coins"], labels: ["Is it free?", "Free plan", "Paid plans"], palette: "riso" },
  "round-robin-scheduling": { stickers: ["team", "roundrobin", "calendar"], labels: ["Your team", "Takes turns", "Booked"], palette: "aqua" },
  "fill-last-minute-cancellations": { stickers: ["cancelled", "envelope", "calendar"], labels: ["Cancelled", "Waitlist offer", "Filled again"], palette: "clay" },
  "reduce-appointment-no-shows": { stickers: ["bell", "confirm", "clock"], labels: ["Reminder", "Confirmed", "On time"], palette: "sunset" },
};

export const DEFAULT_ART: BlogArtSpec = { stickers: ["calendar", "waitlist", "confirm"], palette: "riso" };
