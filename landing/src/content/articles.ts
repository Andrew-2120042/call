import { site } from "@/site.config";
import { alternativeGuides } from "./guides-alternatives";
import { answerGuides } from "./guides-answers";
import { moneyGuides } from "./guides-money";
import { guides2027 } from "./guides-2027";
// Long-form articles written for specific searches. Competitor facts were checked against their official
// pricing pages on the date in `checked`; re-check before editing numbers.

/** One product reviewed inside a "best of" or "alternatives" article. */
export type ToolReview = {
  name: string;
  platforms: string;
  bestFor: string;
  pros: string[];
  cons: string[];
  pricing: string;
  url: string;
};

export type BlogCategory = "Best apps" | "Alternatives" | "Comparisons" | "Grow your practice" | "How-to";

export type Section = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  table?: { head: string[]; rows: string[][] };
  /** A tool review: rendered as a card with best-for, pros, cons and pricing before the paragraphs. */
  tool?: ToolReview;
};

export type Article = {
  slug: string;
  title: string;
  /** Blog section the article is listed under; defaults to How-to. */
  category?: BlogCategory;
  description: string;
  /** The search this page answers. */
  keyword: string;
  published: string;
  updated: string;
  /** A direct 40–60 word answer shown first; answer engines quote this. */
  answer: string;
  sections: Section[];
  faq: { q: string; a: string }[];
  sources: { label: string; url: string }[];
};

const CHECKED = "November 15, 2026";
const calendlyPricing = { label: `Calendly pricing page (checked ${CHECKED})`, url: "https://calendly.com/pricing" };
const calPricing = { label: `Cal.com pricing page (checked ${CHECKED})`, url: "https://cal.com/pricing" };

