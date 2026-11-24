import type { StickerName } from "@/stickers/calbee-stickers";

// Release notes, newest first. Each release is its own page at /changelog/<slug>, written like a short post.
// The first version (March 2026) was built before a pause; November 2026 is when work restarted.

export type Release = {
  slug: string;
  version: string;
  date: string;
  /** Shown instead of the exact date when only the month is known. */
  dateLabel?: string;
  title: string;
  intro: string;
  /** The tiles in the hero collage: one per headline feature. */
  highlights: { sticker: StickerName; label: string }[];
  sections: { heading: string; body: string; bullets?: string[] }[];
  improvements?: string[];
  fixes?: string[];
};

export const releases: Release[] = [
  {
    slug: "v2-3",
    version: "v2.3",
    date: "2026-11-24",
    title: "Calbee v2.3: Team checkout, lunch breaks, free tools & more",
    intro: "A new name, a way to buy Team, and a lot of small things that make your week easier to set up.",
    highlights: [
      { sticker: "team", label: "Team checkout" },
      { sticker: "clock", label: "Lunch breaks" },
      { sticker: "calendar", label: "Outlook sync" },
      { sticker: "free", label: "Free tools" },
    ],
    sections: [
      { heading: "Meet Calbee", body: "Our new name. Same product, same booking links, nothing to change on your side." },
      {
        heading: "Team checkout",
        body: "Buy Team straight from the Plans page.",
        bullets: ["$69 a month for up to 10 people, not per seat", "Already on Pro? Switch to Team and pay only the difference for the rest of the month", "After buying, create your team and invite people by email or link"],
      },
      {
        heading: "Lunch breaks in one click",
        body: "Add a break to every working day at once, so nobody books you over lunch.",
        bullets: ["1–2pm by default, adjustable in 15-minute steps", "Days off stay off", "The + next to each day now reads Add hours"],
      },
      {
        heading: "Outlook, tested end to end",
        body: "Busy times in Outlook hide from your booking page, new bookings land in Outlook, and cancelling removes them.",
      },
      {
        heading: "Free tools and templates",
        body: "Useful even if you don't use Calbee.",
        bullets: ["Time zone converter and a meeting planner across time zones", "Copy-ready cancellation and no-show policies", "Reminder, confirmation, waitlist offer and rebooking email templates"],
      },
    ],
    improvements: ["Approvals are now part of Pro, with an AI summary on every request", "Bigger, clearer text across the website and help docs", "Microsoft Teams explains plainly when a personal Microsoft account can't create meeting links"],
    fixes: ["The waitlist claim page no longer says an offer is gone when you've only tried too many times in a minute", "Assistant messages no longer show technical setting names"],
  },
  {
    slug: "v2-2",
    version: "v2.2",
    date: "2026-11-20",
    title: "Calbee v2.2: One-click rebooking, an assistant that does the work & a Pro trial",
    intro: "This release is about keeping the clients you already have: getting cancellations back on your calendar, and handing busywork to the assistant.",
    highlights: [
      { sticker: "envelope", label: "One-click rebooking" },
      { sticker: "summary", label: "Assistant" },
      { sticker: "waitlist", label: "Smarter waitlist" },
      { sticker: "confirm", label: "14-day Pro trial" },
    ],
    sections: [
      {
        heading: "One-click rebooking",
        body: "When a client cancels, they're offered new times and book one in a click.",
        bullets: ["Three times picked for them on the cancellation page", "A rebooking email straight away", "On Pro, a second email after three days if they haven't come back"],
      },
      {
        heading: "An assistant that does the work",
        body: "Ask it to move or cancel bookings in plain words, like \"move this week's sessions to next week\".",
        bullets: ["It lists the changes first", "Nothing happens until you say yes", "Up to ten changes at a time, only on your own bookings"],
      },
      {
        heading: "Smarter waitlist",
        body: "Clients can wait for one time, any time that day, or anything earlier than the booking they already have.",
        bullets: ["Offer to one person at a time or everyone at once", "People see their place in line before joining", "A clear message when someone else got the time first"],
      },
      { heading: "14-day Pro trial", body: "Try every Pro feature for 14 days. No card, and nothing is charged at the end." },
      { heading: "Add a booking yourself", body: "Put a client straight onto your calendar from Home, with the same rules and emails as a normal booking." },
    ],
    improvements: ["Booking pages offer black, grey or white themes", "Menus and pop-ups stay on screen near the edges", "Embed window with a close button and a copy button for the code"],
  },
  {
    slug: "v2-1",
    version: "v2.1",
    date: "2026-11-15",
    title: "Calbee v2.1: Teams, round robin & integrations",
    intro: "Calbee now works for small teams, at one flat price instead of per seat.",
    highlights: [
      { sticker: "team", label: "Teams" },
      { sticker: "roundrobin", label: "Round robin" },
      { sticker: "calendar", label: "Coverage view" },
      { sticker: "swap", label: "Integrations" },
    ],
    sections: [
      {
        heading: "Teams",
        body: "Create a team and invite people by email or link, with owner, admin and member roles.",
        bullets: ["Round robin and collective services", "Managed services: set up once, copied to every member", "A shared team page and a team waitlist across every host"],
      },
      { heading: "Coverage view", body: "See who's free this week and where the gaps are, at a glance." },
      { heading: "Help clients choose", body: "Team pages suggest the right service from a one-line description, and can say who's free at a time the client asks about." },
      { heading: "Integrations", body: "Our own Zapier and Make apps, plus HubSpot, Salesforce, Pipedrive, Google Analytics, Tag Manager and Meta Pixel." },
    ],
  },
  {
    slug: "v2-0",
    version: "v2.0",
    date: "2026-11-13",
    title: "Calbee v2.0: Back, rebuilt around keeping your calendar full",
    intro: "We picked the project back up and rebuilt it on a new engine, around one idea: a booking link should keep working after someone books.",
    highlights: [
      { sticker: "waitlist", label: "Waitlist" },
      { sticker: "inbox", label: "Approvals + AI" },
      { sticker: "bell", label: "Confirm-or-release" },
      { sticker: "calendar", label: "Calendar health" },
    ],
    sections: [
      { heading: "Waitlist", body: "When a time is taken, clients can join a waitlist. If the booking is cancelled, the first person waiting gets a private link to claim it." },
      { heading: "Approvals with an AI summary", body: "Read every request before it's booked, with a short summary of who's asking and whether they look like a fit." },
      { heading: "Confirm-or-release", body: "Clients confirm before the day in one click. If they don't, you're told and the time can be released for someone else." },
      { heading: "Import from Calendly", body: "Bring your event types and weekly hours across in about a minute." },
      { heading: "Calendar health check", body: "We warn you if a connected calendar stops syncing, before it causes a double booking." },
    ],
  },
  {
    slug: "v1-0",
    version: "v1.0",
    date: "2026-03-01",
    dateLabel: "March 2026",
    title: "v1.0: The first version",
    intro: "We started building in January 2026 and launched the first version in March: a booking link for coaches and consultants, with calendar sync and reminders. We paused it soon after to work on another product, then came back to it in November.",
    highlights: [
      { sticker: "calendar", label: "Booking link" },
      { sticker: "clock", label: "Reminders" },
    ],
    sections: [
      { heading: "A booking link", body: "Share one link with your free times; clients pick one and it lands on your calendar." },
      { heading: "Calendar sync and reminders", body: "Busy times block your page, and clients get a reminder before each session." },
    ],
  },
];

export const findRelease = (slug: string) => releases.find((r) => r.slug === slug);
