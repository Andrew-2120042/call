import { site } from "@/site.config";
// The help docs. Each page is a list of blocks; every `h2` becomes an entry in the sidebar's on-page list.

export type DocBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "steps"; items: string[] }
  | { type: "list"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "code"; text: string }
  | { type: "note"; text: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "changes"; items: { date: string; title: string; body: string }[] };

export type DocIcon = "home" | "rocket" | "layers" | "clock" | "queue" | "check" | "users" | "plug" | "code" | "spark" | "help" | "book" | "list";

export type DocPage = {
  slug: string;
  title: string;
  icon: DocIcon;
  /** Small uppercase label above the first section, like "Getting started". */
  eyebrow: string;
  description: string;
  blocks: DocBlock[];
};

export const docs: DocPage[] = [
  {
    slug: "introduction",
    title: "Introduction",
    icon: "home",
    eyebrow: "Overview",
    description: `What ${site.name} is, and what it does for you after someone books.`,
    blocks: [
      { type: "p", text: `${site.name} is a booking link. Clients pick a time that suits them, it lands in your calendar, and ${site.name} looks after what comes next: cancelled slots refill from a waitlist, unconfirmed bookings can free themselves up, and requests you approve arrive with a short summary.` },
      { type: "image", src: "/shots/dashboard.png", alt: `The ${site.name} dashboard`, caption: "Your services, each with its own link." },
      { type: "h2", text: "What you can do" },
      { type: "list", items: [
        "**Get booked.** Unlimited services, each with its own link, length, questions and location.",
        "**Fill cancellations.** Clients join a waitlist for times that are taken; the first in line is offered any slot that frees up.",
        "**Win them back.** When a client cancels, they're offered new times on the spot, and ten minutes later an email with one open time they can book in a click.",
        "**Stop no-shows.** Clients confirm in one click before your deadline, or the time can be released.",
        "**Approve requests.** Read every request before it's booked; on Pro each one comes with a summary.",
        "**Run a team.** Round robin, collective and managed services, a shared team page and a weekly coverage view.",
      ] },
      { type: "h2", text: "Plans" },
      { type: "table", head: ["Plan", "Price", "For"], rows: [
        ["Free", "$0", "One person: unlimited services and bookings, calendar sync, video links"],
        ["Pro", "$12 a month", "Adds the waitlist, confirm-or-release, request summaries and your own domain"],
        ["Team", "$69 a month", "Up to 10 people, then $10 per extra person: round robin, collective and managed services, team waitlist"],
      ] },
      { type: "h2", text: "Where to next" },
      { type: "list", items: ["[Get started](/docs/get-started) to make your first service and share your link.", "[Coming from Calendly?](/docs/get-started#move-from-calendly) Bring your services over in a minute."] },
    ],
  },
  {
    slug: "get-started",
    title: "Get started",
    icon: "rocket",
    eyebrow: "Getting started",
    description: "Make an account, add a service and share your link.",
    blocks: [
      { type: "h2", text: "Create your account" },
      { type: "p", text: "Sign up with your email. You choose a username, which becomes your booking link, and your time zone. The free plan has no trial and needs no card." },
      { type: "h2", text: "Your first service" },
      { type: "steps", items: [
        "Open **Services** and click **New**.",
        "Give it a title and a length, for example *Intro call · 15 minutes*.",
        "Pick a location: Google Meet, Zoom, Microsoft Teams, a phone call or an address.",
        "Save. The service gets its own link straight away.",
      ] },
      { type: "image", src: "/shots/booking.png", alt: `A ${site.name} booking page`, caption: "What your clients see when they open the link." },
      { type: "h2", text: "Connect your calendar" },
      { type: "p", text: `Go to **Apps** and connect Google Calendar or Outlook. ${site.name} checks it for busy times so you're never double booked, and adds new bookings to the calendar you choose.` },
      { type: "h2", text: "Share your link" },
      { type: "p", text: "Your page lives at your username, and each service has its own link under it. Copy either from **Home** or the service's menu, or use **View public page** in the sidebar to see what clients see." },
      { type: "h2", text: "Move from Calendly" },
      { type: "steps", items: [
        "In Calendly, open **Integrations → API & Webhooks** and generate a personal access token.",
        `In ${site.name}, open **Settings → Import from Calendly** and paste it.`,
        "Check the list of services and hours that will come across, then import.",
      ] },
      { type: "note", text: "The token is used once for the import and never saved." },
    ],
  },
  {
    slug: "services",
    title: "Services",
    icon: "layers",
    eyebrow: "Booking",
    description: "Lengths, locations, booking questions and approvals.",
    blocks: [
      { type: "p", text: "A service is something people can book with you, like an intro call or a 60-minute session. You can have as many as you like on every plan." },
      { type: "h2", text: "Settings at a glance" },
      { type: "table", head: ["Tab", "What it covers"], rows: [
        ["Basics", "Title, description, link, length (or several lengths) and location"],
        ["Availability", "Which schedule the service uses"],
        ["Limits", "Minimum notice, buffers before and after, slot spacing and booking limits"],
        ["Advanced", "Booking questions, approvals, confirmation, waitlist, reminders and which calendar bookings go to"],
        ["Recurring", "Let clients book a repeating series"],
      ] },
      { type: "h2", text: "Booking questions" },
      { type: "p", text: "Ask anything you need before a booking: short answers, long answers, choices, phone numbers. Questions can be required or optional, and answers show on the booking." },
      { type: "h2", text: "Approvals" },
      { type: "p", text: "Turn on **Requires confirmation** and each booking arrives as a request in **Bookings → Unconfirmed**. Accept or decline it; the client is told either way. Approvals are a Pro feature, and each request comes with a short summary of who is asking and why." },
      { type: "h2", text: "Hiding a service" },
      { type: "p", text: "Switch a service off in the list to hide it from your page. Its link still works for people you send it to directly." },
    ],
  },
  {
    slug: "availability",
    title: "Availability",
    icon: "clock",
    eyebrow: "Booking",
    description: "Working hours, date overrides, limits and time zones.",
    blocks: [
      { type: "h2", text: "Schedules" },
      { type: "p", text: "A schedule is your weekly hours in a time zone. Make as many as you need, for example *Working hours* and *Weekends*, and choose one per service. The default schedule is used for new services." },
      { type: "h2", text: "Date overrides" },
      { type: "p", text: "Change your hours for a single day, or mark it unavailable, without touching your weekly schedule. Useful for holidays and one-off late days." },
      { type: "h2", text: "Limits and buffers" },
      { type: "table", head: ["Setting", "What it does"], rows: [
        ["Minimum notice", "How soon someone can book, for example no later than 4 hours ahead"],
        ["Buffer before / after", "Free time kept around each booking"],
        ["Booking limits", "The most bookings per day, week or month"],
        ["Booking window", "How far ahead people can book"],
      ] },
      { type: "h2", text: "Time zones" },
      { type: "p", text: "Clients see times in their own time zone, detected from their browser, and can change it on the booking page. Your schedule stays in yours." },
    ],
  },
  {
    slug: "waitlist",
    title: "Waitlist",
    icon: "queue",
    eyebrow: "Pro",
    description: "Refill cancelled slots automatically.",
    blocks: [
      { type: "p", text: "When a time is taken, clients can join its waitlist instead of picking something worse. If the booking is cancelled, the time is offered to the first person in line." },
      { type: "h2", text: "How an offer works" },
      { type: "steps", items: [
        "A booking is cancelled, or released because it wasn't confirmed.",
        "The first person waiting gets an email with a private link to claim the time.",
        "If they claim it within two hours (or before the start, if that's sooner), it's booked for them and both of you get the invite.",
        "If they don't, the offer moves to the next person. Nobody can double book the slot.",
      ] },
      { type: "h2", text: "Turn it on" },
      { type: "p", text: "Open a service, go to **Advanced → Booking rules** and switch on **Waitlist for taken times**. You also get a link you can share so people can join directly." },
      { type: "h2", text: "See who's waiting" },
      { type: "p", text: "**Waitlist** in the sidebar lists everyone waiting, for which time and in which order. You can remove someone at any time." },
      { type: "note", text: "On team services the waitlist covers every host. For round robin, a time only counts as taken when every host is busy." },
    ],
  },
  {
    slug: "confirm-or-release",
    title: "Confirm or release",
    icon: "check",
    eyebrow: "Pro",
    description: "Fewer no-shows with a one-click confirmation.",
    blocks: [
      { type: "p", text: "Ask clients to confirm they're still coming. If they don't confirm by your deadline, you're told, and the time can be released so someone else can book it." },
      { type: "h2", text: "Set it up" },
      { type: "steps", items: [
        "Open a service and go to **Advanced → Booking rules**.",
        "Switch on **Ask clients to confirm they're coming** and set how many hours before the start they must confirm.",
        "To give the time away when nobody confirms, also switch on **Cancel and free the time if they don't confirm**. Otherwise you're just told.",
      ] },
      { type: "h2", text: "What clients see" },
      { type: "p", text: "Their reminder email has a **Confirm** button. One click and they're confirmed; no account needed. They can also cancel or reschedule from the same email." },
      { type: "h2", text: "Reminders" },
      { type: "p", text: "Pick reminder emails from a week to an hour before, in **Booking rules**. Free includes one reminder per booking; Pro allows several." },
    ],
  },
  {
    slug: "teams",
    title: "Teams",
    icon: "users",
    eyebrow: "Team plan",
    description: "Share bookings across up to 10 people.",
    blocks: [
      { type: "h2", text: "Create a team" },
      { type: "p", text: "Open **Teams** and click **New team**. Pick a name and link; the team gets its own public page listing its services and members." },
      { type: "h2", text: "Invite people" },
      { type: "p", text: "Invite by email, or copy an invite link to share. Choose a role for each person:" },
      { type: "table", head: ["Role", "Can"], rows: [
        ["Owner", "Everything, including deleting the team"],
        ["Admin", "Manage members, services and settings"],
        ["Member", "Host bookings and edit their own copy of managed services"],
      ] },
      { type: "h2", text: "Team services" },
      { type: "table", head: ["Type", "How it books"], rows: [
        ["Round robin", "One host per booking, spread across the people you pick"],
        ["Collective", "Everyone you pick attends; only times when all are free are shown"],
        ["Managed", "One setup copied to each member's own page; team-controlled settings stay locked"],
      ] },
      { type: "h2", text: "Coverage view" },
      { type: "p", text: "The team page shows who is free hour by hour for the coming week, and flags weekday stretches during working hours when nobody is available, before a client tries to book one." },
      { type: "h2", text: "Help clients choose" },
      { type: "p", text: `On the team page, clients can describe what they need in a sentence. ${site.name} suggests the right service, and the right person when it's clear, with a link to book.` },
    ],
  },
  {
    slug: "integrations",
    title: "Integrations",
    icon: "plug",
    eyebrow: "Apps",
    description: "Calendars, video, CRMs, automation and tracking.",
    blocks: [
      { type: "p", text: "Connect apps from **Apps** in the sidebar. Each one says what it does and how to connect it." },
      { type: "h2", text: "Calendars" },
      { type: "list", items: ["Google Calendar", "Outlook and Microsoft 365"] },
      { type: "h2", text: "Video" },
      { type: "list", items: ["Google Meet", "Zoom", "Microsoft Teams"] },
      { type: "h2", text: "CRM" },
      { type: "p", text: "HubSpot, Salesforce and Pipedrive. New bookings create or update the contact and log the meeting." },
      { type: "h2", text: "Automation" },
      { type: "p", text: "Zapier and Make start a workflow when someone books, requests, reschedules or cancels. Webhooks send the same events to your own URL. See [Developers](/docs/developers)." },
      { type: "h2", text: "Tracking" },
      { type: "p", text: "Google Analytics, Google Tag Manager and Meta Pixel load on your booking pages so you can see which ads and pages bring you bookings." },
    ],
  },
  {
    slug: "developers",
    title: "Developers",
    icon: "code",
    eyebrow: `Build on ${site.name}`,
    description: "Webhooks, API keys for Zapier and Make, and embeds.",
    blocks: [
      { type: "h2", text: "Webhooks" },
      { type: "p", text: "Open **Settings → Developer → Webhooks** and add a URL. Choose which events to send; each one arrives as a JSON `POST`." },
      { type: "table", head: ["Event", "When"], rows: [
        ["BOOKING_CREATED", "A booking is made"],
        ["BOOKING_REQUESTED", "A booking needs your approval"],
        ["BOOKING_RESCHEDULED", "A booking moves to a new time"],
        ["BOOKING_CANCELLED", "A booking is cancelled"],
        ["BOOKING_NO_SHOW_UPDATED", "Someone is marked as a no-show"],
      ] },
      { type: "h3", text: "Payload" },
      { type: "code", text: `{
  "triggerEvent": "BOOKING_CREATED",
  "createdAt": "2026-11-17T09:31:12.000Z",
  "payload": {
    "uid": "bFJeNb2uX8ANpT3JL5EfXw",
    "title": "Intro call between Maya Patel and Sam Lee",
    "startTime": "2026-11-17T09:30:00.000Z",
    "endTime": "2026-11-17T09:45:00.000Z",
    "organizer": { "name": "Maya Patel", "email": "maya@example.com", "timeZone": "Europe/London" },
    "attendees": [{ "name": "Sam Lee", "email": "sam@example.com", "timeZone": "Europe/London" }],
    "location": "Google Meet",
    "responses": { "notes": { "label": "Additional notes", "value": "Looking forward to it" } }
  }
}` },
      { type: "h3", text: "Verify the signature" },
      { type: "p", text: "Add a secret to the webhook and every request carries `X-Calbee-Signature-256`: an HMAC-SHA256 of the raw body, as hex. Compute the same with your secret and compare." },
      { type: "code", text: `import { createHmac, timingSafeEqual } from "node:crypto";

export function isFromCalbee(rawBody: string, header: string, secret: string) {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return header.length === expected.length && timingSafeEqual(Buffer.from(header), Buffer.from(expected));
}` },
      { type: "h2", text: "API keys" },
      { type: "p", text: `Zapier and Make sign in to ${site.name} with an API key. Create one on the app's setup page (**Apps → Zapier** or **Apps → Make**). Each key covers your own services or one team's; making a new key stops the old one working.` },
      { type: "note", text: "Keys are shown once. Keep them somewhere safe, like a password manager." },
      { type: "h2", text: "Embed on your site" },
      { type: "p", text: "Open a service's menu in **Services** and choose **Embed**. Pick inline, a floating button or a pop-up, preview it, and copy the code into your website." },
    ],
  },
  {
    slug: "changelog",
    title: "Changelog",
    icon: "spark",
    eyebrow: "What's new",
    description: "Everything we've shipped, newest first.",
    blocks: [
      { type: "changes", items: [
        { date: "Nov 24, 2026", title: "Lunch breaks in one click", body: "Add a break (1–2pm by default, adjustable) to every working day at once. The + next to each day now reads Add hours." },
        { date: "Nov 24, 2026", title: "Free tools and templates", body: "A time zone converter, a meeting planner across time zones, and copy-ready templates: cancellation and no-show policies, reminder, confirmation, waitlist and rebooking emails." },
        { date: "Nov 23, 2026", title: "Team plan checkout", body: "Buy Team from the Plans page. Pro customers switch to Team and pay only the difference for the rest of the month." },
        { date: "Nov 23, 2026", title: "Outlook calendar, tested end to end", body: "Busy times in Outlook hide from your booking page, bookings land in Outlook, and cancelling removes them." },
        { date: "Nov 22, 2026", title: "Calbee", body: "Our new name. Same product, same links." },
        { date: "Nov 20, 2026", title: "One-click rebooking", body: "When a client cancels, they're offered new times and book one in a click. Pro sends a second offer after three days." },
        { date: "Nov 20, 2026", title: "14-day Pro trial", body: "Try every Pro feature free for 14 days, no card needed." },
        { date: "Nov 20, 2026", title: "Add a booking yourself", body: "Put a client straight onto your calendar from Home, using the same rules and emails as a normal booking." },
        { date: "Nov 20, 2026", title: "An assistant that does the work", body: "Ask it to move or cancel bookings. It lists the changes first and only acts after you say yes." },
        { date: "Nov 16, 2026", title: "Smarter waitlist", body: "Wait for one time, any time that day, or anything earlier than your booking. Offer to one person at a time or everyone at once, and see your place in line." },
        { date: "Nov 16, 2026", title: "New times after a cancellation", body: "Clients who cancel are offered three new times picked for them." },
        { date: "Nov 15, 2026", title: "Teams", body: "Invite by email or link, roles, round robin and collective services, managed services, a shared team page, a team waitlist and a weekly coverage view." },
        { date: "Nov 15, 2026", title: "Zapier, Make and more integrations", body: "Our own Zapier and Make apps, plus Microsoft Teams, HubSpot, Salesforce, Pipedrive, Google Analytics, Tag Manager and Meta Pixel." },
        { date: "Nov 14, 2026", title: "Import from Calendly", body: "Bring your event types and weekly hours across in about a minute." },
        { date: "Nov 14, 2026", title: "Calendar health check", body: "We warn you if a connected calendar stops syncing, before it causes a double booking." },
        { date: "Nov 13, 2026", title: "First version", body: "Booking pages, approvals with an AI summary of every request, a waitlist that refills cancelled times, confirm-or-release for no-shows, and reminders." },
      ] },
    ],
  },
  {
    slug: "faq",
    title: "FAQ & help",
    icon: "help",
    eyebrow: "Help",
    description: "Quick answers, and how to reach us.",
    blocks: [
      { type: "h2", text: "Common questions" },
      { type: "h3", text: "Do my clients need an account?" },
      { type: "p", text: "No. They book, confirm, reschedule, cancel and claim waitlist slots from links." },
      { type: "h3", text: "Can I use my own domain?" },
      { type: "p", text: "Yes, on Pro. Open **Settings → Custom domain**, add something like book.yourname.com and follow the DNS steps." },
      { type: "h3", text: "Can I cancel any time?" },
      { type: "p", text: "Yes. You keep your plan until the end of the period you paid for, then move to Free with everything intact." },
      { type: "h2", text: "Contact" },
      { type: "p", text: `Email [support](mailto:${site.supportEmail}) and a person will reply, usually within a working day.` },
    ],
  },
];

export const docSlug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const findDoc = (slug: string) => docs.find((d) => d.slug === slug);