const earlierArticles: Article[] = [
  {
    slug: "calendly-vs-cal-com",
    category: "Comparisons",
    title: `Calendly vs Cal.com vs ${site.name} (2027): pricing, free plans and which to pick`,
    description:
      "Calendly vs Cal.com compared on free plans, team pricing, round robin and reminders, with a third option if cancellations and no-shows are your real problem.",
    keyword: "Calendly vs Cal.com",
    published: "2026-11-15",
    updated: "2026-11-15",
    answer:
      `${site.name} has the best free plan of the three (unlimited services, bookings and calendars) and the cheapest team price: $69 a month for up to 10 people. Calendly's free plan allows one event type and one calendar and Teams costs $16 per seat; Cal.com costs $12 per user. Only ${site.name} has a waitlist that refills cancelled slots.`,
    sections: [
      {
        heading: "Side-by-side",
        table: {
          head: ["", `${site.name}`, "Calendly", "Cal.com"],
          rows: [
            ["Free plan", "Unlimited services, bookings and calendars", "1 event type, 1 calendar, one-on-one only", "1 user, unlimited links and calendars"],
            ["Approve bookings first", "Yes, with an AI summary of every request (Pro)", "Not built in", "Yes"],
            ["Automated reminders", "On every booking, free; up to 5 on Pro", "Paid plans", "Free plan includes notifications"],
            ["Round robin", "Team, $69/month for up to 10", "Teams, $16/seat/month", "Teams, $12/user/month"],
            ["Waitlist that refills cancellations", "Yes (Pro)", "No", "No"],
            ["Confirm-or-release for no-shows", "Yes (Pro)", "No", "No"],
          ],
        },
        paragraphs: [
          "Calendly and Cal.com prices are their per-seat prices with yearly billing, from each company's pricing page.",
        ],
      },
      {
        heading: `Choose ${site.name} if`,
        paragraphs: [
          `Your calendar is full and the problem is what happens afterwards: cancellations that leave gaps, clients who don't show, and requests you want to read before accepting. ${site.name} keeps scheduling free and adds a waitlist that offers freed slots automatically, one-click attendance confirmation that can release the time, and AI summaries of booking requests.`,
        ],
      },
      {
        heading: "Choose Calendly if",
        bullets: [
          "Your company already standardised on it and needs enterprise controls.",
          "You rely on its large integration catalogue and admin features.",
        ],
      },
      {
        heading: "Choose Cal.com if",
        bullets: [
          "You want a capable free plan with unlimited booking links.",
          "You want to self-host or need deep configuration and routing.",
        ],
      },
      {
        heading: "Switching is quick",
        paragraphs: [
          `${site.name} imports your Calendly services and weekly hours from an access token in about a minute. Booking links change, so update the link in your email signature and website.`,
        ],
      },
    ],
    faq: [
      { q: "Is Cal.com really free?", a: "Yes for one person. Cal.com's free plan covers one user with unlimited booking links and calendars. Teams start at $12 per user per month." },
      { q: "Does Calendly's free plan include round robin?", a: "No. Round robin is part of Calendly's Teams plan, billed per seat." },
      { q: "Which is cheaper for a team of 5?", a: `At list prices with yearly billing, Calendly Teams is about $80 a month (5 × $16) and Cal.com Teams about $60 (5 × $12). ${site.name} Team is $69 a month for up to 10 people, so it's cheaper than both from 6 people up.` },
    ],
    sources: [calendlyPricing, calPricing],
  },
  {
    slug: "best-scheduling-software-2027",
    category: "Best apps",
    title: "The best scheduling software for 2027, and who each one is for",
    description:
      `An honest guide to the best online scheduling tools for 2027: Calendly, Cal.com, SavvyCal, Acuity, Zoho Bookings and ${site.name}, with the job each one does best.`,
    keyword: "best scheduling software 2027",
    published: "2026-11-15",
    updated: "2026-11-15",
    answer:
      `There is no single best scheduling tool for 2027; pick by the job. Calendly for companies standardised on it, Cal.com for a generous free plan and self-hosting, SavvyCal for a polished booker experience, Acuity for paid appointments, Zoho Bookings for Zoho users, and ${site.name} if cancellations and no-shows cost you money.`,
    sections: [
      {
        heading: "What changed going into 2027",
        bullets: [
          "Free plans diverged: some cap you at one event type, others give unlimited links.",
          "Team pricing is still mostly per seat, which makes growing teams expensive.",
          "Filling cancellations and preventing no-shows matters as much as getting booked in the first place.",
        ],
      },
      {
        heading: "The shortlist",
        table: {
          head: ["Tool", "Best for", "Watch out for"],
          rows: [
            ["Calendly", "Teams already standardised on it; enterprise admin", "Free plan has one event type; per-seat team pricing"],
            ["Cal.com", "Generous free plan, self-hosting, deep configuration", "More setup than most people need"],
            ["SavvyCal", "A polished experience for the person booking", "Paid only"],
            ["Acuity Scheduling", "Paid appointments for service businesses", "Built around Squarespace's ecosystem"],
            ["Zoho Bookings", "Businesses already using Zoho", "Best value inside the Zoho suite"],
            [`${site.name}`, "Professionals losing time to cancellations and no-shows", "Newer, with a smaller app catalogue"],
          ],
        },
      },
      {
        heading: "How to choose in five minutes",
        bullets: [
          "Count your services. If you need more than one on a free plan, rule out tools that cap event types.",
          "Count your hosts. Multiply the per-seat price by your team size, including next year's hires.",
          "Look at last month's calendar. If you lost more than a couple of hours to cancellations or no-shows, a waitlist and attendance confirmation will pay for themselves.",
          "Check your calendar provider works (Google or Outlook) before you migrate.",
        ],
      },
      {
        heading: `Why we built ${site.name}`,
        paragraphs: [
          `Most booking tools stop helping once a time is booked. ${site.name} adds a waitlist for taken times, a confirm-or-release step that frees time when clients don't confirm, and AI summaries so you can approve requests quickly. Scheduling itself is free.`,
        ],
      },
    ],
    faq: [
      { q: "What is the best free scheduling tool?", a: `For one person, Cal.com and ${site.name} both offer unlimited booking links on their free plans. Calendly's free plan is limited to one event type.` },
      { q: "What is the best scheduling tool for small teams?", a: `If price per seat matters, compare totals: Calendly Teams is $16 per seat and Cal.com Teams $12 per user (yearly billing). ${site.name} Team is $69 a month for up to 10 people, then $10 per extra person.` },
    ],
    sources: [calendlyPricing, calPricing],
  },
  {
    slug: "is-calendly-free",
    category: "Comparisons",
    title: "Is Calendly free? What the free plan includes in 2027",
    description:
      "Calendly's free plan explained: one event type, one calendar, one-on-one meetings only. What's missing, what it costs to upgrade, and free alternatives.",
    keyword: "is Calendly free",
    published: "2026-11-15",
    updated: "2026-11-15",
    answer:
      "Yes, Calendly has a free plan, but it allows one event type, one connected calendar and one-on-one meetings only. Round robin, group meetings and automated reminders need a paid plan, starting at $10 per seat per month with yearly billing.",
    sections: [
      {
        heading: "What the free plan includes",
        bullets: ["One event type", "One calendar connection", "One-on-one scheduling", "A booking page and browser extension"],
      },
      {
        heading: "What it doesn't include",
        bullets: ["Round robin and multi-person meetings", "Automated meeting reminders", "Cancellation policies", "Forms with lead routing"],
      },
      {
        heading: "Free alternatives with more",
        paragraphs: [
          `If one event type isn't enough, Cal.com and ${site.name} both offer unlimited booking links for one person on their free plans. ${site.name} also includes unlimited booking questions for free.`,
        ],
      },
    ],
    faq: [
      { q: "How much is Calendly after the free plan?", a: "Standard is $10 per seat per month and Teams $16 per seat per month, both with yearly billing." },
      { q: "Can I have more than one event type on Calendly for free?", a: "No. The free plan includes one event type." },
    ],
    sources: [calendlyPricing],
  },
  {
    slug: "round-robin-scheduling",
    category: "How-to",
    title: "Round robin scheduling: what it is and how to set it up",
    description:
      "Round robin scheduling explained: how bookings rotate across a team, when to use it instead of collective scheduling, and how to set it up with one booking link.",
    keyword: "round robin scheduling",
    published: "2026-11-15",
    updated: "2026-11-15",
    answer:
      "Round robin scheduling gives each new booking to one available team member in turn, so meetings spread evenly across the team behind a single booking link. Collective scheduling is the opposite: every host attends, and only times when all of them are free are offered.",
    sections: [
      {
        heading: "How it works",
        bullets: [
          "Clients see the combined availability of everyone in the rotation.",
          "When they pick a time, the booking goes to a host who is free then, balancing who has had fewer meetings.",
          "Hosts marked as always attending join every booking while the others rotate.",
        ],
      },
      {
        heading: "Round robin vs collective",
        table: {
          head: ["", "Round robin", "Collective"],
          rows: [
            ["Who attends", "One host per booking", "Every host"],
            ["Times offered", "When anyone is free", "Only when everyone is free"],
            ["Good for", "Sales calls, support, intake", "Kick-offs, panels, interviews"],
          ],
        },
      },
      {
        heading: `Setting it up in ${site.name}`,
        bullets: [
          "Create a team and invite people by email or invite link.",
          "Create a team service and choose Round robin.",
          "Open the Assignment tab, add hosts, and share the team link.",
        ],
      },
    ],
    faq: [
      { q: "Does round robin cost extra?", a: `On most tools it's a team feature billed per seat. In ${site.name} it's part of the Team plan, $69 a month for up to 10 people.` },
    ],
    sources: [calendlyPricing, calPricing],
  },
  {
    slug: "fill-last-minute-cancellations",
    category: "Grow your practice",
    title: "How to fill last-minute cancellations with an appointment waitlist",
    description:
      "A practical way to refill cancelled appointments automatically: let clients join a waitlist for taken times and offer freed slots to the first in line.",
    keyword: "fill last minute cancellations",
    published: "2026-11-15",
    updated: "2026-11-15",
    answer:
      "Keep a waitlist for times that are already booked. When a booking is cancelled, email the first person waiting a private link to claim the slot, give them a short window, then move on to the next person. Doing this automatically turns most cancellations back into bookings.",
    sections: [
      {
        heading: "Why manual waitlists fail",
        bullets: [
          "By the time you see the cancellation, the slot is close.",
          "Messaging several people creates double bookings.",
          "Nobody remembers who asked first.",
        ],
      },
      {
        heading: "What a good waitlist does",
        bullets: [
          "Lets clients join for the exact time they wanted, from your booking page.",
          "Offers the slot to one person at a time, in order.",
          "Expires offers so the slot moves on quickly.",
          "Turns a claim into a normal booking with calendar invites.",
        ],
      },
      {
        heading: `Doing it with ${site.name}`,
        paragraphs: [
          "Turn on Waitlist for a service under Booking rules. Your booking page then shows 'Time you want is taken? Join the waitlist'. When a booking is cancelled, the first person in line gets an email to claim it, with two hours to respond by default.",
        ],
      },
    ],
    faq: [
      { q: "Does Calendly have a waitlist?", a: "Not built in. Calendly users build workarounds with webhooks and other tools." },
    ],
    sources: [
      { label: "Calendly community: waitlist workaround using webhooks", url: "https://community.calendly.com/api-webhook-help-61/filling-canceled-slots-automatically-using-the-invitee-canceled-webhook-waitlist-workaround-5989" },
    ],
  },
  {
    slug: "reduce-appointment-no-shows",
    category: "Grow your practice",
    title: "How to reduce appointment no-shows (without chasing clients)",
    description:
      "Practical ways to reduce no-shows: reminders at the right times, one-click attendance confirmation, and releasing unconfirmed slots to a waitlist.",
    keyword: "reduce appointment no-shows",
    published: "2026-11-15",
    updated: "2026-11-15",
    answer:
      "Send reminders a day and an hour before, ask clients to confirm attendance with one click by a deadline, and release the slot if they don't confirm so someone else can take it. Confirmation tells you who is actually coming; reminders alone don't.",
    sections: [
      {
        heading: "Three habits that work",
        bullets: [
          "Two reminders: one the day before and one shortly before the start.",
          "A confirmation deadline: 'confirm by 24 hours before or the time is released'.",
          "A waitlist, so released time is filled instead of wasted.",
        ],
      },
      {
        heading: `Doing it with ${site.name}`,
        paragraphs: [
          "Under Booking rules, choose reminder times and turn on 'Ask clients to confirm they're coming'. Clients get a confirm button by email; if the deadline passes you're alerted, and with release on the booking is cancelled and offered to your waitlist.",
        ],
      },
    ],
    faq: [
      { q: "Do clients need an account to confirm?", a: "No. The confirmation link in the email works without signing in." },
    ],
    sources: [],
  },
];

// The 2027 guides come first; the long "best schedulers" guide replaces the earlier short version of that page.
const newer = [...moneyGuides, ...guides2027, ...answerGuides, ...alternativeGuides];
const replaced = new Set(newer.map((guide) => guide.slug));
export const articles: Article[] = [...newer, ...earlierArticles.filter((article) => !replaced.has(article.slug))];
