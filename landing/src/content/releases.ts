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
  /** Only the launch carries a version number. */
  version?: string;
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
    issue: 4,
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
        bullets: ["Unlimited services, bookings and calendars", "Approve requests before they're booked", "A waitlist on one service", "A one-click rebook email when someone cancels", "Unlimited booking questions, an embed for your website, and import from Calendly"],
        image: SHOTS.publicPage,
        cta: { label: "Make your booking page", href: `${APP}/signup` },
      },
      {
        heading: "The extras, on Pro",
        paragraphs: [
          "Pro is for the moments a plain booking link can't handle. When a 10am cancels the night before, the waitlist offers it to the next person in line, who claims it with one click. When a request comes in from someone you've never met, you see a short AI summary of who they are and whether they look like a fit, before you say yes.",
          "Pro is $12 a month. Try it free for 14 days, with no card, and nothing is charged when the trial ends.",
        ],
        bullets: ["The waitlist on every service, offered in order or to everyone at once", "Confirm-or-release, so no-shows free up their time", "An AI summary of every request", "An agent that moves and cancels bookings once you say yes"],
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
        heading: "Free tools and templates",
        paragraphs: [
          "We've put together a few things that are useful even if you don't use Calbee: a time zone converter, a meeting planner that finds a time across several cities, and copy-ready templates for cancellation and no-show policies, reminders, confirmations, waitlist offers and rebooking emails.",
        ],
        cta: { label: "Browse the free tools", href: "/tools" },
      },
    ],
    improvements: [
      "Approvals are free on every plan, and Pro adds an AI summary to each request.",
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
    slug: "august-2026-rebooking",
    issue: 3,
    date: "2026-08-20",
    dateLabel: "August 2026",
    title: "One-click rebooking, an assistant that does the work & a Pro trial",
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
    slug: "august-2026-teams",
    issue: 2,
    date: "2026-08-04",
    dateLabel: "August 2026",
    title: "Teams, round robin & integrations",
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
        heading: "Zapier and more",
        paragraphs: ["Our own Zapier app, plus Google Analytics, Tag Manager and Meta Pixel. Make, HubSpot, Salesforce and Pipedrive are coming soon."],
      },
    ],
  },
  {
    slug: "june-2026-first-release",
    issue: 1,
    date: "2026-06-10",
    dateLabel: "June 2026",
    title: "Calbee is here: a booking link that keeps your calendar full",
    summary: "Our first release: a booking link that keeps working after someone books.",
    intro:
      "Every booking tool we tried stopped helping the moment someone booked. But the expensive part of running a calendar comes after that: the late cancellation, the no-show, the request from someone who isn't a fit. So we built Calbee around it. Here's what's in the first release.",
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
];

export const findRelease = (slug: string) => releases.find((r) => r.slug === slug);
