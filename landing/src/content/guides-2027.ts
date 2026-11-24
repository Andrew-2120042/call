import { site } from "@/site.config";
import type { Article, ToolReview } from "./articles";

// Long-form blog posts written for high-intent searches. Competitor prices and plan limits were checked on the date
// in CHECKED against each vendor's pricing page or, where noted, third-party listings. Re-check before editing.
const CHECKED = "November 23, 2026";
const PUBLISHED = "2026-11-23";
const n = site.name;

const src = {
  calendly: { label: `Calendly pricing page (checked ${CHECKED})`, url: "https://calendly.com/pricing" },
  cal: { label: `Cal.com pricing page (checked ${CHECKED})`, url: "https://cal.com/pricing" },
  acuity: { label: `Acuity Scheduling pricing on Capterra (checked ${CHECKED})`, url: "https://www.capterra.com/p/191978/Acuity-Scheduling/pricing/" },
  tidycal: { label: `TidyCal help center: TidyCal vs Calendly (checked ${CHECKED})`, url: "https://help.tidycal.com/article/714-tidycal-vs-calendly" },
  zcal: { label: `zcal pricing on Capterra (checked ${CHECKED})`, url: "https://www.capterra.com/p/227575/zcal/pricing/" },
  google: { label: "Google Calendar Help: compare premium features for appointment schedules", url: "https://support.google.com/calendar/answer/16287038" },
  hubspot: { label: "HubSpot: free meeting scheduler", url: "https://www.hubspot.com/products/sales/schedule-meeting" },
  bookings: { label: `Microsoft Bookings pricing on Capterra (checked ${CHECKED})`, url: "https://capterra.com/p/176567/Bookings/" },
  savvycal: { label: `SavvyCal pricing history on PricingSaaS (checked ${CHECKED})`, url: "https://pricingsaas.com/companies/savvycal" },
  noShowStudy: { label: "Prevalence, predictors and economic consequences of no-shows (BMC Health Services Research)", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4714455/" },
  reminderReview: { label: "Effectiveness of outpatient appointment reminder systems (PubMed)", url: "https://pubmed.ncbi.nlm.nih.gov/20569761/" },
  leadResponse: { label: "Workato: lead response times at 114 B2B companies", url: "https://www.workato.com/the-connector/lead-response-time-study" },
  hbr: { label: "Harvard Business Review: The Short Life of Online Sales Leads", url: "https://hbr.org/2011/03/the-short-life-of-online-sales-leads" },
};

// Reviews are shared between articles so each tool is described the same way everywhere.
export const tools = {
  calendly: {
    name: "Calendly",
    platforms: "Web, iOS, Android",
    bestFor: "A safe, widely recognised default for solo professionals and sales teams",
    pros: ["The link most clients already recognise", "Polished, reliable booking flow", "Deep integrations and routing forms on Teams"],
    cons: ["Free plan allows one event type and one calendar", "Priced per seat, so teams get expensive", "Nothing built in to refill a cancelled slot"],
    pricing: "Free plan with 1 event type and 1 calendar. Standard is $10 per seat a month and Teams $16 per seat a month, billed yearly. Enterprise starts around $15,000 a year.",
    url: "https://calendly.com",
  },
  cal: {
    name: "Cal.com",
    platforms: "Web, macOS, Windows, iOS, Android",
    bestFor: "The most capable free plan for one person, and teams that want an open-source tool",
    pros: ["Unlimited booking links and calendars free for one person", "Payments, SMS and email notifications on the free plan", "Open source, with an API for building on top"],
    cons: ["Many settings to work through before your first booking", "Team features are per user", "Removing Cal.com branding needs a paid plan"],
    pricing: "Free for individuals. Teams is $12 per user a month billed yearly ($16 monthly). Organizations from $28 per user a month billed yearly.",
    url: "https://cal.com",
  },
  calbee: {
    name: n,
    platforms: "Web",
    bestFor: "Coaches, therapists and consultants who lose income to cancellations and no-shows",
    pros: ["Waitlist that offers a cancelled time to the next person automatically", "Clients confirm before the day, or the time is released", "Flat team price: $69 a month for up to 10 people"],
    cons: ["No payments at booking yet", "No SMS reminders yet", "Newer than the big names, with fewer integrations"],
    pricing: "Free for one person with unlimited services. Pro is $12 a month. Team is $69 a month for up to 10 people in total.",
    url: `${site.appUrl}/signup`,
  },
  acuity: {
    name: "Acuity Scheduling",
    platforms: "Web, iOS, Android",
    bestFor: "Salons, clinics and studios that take payment at booking",
    pros: ["Deposits, packages and gift certificates", "Detailed intake forms and client history", "Staff and location scheduling"],
    cons: ["No free plan", "Heavier to set up than a booking link", "SMS reminders only from the Growing plan"],
    pricing: "Emerging $16 a month (yearly) or $20 monthly; Growing $27/$34 with up to 6 calendars; Powerhouse $49/$61 with up to 36.",
    url: "https://acuityscheduling.com",
  },
  zcal: {
    name: "zcal",
    platforms: "Web",
    bestFor: "A genuinely free scheduler, with meeting polls included",
    pros: ["Unlimited links and events on the free plan", "Meeting polls for group times", "Automatic Zoom, Meet or Teams links"],
    cons: ["Round robin and SMS reminders need Pro", "Group events capped at 5 people per slot on free", "Light on automation after the booking"],
    pricing: "Free plan with unlimited links and events. Pro adds round robin and SMS reminders.",
    url: "https://zcal.co",
  },
  google: {
    name: "Google Calendar appointment schedules",
    platforms: "Web (booking pages are created on a computer)",
    bestFor: "People who only ever offer one kind of meeting",
    pros: ["Free with any Google account", "Nothing new to sign up for", "Bookings land straight in Google Calendar"],
    cons: ["One booking page on a personal account", "No automatic reminders or payments without a paid plan", "Very little customisation"],
    pricing: "Free with a personal Google account (one booking page). Premium features come with Google Workspace or Google One.",
    url: "https://calendar.google.com",
  },
  bookings: {
    name: "Microsoft Bookings",
    platforms: "Web, Microsoft Teams",
    bestFor: "Companies that already pay for Microsoft 365",
    pros: ["Included in Microsoft 365 business plans", "Staff calendars and Teams links", "Managed by your IT team"],
    cons: ["Not sold on its own", "Rigid setup and customisation", "Feels built for internal teams, not client booking"],
    pricing: "Included with Microsoft 365 business plans from Business Basic.",
    url: "https://www.microsoft.com/microsoft-365/business/scheduling-and-booking-app",
  },
  hubspot: {
    name: "HubSpot Meetings",
    platforms: "Web, iOS, Android",
    bestFor: "Sales teams whose pipeline already lives in HubSpot",
    pros: ["Free with HubSpot's CRM", "Every meeting logged to the contact", "Works with HubSpot sequences and forms"],
    cons: ["Free plan is one personal link with HubSpot branding", "Round robin needs a paid Sales Hub plan", "Overkill if you don't use HubSpot"],
    pricing: "Free with HubSpot CRM (one personal link). Team features come with paid Sales Hub plans.",
    url: "https://www.hubspot.com/products/sales/schedule-meeting",
  },
  tidycal: {
    name: "TidyCal",
    platforms: "Web",
    bestFor: "Paying once instead of every month",
    pros: ["One-time price from $29", "Unlimited booking types", "Paid bookings with Stripe and PayPal"],
    cons: ["Free plan checks one calendar", "TidyCal branding stays on lifetime plans", "Light team features"],
    pricing: "Free plan with 1 calendar. Individual $29 and Agency $79, one-time. Pro subscription $12 a month removes branding.",
    url: "https://tidycal.com",
  },
  savvycal: {
    name: "SavvyCal",
    platforms: "Web",
    bestFor: "A booking experience that feels personal for the person booking",
    pros: ["Bookers can overlay their own calendar", "Ranked availability and polls", "Thoughtful, clean design"],
    cons: ["No standing free plan for taking bookings", "Priced per user", "Fewer team features than Calendly"],
    pricing: "Paid plans from about $12 per user a month (third-party listings differ; check before buying).",
    url: "https://savvycal.com",
  },
} satisfies Record<string, ToolReview>;

export const guides2027: Article[] = [
  {
    slug: "best-scheduling-software-2027",
    category: "Best apps",
    title: "The 9 best meeting scheduler apps in 2027",
    description: "Looking for a Calendly or Doodle alternative? We compared the best meeting schedulers on free plans, real prices, team features and what happens when someone cancels.",
    keyword: "best meeting schedulers 2027",
    published: "2026-11-15",
    updated: PUBLISHED,
    answer: `The best meeting schedulers in 2027 are ${n} (best overall: free for unlimited services and calendars, plus a waitlist that refills cancellations), Calendly (best for sales teams), Cal.com (best for developers who want to self-host), Acuity (best for paid appointments), zcal (best free option with polls), Google Calendar (best if you need one booking page), Microsoft Bookings (best for Microsoft 365 companies), HubSpot Meetings (best for HubSpot sales teams) and TidyCal (best one-time price).`,
    sections: [
      {
        heading: "What makes the best meeting scheduler?",
        paragraphs: [
          "A meeting scheduler replaces the email back-and-forth with a link: people see when you're free, pick a time, and the meeting lands in both calendars with a video link and a reminder. Every tool on this list does that. What separates them is everything around it.",
          "We judged each one on the same five things, because they decide whether a scheduler saves you time or quietly costs you clients:",
        ],
        bullets: [
          "Free plan: what you can actually do before paying, especially how many booking types and calendars.",
          "Team price: what five or ten people pay, since per-seat pricing adds up fast.",
          "Reminders: whether they're automatic, and whether clients can confirm they're coming.",
          "Cancellations: what happens to the empty slot when someone cancels.",
          "Setup: how long it takes to go from sign-up to a booking link you'd send a client.",
        ],
      },
      {
        heading: "How we tested",
        paragraphs: [
          `We set up each tool with the same two booking types (a 20-minute intro call and a 60-minute session), connected Google Calendar, booked ourselves from a phone and a laptop in another time zone, then rescheduled and cancelled. Prices are the published list prices on ${CHECKED}; where vendors don't publish a number or listings disagree, we say so.`,
          `${n} is our product. We've included it because it does something none of the others do, and we've been specific about where other tools are the better choice.`,
        ],
      },
      {
        heading: "The best meeting schedulers at a glance",
        table: {
          head: ["Tool", "Best for", "Free plan", "Paid from"],
          rows: [
            [n, "Best overall: fills cancellations, stops no-shows", "Unlimited services, bookings and calendars", "$12/month; Team $69 for 10"],
            ["Calendly", "Sales teams", "1 event type, 1 calendar", "$10/seat/month (yearly)"],
            ["Cal.com", "Developers and self-hosting", "Unlimited links and calendars", "$12/user/month (yearly)"],
            ["Acuity Scheduling", "Paid appointments and intake forms", "None", "$16/month (yearly)"],
            ["zcal", "Free scheduling with polls", "Unlimited links and events", "Pro for round robin"],
            ["Google Calendar", "One free booking page", "1 booking page", "With Workspace / Google One"],
            ["Microsoft Bookings", "Microsoft 365 companies", "Part of Microsoft 365", "Microsoft 365 Business Basic"],
            ["HubSpot Meetings", "HubSpot sales teams", "1 personal link", "Paid Sales Hub"],
            ["TidyCal", "Paying once", "1 calendar", "$29 one-time"],
          ],
        },
      },
      {
        heading: "Best meeting scheduler overall",
        tool: tools.calbee,
        paragraphs: [
          `${n} gives you everything you need to take bookings for free: unlimited services, unlimited Google and Outlook calendars, booking questions and a reminder on every booking. Where it pulls ahead is what happens after someone books.`,
          `Most schedulers stop working once a time is booked. ${n} is built for what happens next. When a time is taken, clients can join a waitlist for it; if the booking is cancelled, the first person waiting gets a private link to claim it, and if they don't within two hours, it moves to the next person.`,
          "Confirm-or-release asks clients to confirm a set time before the session, in one click from an email. Anyone who doesn't is flagged to you, and the time can be released and offered to the waitlist. Approvals let you read each request before it lands on your calendar, with a short AI summary of who's asking and whether they look like a fit.",
          "For teams, the price is flat: $69 a month for up to 10 people, with round robin, collective services and a shared team page.",
        ],
      },
      {
        heading: "Best meeting scheduler for sales teams",
        tool: tools.calendly,
        paragraphs: [
          "Calendly is the category standard. Clients rarely get confused by a Calendly link, the booking page is clean on any device, and it connects to almost every calendar, video and CRM tool. On Teams, routing forms send each lead to the right person and round robin spreads bookings across reps.",
          "The free plan is the catch. One event type and one calendar means a coach with an intro call and a full session already needs Standard. And because it's priced per seat, ten people on Teams cost $160 a month.",
        ],
      },
      {
        heading: "Best meeting scheduler for developers and self-hosting",
        tool: tools.cal,
        paragraphs: [
          "Cal.com is open source, so a developer can self-host it or build scheduling into their own product with its API. The free plan covers one person with unlimited booking links.",
          "The trade-off is configuration. Event types have many tabs and apps are switched on one by one, which is a strength for technical teams and a lot to take in for everyone else.",
        ],
      },
      {
        heading: "Best meeting scheduler for paid appointments",
        tool: tools.acuity,
        paragraphs: [
          "If you sell appointments rather than meetings, Acuity is built for you: deposits, packages, gift certificates, intake forms and a client history you can check before each session. It handles multiple staff and locations without workarounds.",
          "There's no free plan, and setup takes longer than a simple booking link. For a business that takes payment at booking, that depth is the point.",
        ],
      },
      {
        heading: "Best free meeting scheduler with polls",
        tool: tools.zcal,
        paragraphs: [
          "zcal gives away most of what others charge for: unlimited links and events, meeting polls for finding a time with a group, and automatic video links. Round robin and SMS reminders are the main things that need Pro.",
        ],
      },
      {
        heading: "Best meeting scheduler if you only need one booking page",
        tool: tools.google,
        paragraphs: [
          "If you only ever offer one kind of meeting, Google Calendar's appointment schedules are already in your account. A personal account gets one booking page; reminders, payments and more pages need a paid Google plan. It's hard to beat free and already there.",
        ],
      },
      {
        heading: "Best meeting scheduler for Microsoft 365 companies",
        tool: tools.bookings,
        paragraphs: [
          "Microsoft Bookings comes with Microsoft 365 business plans and fits teams that live in Outlook and Teams: staff calendars, Teams links and reminders, all managed by IT. It's more rigid than a dedicated scheduler.",
        ],
      },
      {
        heading: "Best meeting scheduler for HubSpot sales teams",
        tool: tools.hubspot,
        paragraphs: [
          "HubSpot Meetings logs every booking to the contact record, which matters more to a HubSpot sales team than any scheduling feature. The free version is one personal link; round robin needs a paid Sales Hub plan.",
        ],
      },
      {
        heading: "Best meeting scheduler for paying once",
        tool: tools.tidycal,
        paragraphs: [
          "TidyCal swaps the subscription for a one-time price. It covers the basics well, including paid bookings, but its branding stays on lifetime plans and team features are light.",
        ],
      },
      {
        heading: "Which meeting scheduler should you choose?",
        table: {
          head: ["If you are…", "Choose"],
          rows: [
            ["Anyone who wants a free booking link that keeps their calendar full", n],
            ["A developer who wants to self-host", "Cal.com"],
            ["A sales team that needs routing and doesn't mind per-seat pricing", "Calendly (Teams)"],
            ["A salon, clinic or studio that takes payment at booking", "Acuity Scheduling"],
            ["Only ever offering one kind of meeting", "Google Calendar"],
            ["A company that runs on Microsoft 365", "Microsoft Bookings"],
            ["A small team that doesn't want per-seat pricing", `${n} Team ($69 for up to 10)`],
          ],
        },
      },
    ],
    faq: [
      { q: "What is the best free meeting scheduler?", a: `${n}: unlimited services, bookings and calendars for free, plus a reminder on every booking. Cal.com and zcal also give unlimited booking types. Calendly's free plan is limited to one event type and one calendar, and Google Calendar gives a personal account one booking page.` },
      { q: "What is the cheapest meeting scheduler for a team?", a: `Per-seat tools get expensive as you grow: ten people on Calendly Teams is $160 a month and on Cal.com Teams $120 a month (yearly billing). ${n} Team is $69 a month for up to 10 people in total.` },
      { q: "Which meeting scheduler reduces no-shows the most?", a: `Most send reminders. ${n} also asks clients to confirm before the day and can release the time if they don't, so the slot can be rebooked instead of sitting empty.` },
      { q: "Do clients need an account to book a meeting?", a: "No, with any tool on this list. Clients book from a link and manage the booking from their email." },
      { q: "Can a meeting scheduler take payments?", a: "Calendly, Cal.com, Acuity and TidyCal can take payment at booking through Stripe or PayPal. Calbee doesn't take payments yet." },
    ],
    sources: [src.calendly, src.cal, src.acuity, src.zcal, src.google, src.bookings, src.hubspot, src.tidycal, src.savvycal],
  },
  {
    slug: "free-meeting-scheduler",
    category: "Best apps",
    title: "The best free meeting schedulers in 2027 (and what's really free)",
    description: "We compared the free plans of Calendly, Cal.com, zcal, Google Calendar, Calbee, TidyCal and HubSpot limit by limit, so you know what you get before you sign up.",
    keyword: "free meeting scheduler",
    published: PUBLISHED,
    updated: PUBLISHED,
    answer: `A free meeting scheduler gives you a booking link people use to pick a time on your calendar without back-and-forth emails. The most generous free plan is ${n}: unlimited services, bookings and calendars, with a reminder on every booking. Cal.com and zcal also allow unlimited booking types. Calendly's free plan stops at one event type and one calendar, and Google Calendar's free version gives you one booking page.`,
    sections: [
      {
        heading: "What a free meeting scheduler should include",
        paragraphs: [
          "Almost every scheduling tool has a free plan, but the limits sit where you notice them least: the day you want a second kind of meeting, or a second calendar checked for conflicts. Before choosing, check four things:",
        ],
        bullets: [
          "More than one booking type, so you can offer an intro call and a full session.",
          "Conflict checking against every calendar you use, work and personal.",
          "An automatic video link on every booking.",
          "At least one reminder email, so people turn up.",
        ],
      },
      {
        heading: "Free meeting schedulers compared",
        table: {
          head: ["Tool", "Booking types", "Calendars checked", "Reminders", "Main limit"],
          rows: [
            [n, "Unlimited", "Unlimited (Google and Outlook)", "Email reminder on every booking", "None for taking bookings; waitlist free on one service"],
            ["Cal.com", "Unlimited", "Unlimited", "Email and SMS", "One user; no round robin"],
            ["zcal", "Unlimited", "Several", "Email", "Round robin and SMS need Pro"],
            ["Calendly", "1", "1", "Not on free", "One event type"],
            ["Google Calendar", "1 booking page", "Your Google calendar", "Not on free", "Premium needs a paid Google plan"],
            ["TidyCal", "Unlimited", "1", "Email", "One calendar; TidyCal branding"],
            ["HubSpot Meetings", "1 personal link", "Google or Office 365", "Basic", "HubSpot branding"],
          ],
        },
      },
      {
        heading: "Best free meeting scheduler overall",
        tool: tools.calbee,
        paragraphs: [
          `${n} Free gives you everything you need to take bookings, with no time limit: unlimited services and bookings, unlimited Google and Outlook calendars, unlimited booking questions, a reminder on every booking and a one-click rebooking email when someone cancels. It's set up in a few minutes, without a wall of settings.`,
          "When cancellations start costing you sessions, Pro adds a waitlist that refills them, confirm-or-release for no-shows and an AI summary of every request.",
        ],
      },
      {
        heading: "Best free meeting scheduler for developers",
        tool: tools.cal,
        paragraphs: [
          "Cal.com's free plan suits technical users: it's open source, can be self-hosted and has a lot of settings to configure. Expect to spend longer setting it up.",
        ],
      },
      {
        heading: "Best free meeting scheduler with polls",
        tool: tools.zcal,
        paragraphs: ["zcal adds meeting polls to unlimited booking links, which makes it the easiest free option when you also need to find a time with a group."],
      },
      {
        heading: "Best free option you already have",
        tool: tools.google,
        paragraphs: ["If you only offer one kind of meeting, Google Calendar's appointment schedules cost nothing and need no new account. Expect very little customisation and no reminders on a personal account."],
      },
      {
        heading: "Where free plans run out",
        paragraphs: [
          "Free plans are designed for one person getting booked. They run out at the same three points: teams (round robin and shared pages are almost always paid), automation (multiple reminders and follow-ups) and branding (removing the tool's name from your page).",
          "No free plan we tested refills a cancelled slot or asks clients to confirm before the day. Those protect income, and they're what most paid upgrades are actually for.",
        ],
      },
      {
        heading: "How to set up a free meeting scheduler in 10 minutes",
        bullets: [
          "Connect the calendar you live in, plus any other calendar that should block time.",
          "Set your weekly hours and a minimum notice period, so nobody books you for 20 minutes from now.",
          "Create two booking types: a short intro call and your main session.",
          "Add one or two questions that help you prepare. Every extra question loses a few bookings.",
          "Turn on the automatic video link and the reminder email.",
          "Book yourself from a private window to check the flow, then put the link in your email signature, bio and website.",
        ],
      },
    ],
    faq: [
      { q: "Is there a completely free meeting scheduler?", a: `Yes. ${n}, Cal.com, zcal and Google Calendar all have free plans with no time limit and no card needed. Each limits something different, so compare the table above with what you need.` },
      { q: "Is Calendly free?", a: "Calendly has a free plan, but it allows one event type and one connected calendar. Reminders and more event types need Standard at $10 per seat a month billed yearly." },
      { q: "Can I use a free scheduler for my business?", a: `Yes. The free plans from ${n}, Cal.com and zcal can be used for business. Their limits are about features and team size, not commercial use.` },
      { q: "Do free schedulers add their own branding?", a: "Usually. Removing the tool's name from your booking page is one of the most common paid features." },
    ],
    sources: [src.calendly, src.cal, src.zcal, src.google, src.tidycal, src.hubspot],
  },
  {
    slug: "calendly-alternatives",
    category: "Alternatives",
    title: "The 8 best Calendly alternatives in 2027",
    description: "Leaving Calendly? Compare the best Calendly alternatives on free plans, team pricing, reminders and no-shows, and find the right replacement for the reason you're leaving.",
    keyword: "Calendly alternative",
    published: PUBLISHED,
    updated: PUBLISHED,
    answer: `The best Calendly alternative is ${n}: unlimited services and calendars for free, a waitlist that refills cancellations, and a flat $69 team price instead of per-seat billing. For self-hosting, Cal.com. For paid appointments with intake forms, Acuity. For sales teams already in HubSpot, HubSpot Meetings.`,
    sections: [
      {
        heading: "Why people look for a Calendly alternative",
        paragraphs: ["Calendly is reliable and well known, and many people should stay on it. The reasons people leave are consistent, and each points to a different replacement:"],
        bullets: [
          "The free plan is tight: one event type and one calendar.",
          "Teams pricing is per seat: $16 per seat a month on yearly billing, so ten people cost $160 a month.",
          "It stops at the booking: cancellations leave empty slots and no-shows only get reminders.",
          "It's built around sales: routing forms are great for SDRs and overkill for a coach or therapist.",
        ],
      },
      {
        heading: "Calendly alternatives at a glance",
        table: {
          head: ["Tool", "Why switch", "Free plan", "Team of 10"],
          rows: [
            ["Calendly (for reference)", "-", "1 event type, 1 calendar", "$160/month (Teams, yearly)"],
            [n, "Best overall: free plan, refills cancellations, flat team price", "Unlimited services and calendars", "$69/month"],
            ["Cal.com", "Open source, self-hosting", "Unlimited links and calendars", "$120/month (yearly)"],
            ["Acuity Scheduling", "Payments, packages, intake forms", "None", "Powerhouse $49 covers 36 calendars"],
            ["zcal", "Free, with polls", "Unlimited links and events", "Pro per user"],
            ["TidyCal", "Pay once", "1 calendar", "Agency $79 one-time"],
            ["HubSpot Meetings", "Meetings in your CRM", "1 personal link", "Paid Sales Hub"],
            ["SavvyCal", "Booker overlays their calendar", "None", "About $12/user"],
            ["Microsoft Bookings", "Already on Microsoft 365", "Part of Microsoft 365", "Per Microsoft 365 user"],
          ],
        },
      },
      {
        heading: `Best Calendly alternative overall: ${n}`,
        tool: tools.calbee,
        paragraphs: [
          `Calendly gets you booked. ${n} keeps you booked. When a time is taken, clients can join a waitlist for it; if that booking is cancelled, the first person waiting is offered the time by email and has two hours to claim it before it moves to the next person.`,
          "Confirm-or-release asks clients to confirm before the session and can free the time if they don't. Approvals let you read each request first, with a short AI summary of who is asking.",
          `Switching takes a minute: paste a Calendly personal access token into Settings → Import from Calendly, and your event types and weekly hours come across.`,
        ],
      },
      {
        heading: "Best open-source Calendly alternative: Cal.com",
        tool: tools.cal,
        paragraphs: [
          "Cal.com is the pick if you want open source or plan to self-host. Expect more settings to work through than Calendly.",
        ],
      },
      {
        heading: "Best Calendly alternative for paid appointments: Acuity",
        tool: tools.acuity,
        paragraphs: ["If you sell appointments rather than meetings, Acuity is the stronger tool: deposits, packages, intake forms and client history, with SMS reminders from the Growing plan."],
      },
      {
        heading: "Best free Calendly alternative: zcal",
        tool: tools.zcal,
        paragraphs: ["zcal's free plan includes unlimited links, polls and automatic video links, which covers most solo use without paying."],
      },
      {
        heading: "Best Calendly alternative with a one-time price: TidyCal",
        tool: tools.tidycal,
        paragraphs: ["TidyCal replaces the subscription with a one-time payment. Good value for solo use; light once you need team features."],
      },
      {
        heading: "Best Calendly alternative for HubSpot users: HubSpot Meetings",
        tool: tools.hubspot,
        paragraphs: ["If your pipeline lives in HubSpot, its own scheduler logs every meeting to the contact, which is worth more to a sales team than any scheduling feature."],
      },
      {
        heading: "Best Calendly alternative for the booker's experience: SavvyCal",
        tool: tools.savvycal,
        paragraphs: ["SavvyCal lets the person booking overlay their own calendar, so finding a time feels personal rather than transactional."],
      },
      {
        heading: "How to switch from Calendly without losing bookings",
        bullets: [
          "Recreate or import your event types, matching lengths, buffers and questions.",
          "Connect the same calendars so existing Calendly bookings still block time.",
          "Leave your Calendly link live until its last booking has happened; send new clients the new link.",
          "Update the link everywhere: email signature, website, social bios, templates and invoices.",
          "Book a test meeting from a private window and check the confirmation, calendar event and reminder.",
        ],
      },
    ],
    faq: [
      { q: "What is the best free alternative to Calendly?", a: `${n}. Its free plan has unlimited services, bookings and calendars, where Calendly's stops at one event type and one calendar. Cal.com and zcal are also free.` },
      { q: "Is there a Calendly alternative without per-seat pricing?", a: `Yes. ${n} Team is $69 a month for up to 10 people in total, and TidyCal avoids subscriptions with a one-time payment.` },
      { q: "Can I import my Calendly event types?", a: `${n} imports from Calendly in about a minute: paste a Calendly personal access token into Settings → Import from Calendly.` },
      { q: "Does Calendly have a waitlist?", a: `Not built in. Filling a cancelled Calendly slot from a waitlist needs webhooks or another tool. ${n} includes one, free on one service.` },
    ],
    sources: [src.calendly, src.cal, src.acuity, src.zcal, src.tidycal, src.hubspot, src.savvycal, src.bookings],
  },
  {
    slug: "cal-com-alternatives",
    category: "Alternatives",
    title: "The 6 best Cal.com alternatives in 2027",
    description: "Cal.com is powerful and very configurable. If you want something simpler, cheaper for teams, or better at handling cancellations, these are the best Cal.com alternatives.",
    keyword: "Cal.com alternative",
    published: PUBLISHED,
    updated: PUBLISHED,
    answer: `Good Cal.com alternatives are Calendly (the most familiar hosted option), ${n} (simpler, with a waitlist that refills cancellations and a flat $69 team price), Acuity Scheduling (paid appointments and intake), zcal (free, with polls) and SavvyCal (a nicer booking experience). Stay on Cal.com if you need self-hosting, an API, or routing forms.`,
    sections: [
      {
        heading: "Why look beyond Cal.com",
        paragraphs: ["Cal.com is one of the best scheduling tools available. Most people who leave aren't unhappy with what it can do; they're tired of configuring it."],
        bullets: [
          "Lots of settings: event types have many tabs and apps are switched on one by one.",
          "Teams are per user: $12 per user a month on yearly billing, $16 monthly.",
          "Branding: removing Cal.com branding needs a paid team plan.",
          "Built for developers: the API and self-hosting are strengths a coach doesn't need.",
        ],
      },
      {
        heading: "Cal.com alternatives at a glance",
        table: {
          head: ["Tool", "Best for", "Free plan", "Team pricing"],
          rows: [
            ["Cal.com (for reference)", "Flexibility, self-hosting", "1 user, unlimited links", "$12/user/month (yearly)"],
            [n, "Works out of the box; protects your calendar", "Unlimited services and calendars", "$69/month for up to 10"],
            ["Calendly", "Most recognised link, sales teams", "1 event type, 1 calendar", "$16/seat/month (yearly)"],
            ["Acuity Scheduling", "Appointments with payments", "None", "By number of calendars"],
            ["zcal", "Free scheduling with polls", "Unlimited links", "Pro per user"],
            ["SavvyCal", "The booker's experience", "None", "About $12/user"],
          ],
        },
      },
      {
        heading: `Best simpler Cal.com alternative: ${n}`,
        tool: tools.calbee,
        paragraphs: [
          `${n} keeps what you use every day (booking pages, calendar sync, booking questions, reminders, round robin) and drops the configuration. A new account asks a few plain questions and sets up your services for you.`,
          "It goes further than Cal.com after the booking: a waitlist refills cancellations, confirm-or-release stops no-shows, each request arrives with an AI summary, and an assistant can move or cancel bookings after you approve the change. Team is $69 a month for up to 10 people, cheaper than Cal.com Teams from the sixth person.",
        ],
      },
      {
        heading: "Best hosted Cal.com alternative: Calendly",
        tool: tools.calendly,
        paragraphs: ["If you want Cal.com's features without self-hosting decisions, Calendly is the obvious hosted choice, with routing forms and deep integrations. Its free plan is much tighter."],
      },
      {
        heading: "Best Cal.com alternative for paid appointments: Acuity",
        tool: tools.acuity,
        paragraphs: ["Acuity is better than Cal.com for businesses that sell appointments: packages, deposits, intake forms and client records."],
      },
      {
        heading: "Best free Cal.com alternative: zcal",
        tool: tools.zcal,
        paragraphs: ["zcal is a simpler free tool with polls and automatic video links, and far fewer settings."],
      },
      {
        heading: "Best Cal.com alternative for the booker: SavvyCal",
        tool: tools.savvycal,
        paragraphs: ["SavvyCal focuses on making booking pleasant for the other person, with calendar overlay and ranked times."],
      },
      {
        heading: "When to stay on Cal.com",
        bullets: [
          "You need to self-host for data control.",
          "You're building scheduling into your own product with its API.",
          "You rely on routing forms, organisations, SSO or SCIM.",
          "You take payment at booking on the free plan.",
        ],
      },
    ],
    faq: [
      { q: "Is Cal.com free?", a: "Yes, for one person. The free plan includes unlimited booking links and calendar connections. Team features start at $12 per user a month on yearly billing." },
      { q: "What is a simpler alternative to Cal.com?", a: `${n} covers everyday scheduling with far fewer settings, and adds a waitlist and no-show protection on Pro.` },
      { q: "Which Cal.com alternative is cheapest for a team?", a: `${n} Team is $69 a month for up to 10 people. Cal.com Teams is $12 per user a month on yearly billing, so it's cheaper up to five people and more expensive after that.` },
    ],
    sources: [src.cal, src.calendly, src.acuity, src.zcal, src.savvycal, src.google],
  },
  {
    slug: "how-to-get-more-leads",
    category: "Grow your practice",
    title: "How to get more leads for your coaching or service business",
    description: "Practical ways to get more leads in 2027: where leads leak, how to capture them, and how to turn them into booked calls instead of lost emails.",
    keyword: "how to get more leads",
    published: PUBLISHED,
    updated: PUBLISHED,
    answer: "To get more leads, make one clear offer, put a way to book a call everywhere people already find you, answer new enquiries within minutes rather than hours, and follow up with people who showed interest but didn't book. Most service businesses lose more leads to slow replies and missing booking links than to a lack of traffic.",
    sections: [
      {
        heading: "Start with where leads leak",
        paragraphs: [
          "Before chasing more traffic, look at what happens to the interest you already get. Leads are usually lost in three places: someone visits but there's no obvious next step, someone enquires and waits a day for a reply, or someone books, cancels and never hears from you again.",
          "Response time alone is a big leak. When Workato sent demo requests to 114 B2B companies, none called back within five minutes and only 42% responded within the hour. Harvard Business Review's analysis of over a million leads found companies that contacted a lead within an hour were far more likely to qualify them than those that waited.",
        ],
      },
      { heading: "1. Make one offer that's easy to say yes to", paragraphs: ["People book calls for a specific outcome, not for your services list. Pick one first step and name it plainly: a 20-minute fit call, a free website review, a first session at a reduced price. Short, low-risk and obviously useful."] },
      {
        heading: "2. Put a booking link everywhere you're found",
        bullets: [
          "Your website: in the header, at the end of every page and on the contact page. An embedded booking page converts better than a contact form.",
          "Your profiles: Instagram, LinkedIn, TikTok and Google Business Profile all have a link field.",
          "Your email signature and every reply to an enquiry.",
          "The end of every post, video, newsletter and podcast episode.",
        ],
      },
      { heading: "3. Answer your clients' real questions in public", paragraphs: ["The questions clients ask on intro calls are the content that attracts more of them. Answer each one properly in a post or short video. Over time this brings in people already looking for what you do, and AI assistants like ChatGPT and Perplexity increasingly quote clear, specific answers."] },
      { heading: "4. Ask for referrals at the right moment", paragraphs: ["Ask right after a client gets a result, not at the end of the engagement. Make it specific (\"who else do you know who's trying to…\") and give them your booking link so the introduction becomes a call, not an email chain."] },
      {
        heading: "5. Answer fast, or let people book themselves",
        paragraphs: [
          "If you can't reply within minutes, let leads book a time on the spot. A booking link removes the back-and-forth, and booking questions give you the context you'd otherwise ask for by email.",
          `If you want to vet people first, use approvals instead of a contact form: the person picks a time and answers your questions, and you accept or decline. In ${n}, each request arrives with a short AI summary and a spam check, so a dozen requests take a minute.`,
        ],
      },
      { heading: "6. Don't let cancellations become lost leads", paragraphs: [`A cancelled intro call is still a warm lead. Offer a new time immediately, then follow up once more a few days later. ${n} sends a one-click rebooking email after a cancellation and, on Pro, a second one after three days. If your calendar is full, a waitlist turns "no times available" into a list of people waiting.`] },
      {
        heading: "Track the five numbers that matter",
        table: {
          head: ["Number", "What it tells you"],
          rows: [
            ["Visitors to booked calls", "Whether your offer and booking link are clear"],
            ["Time to first reply", "How many leads cool off waiting for you"],
            ["Booked calls that happen", "Your no-show problem"],
            ["Calls that become clients", "Whether you're attracting the right people"],
            ["Cancellations that rebook", "How many lost leads you're recovering"],
          ],
        },
      },
    ],
    faq: [
      { q: "What is the fastest way to get more leads?", a: "Add a clear booking link wherever people already find you, and reply to every enquiry within minutes. Fixing leaks is quicker than buying new traffic." },
      { q: "Are booking links better than contact forms?", a: "For most service businesses, yes. A contact form starts an email exchange; a booking link ends with a time on your calendar. Use booking questions or approvals if you need to qualify people first." },
      { q: "How do I stop leads from not showing up?", a: "Send reminders and ask people to confirm before the day. Our guide to reducing no-shows covers the details." },
    ],
    sources: [src.leadResponse, src.hbr],
  },
  {
    slug: "how-to-get-clients-on-calls",
    category: "Grow your practice",
    title: "How to get more clients to book a call (and actually show up)",
    description: "How to get clients on meetings: make booking effortless, qualify without friction, confirm before the day, and recover the calls that cancel.",
    keyword: "how to get clients on meetings",
    published: PUBLISHED,
    updated: PUBLISHED,
    answer: "To get more clients on calls, make booking take under a minute, ask only the questions you need, send a reminder and ask for confirmation the day before, and offer a new time the moment someone cancels. Each step removes a point where a ready client quietly drops out.",
    sections: [
      {
        heading: "Why booked calls don't turn into conversations",
        paragraphs: [
          "Getting someone to agree to a call is half the job. Between \"yes\" and the call, people drop out at predictable points: booking takes too long, the times don't suit them, they forget, or they cancel and nobody follows up.",
          "No-shows are common wherever work runs on appointments. A study of ten outpatient clinics found an average no-show rate of about 19%, and reviews of reminder systems show reminders help but don't solve it alone.",
        ],
      },
      {
        heading: "Make booking take under a minute",
        bullets: [
          "Send a link, not a list of times. Clients pick in their own time zone.",
          "Show times soon. If your first free slot is two weeks out, add a short intro slot earlier in the week.",
          "Keep questions to what you need to prepare. Two good questions beat eight.",
          "Don't make people create an account. They should book, reschedule and cancel from email.",
        ],
      },
      {
        heading: "Qualify without adding friction",
        paragraphs: [
          "If you get requests from people who aren't a fit, the answer isn't a longer form. It's an approval step: people pick a time and answer a couple of questions, and you accept or decline.",
          `${n} adds a short AI summary to each request (who is asking, what they want, whether it looks like a fit, and whether it's likely spam), so a full inbox takes a minute to review.`,
        ],
      },
      {
        heading: "Confirm before the day, not just remind",
        paragraphs: [
          "A reminder tells someone a call is coming. A confirmation asks them to say they're still coming, which tells you who isn't while there's still time to give the slot away.",
          `With confirm-or-release in ${n}, clients get a one-click confirm button before the session. If they don't confirm by the deadline, you're told, and the time can be released automatically.`,
        ],
      },
      {
        heading: "Recover cancellations instead of losing them",
        bullets: [
          "Offer new times in the cancellation email itself, so rebooking is one click.",
          "Follow up once more a few days later; many cancellations are about timing, not interest.",
          "Keep a waitlist for your busiest times, so a cancelled slot goes to someone who wanted it.",
        ],
        paragraphs: [`${n} does all three: a one-click rebooking email after every cancellation, a second one after three days on Pro, and a waitlist that offers a freed time to the next person in line.`],
      },
      {
        heading: "A simple checklist",
        table: {
          head: ["Step", "What to set up"],
          rows: [
            ["Booking", "One link, two services (intro and full session), times in the client's time zone"],
            ["Questions", "Two or three, only what you need to prepare"],
            ["Qualifying", "Approvals for calls you want to vet first"],
            ["Before the call", "A reminder the day before and a confirmation deadline"],
            ["Cancellations", "Instant rebooking offer, one follow-up, a waitlist"],
          ],
        },
      },
    ],
    faq: [
      { q: "How do I get clients to book a call with me?", a: "Give them one clear reason to talk (a short, specific first call) and a booking link they can use in under a minute, everywhere they find you." },
      { q: "How do I reduce no-shows for client calls?", a: "Send a reminder, ask for confirmation before the day, and make rescheduling easy so people move the call instead of skipping it." },
      { q: "Should I charge for the first call?", a: "Free short intro calls usually bring in more clients; a paid first session reduces no-shows. Many coaches offer a free 15–20 minute fit call and charge for everything after." },
    ],
    sources: [src.noShowStudy, src.reminderReview],
  },
];
