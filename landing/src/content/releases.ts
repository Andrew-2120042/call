// Release notes, newest first. Each release is its own page at /changelog/<slug>, written as a short story like a
// product newsletter. Pictures are real screenshots of the app (public/changelog), never drawings.

export type ReleaseImage = { src: string; alt: string; width: number; height: number };

export const SHOTS = {
  home: { src: "/changelog/home.webp", alt: "Calbee Home: the month's bookings, requests and waitlist on one calendar", width: 1600, height: 1010 },
  requests: { src: "/changelog/requests.webp", alt: "Booking requests with an AI summary and a Good fit or Fit unclear label on each", width: 1600, height: 850 },
  waitlist: { src: "/changelog/waitlist.webp", alt: "The waitlist: who is waiting for each time, and who has been offered a freed time", width: 1600, height: 850 },
  availability: { src: "/changelog/availability.webp", alt: "Working hours with a 1pm to 2pm lunch break applied to every working day", width: 1600, height: 850 },
  upcoming: { src: "/changelog/upcoming.webp", alt: "Upcoming bookings with each client's note and the requests waiting for a decision", width: 1600, height: 850 },
  assistant: { src: "/changelog/assistant.webp", alt: "The Calbee assistant, ready to set up a page, write services or handle requests", width: 1600, height: 850 },
  teams: { src: "/changelog/teams.webp", alt: "The Teams page, where you create a team and share one booking link", width: 1600, height: 850 },
  publicPage: { src: "/changelog/public.webp", alt: "A Calbee booking page with four services, two of which need approval", width: 1600, height: 1440 },
} satisfies Record<string, ReleaseImage>;

export type Release = {
  slug: string;
  version: string;
  issue: number;
  date: string;
  /** Shown instead of the exact date when only the month is known. */
  dateLabel?: string;
  title: string;
  /** One line for listings and search results. */
  summary: string;
  /** The opening note, like a newsletter's first paragraph. */
  intro: string;
  image?: ReleaseImage;
  sections: { heading: string; paragraphs: string[]; bullets?: string[]; image?: ReleaseImage; cta?: { label: string; href: string } }[];
  improvements?: string[];
  fixes?: string[];
};

const APP = "https://app.nodslot.site";

export const releases: Release[] = [
  {
    slug: "v3-0",
    version: "v3.0",
    issue: 7,
    date: "2026-11-24",
    title: "Calbee v3.0: Everything you need for meetings, now free",
    summary: "Our biggest release yet. The whole booking link is free, the extras live on Pro, and Calbee has a new name.",
    intro:
      "Hello, and welcome to our biggest update yet. For the last few weeks we've been working on one question: what does someone actually need to run their calendar? The answer turned out to be most of the product. So as of today, everything you need for meetings is free, for everyone, for as long as you use it. The extras that save you hours each week live on Pro. Here's everything that's new.",
    image: SHOTS.home,
    sections: [
      {
        heading: "Everything you need, free",
        paragraphs: [
          "No trial clock and no booking limits. Make as many services as you like, share one link, and let clients pick a time that works for both of you. Bookings land straight on your Google or Outlook calendar, and every client gets a reminder before the day.",
          "When someone cancels, we don't just let the time go. They get an email with new times and can rebook in one click, so a cancellation becomes a reschedule instead of a lost client.",
        ],
        bullets: ["Unlimited services and bookings", "Google Calendar and Outlook sync", "A reminder on every booking", "A one-click rebook email when someone cancels", "Unlimited booking questions, an embed for your website, and import from Calendly"],
        image: SHOTS.publicPage,
        cta: { label: "Make your booking page", href: `${APP}/signup` },
      },
      {
        heading: "The extras, on Pro",
        paragraphs: [
          "Pro is for the moments a plain booking link can't handle. When a 10am cancels the night before, the waitlist offers it to the next person in line, who claims it with one click. When a request comes in from someone you've never met, you see a short AI summary of who they are and whether they look like a fit, before you say yes.",
          "Pro is $12 a month. Try it free for 14 days, with no card, and nothing is charged when the trial ends.",
        ],
        bullets: ["A waitlist that refills cancelled times", "Confirm-or-release, so no-shows free up their time", "Approvals with an AI summary of every request", "An assistant that moves and cancels bookings once you say yes"],
        image: SHOTS.requests,
      },
      {
        heading: "Lunch breaks in one click",
        paragraphs: [
          "The most common thing people asked us for: stop clients booking over lunch. Open your working hours, tap Add lunch break, pick the time, and it applies to every working day at once. Days off stay off, and you can still change any single day afterwards.",
          "We also renamed the little + next to each day to Add hours, because that's what it does: add a second block of time, like a morning and an evening session.",
        ],
        image: SHOTS.availability,
      },
      {
        heading: "Team checkout",
        paragraphs: [
          "Teams can now buy Calbee themselves. It's $69 a month for up to 10 people, not per seat. If you're already on Pro, switching to Team charges only the difference for the rest of the month. Once you've paid, create your team and invite people by email or with a link.",
        ],
        image: SHOTS.teams,
      },
      {
        heading: "Meet Calbee",
        paragraphs: ["We've changed our name to Calbee. Same product, same people, and your booking links keep working. There's nothing to change on your side."],
      },
      {
        heading: "Free tools and templates",
        paragraphs: [
          "We've put together a few things that are useful even if you don't use Calbee: a time zone converter, a meeting planner that finds a time across several cities, and copy-ready templates for cancellation and no-show policies, reminders, confirmations, waitlist offers and rebooking emails.",
        ],
        cta: { label: "Browse the free tools", href: "/tools" },
      },
    ],
    improvements: [
      "We've moved approvals to Pro, and every request now comes with an AI summary.",
      "We've tested Outlook end to end: busy times hide from your page, bookings land in Outlook, and cancelling removes them.",
      "We've made the text bigger and clearer across the website and the help docs.",
      "We now explain plainly when a personal Microsoft account can't create Teams meeting links.",
    ],
    fixes: [
      "We stopped the waitlist claim page saying an offer was gone when you'd only tried too many times in a minute.",
      "We fixed assistant messages that showed technical setting names instead of plain words.",
    ],
  },
  {
    slug: "v2-2",
    version: "v2.2",
    issue: 6,
    date: "2026-11-20",
    title: "Calbee v2.2: One-click rebooking, an assistant that does the work & a Pro trial",
    summary: "Win back cancellations in one click, hand busywork to the assistant, and try Pro free for 14 days.",
    intro:
      "This release is about the clients you already have. A cancelled session shouldn't be the end of the relationship, and moving a week of bookings shouldn't take an afternoon. Here's what we built.",
    image: SHOTS.waitlist,
    sections: [
      {
        heading: "One-click rebooking",
        paragraphs: [
          "When a client cancels, the cancellation page now offers three new times picked for them, and they get an email with the same choice. One click and they're booked again. On Pro, if they haven't come back after three days, they get one more gentle nudge.",
        ],
      },
      {
        heading: "An assistant that does the work",
        paragraphs: [
          "Tell the assistant what you need in plain words, like \"move this week's sessions to next week\" or \"cancel Friday, I'm off sick\". It lists every change it's about to make, and nothing happens until you say yes. It only ever touches your own bookings, up to ten at a time.",
        ],
        image: SHOTS.assistant,
      },
      {
        heading: "A smarter waitlist",
        paragraphs: [
          "Clients can now wait for one exact time, any time on a day, or anything earlier than the booking they already have. You choose whether a freed time goes to one person at a time or to everyone at once, and people can see their place in line before they join.",
        ],
      },
      {
        heading: "Try Pro free for 14 days",
        paragraphs: ["Every Pro feature, free for 14 days. No card, and nothing is charged at the end."],
        cta: { label: "Start your trial", href: `${APP}/signup` },
      },
      {
        heading: "Add a booking yourself",
        paragraphs: ["Booked someone over the phone? Put them straight onto your calendar from Home. They get the same confirmation and reminders as if they'd booked themselves."],
        image: SHOTS.upcoming,
      },
    ],
    improvements: ["We've added black, grey and white themes for booking pages.", "We keep menus and pop-ups on screen near the edges of the window.", "We've given the embed window a close button and a one-click copy for the code."],
  },
  {
    slug: "v2-1",
    version: "v2.1",
    issue: 5,
    date: "2026-11-15",
    title: "Calbee v2.1: Teams, round robin & integrations",
    summary: "Calbee now works for small teams, at one flat price instead of per seat.",
    intro: "Coaching studios, small clinics and agencies kept asking for one thing: a way to share bookings between a few people without paying for every seat. This release is for them.",
    image: SHOTS.teams,
    sections: [
      {
        heading: "Teams",
        paragraphs: [
          "Create a team, invite people by email or with a link, and give each person a role. Your team gets one shared page where clients pick a service and see everyone's free times together.",
          "Services can be round robin, where the team takes turns, or collective, where everyone joins. Managed services let you set a service up once and give every member a copy, with the settings you choose locked.",
        ],
      },
      {
        heading: "See the gaps in your week",
        paragraphs: ["The coverage view shows who's free this week and where nobody is, so you can fix a gap before a client finds it."],
      },
      {
        heading: "Help clients choose",
        paragraphs: ["Not sure which service to book? Clients can describe what they need in a sentence, and the team page suggests the right one. They can also ask who's free at a particular time."],
      },
      {
        heading: "Zapier, Make and more",
        paragraphs: ["Our own Zapier and Make apps, plus HubSpot, Salesforce, Pipedrive, Google Analytics, Tag Manager and Meta Pixel."],
      },
    ],
  },
  {
    slug: "v2-0",
    version: "v2.0",
    issue: 4,
    date: "2026-11-13",
    title: "Calbee v2.0: Back, and rebuilt around keeping your calendar full",
    summary: "We picked the project back up and rebuilt it around one idea: a booking link should keep working after someone books.",
    intro:
      "After a few months away, we came back to the booking link with a clear idea of what was missing. Every tool we tried stopped helping the moment someone booked. But the expensive part comes after: the late cancellation, the no-show, the request from someone who isn't a fit. v2.0 is built around that.",
    image: SHOTS.requests,
    sections: [
      {
        heading: "The waitlist",
        paragraphs: ["When a time is taken, clients can join a waitlist for it. If the booking is cancelled, the first person waiting gets a private link to claim the time, and if they don't, it moves to the next person."],
        image: SHOTS.waitlist,
      },
      {
        heading: "Approvals with an AI summary",
        paragraphs: ["Choose services that need your approval, and read a short summary of every request before it's booked: who's asking, what they want, and whether they look like a fit."],
      },
      {
        heading: "Confirm-or-release",
        paragraphs: ["Clients confirm before the day with one click. If they don't, you're told, and the time can be released for someone on the waitlist."],
      },
    ],
  },
  {
    slug: "v1-2",
    version: "v1.2",
    issue: 3,
    date: "2026-06-01",
    dateLabel: "June 2026",
    title: "v1.2: Import from Calendly, calendar health & embeds",
    summary: "Move from Calendly in a minute, get warned when a calendar stops syncing, and put your booking page on your own site.",
    intro: "Most people who tried Calbee in the spring were coming from Calendly, so this release is about making the move painless.",
    sections: [
      { heading: "Import from Calendly", paragraphs: ["Bring your event types and weekly hours across in about a minute, so your new page looks like your old one from day one."] },
      { heading: "Calendar health check", paragraphs: ["If a connected calendar stops syncing, we warn you straight away, before it causes a double booking."] },
      { heading: "Embed on your website", paragraphs: ["Copy one snippet to put your booking page inside your own website, inline or as a pop-up button."] },
    ],
  },
  {
    slug: "v1-1",
    version: "v1.1",
    issue: 2,
    date: "2026-05-01",
    dateLabel: "May 2026",
    title: "v1.1: Booking questions and better reminders",
    summary: "Ask clients what you need before they book, and remind them at the right time.",
    intro: "The first people using Calbee wanted to know a little about clients before a session. So we added questions, and tuned reminders so fewer people forget.",
    sections: [
      { heading: "Booking questions", paragraphs: ["Ask anything before someone books: a short answer, a choice from a list, or a phone number. Answers show up on the booking."] },
      { heading: "Reminders that arrive at the right time", paragraphs: ["Every client gets a reminder email before their booking, sent exactly once, in their own time zone."] },
    ],
  },
  {
    slug: "v1-0",
    version: "v1.0",
    issue: 1,
    date: "2026-03-01",
    dateLabel: "March 2026",
    title: "v1.0: The first version",
    summary: "A booking link for coaches and consultants, with calendar sync and reminders.",
    intro: "We started building in January 2026 and shipped the first version in March: one link with your free times, for coaches, therapists and consultants who were tired of back-and-forth emails.",
    sections: [
      { heading: "One booking link", paragraphs: ["Share one link with your free times. Clients pick one, and it lands on your calendar."] },
      { heading: "Calendar sync", paragraphs: ["Busy times in Google Calendar block your page, so nobody books you twice."] },
    ],
  },
];

export const findRelease = (slug: string) => releases.find((r) => r.slug === slug);
