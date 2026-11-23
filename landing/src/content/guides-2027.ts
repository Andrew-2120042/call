import { site } from "@/site.config";
import type { Article } from "./articles";

// Long-form guides written for high-intent searches. Competitor prices and plan limits were checked on the date
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

export const guides2027: Article[] = [
  {
    slug: "best-scheduling-software-2027",
    title: "The best meeting schedulers of 2027: 11 tools compared honestly",
    description:
      "The best meeting scheduling software for 2027, compared on free plans, real prices, team features, reminders and no-show handling. Includes a pick for every kind of business.",
    keyword: "best meeting schedulers 2027",
    published: "2026-11-15",
    updated: PUBLISHED,
    answer: `The best meeting scheduler depends on what costs you time. Calendly is the safest all-rounder, Cal.com is the most flexible free plan, Acuity suits paid appointments with intake forms, zcal and Google Calendar are the best no-cost options, HubSpot Meetings fits teams already in HubSpot, and ${n} is built for people who lose money to cancellations and no-shows: it refills cancelled times from a waitlist and asks clients to confirm before the day.`,
    sections: [
      {
        heading: "How we picked",
        paragraphs: [
          "Every tool below was judged on the same five questions, because they're what decide whether a scheduler saves you time or quietly costs you clients: what the free plan really includes, what a team of five pays, whether reminders are automatic, what happens when someone cancels, and how much setup it takes before your first booking.",
          `Prices are the published list prices on ${CHECKED}. Where a vendor doesn't publish a number, or third-party listings disagree, we say so rather than guess. ${n} is our product, so we've been careful to point out where other tools are the better choice.`,
        ],
      },
      {
        heading: "The short list",
        table: {
          head: ["Tool", "Best for", "Free plan", "Paid from"],
          rows: [
            ["Calendly", "A safe default for sales and solo pros", "1 event type, 1 calendar", "$10/seat/month (yearly)"],
            ["Cal.com", "Flexible free plan, developers, self-hosting", "1 user, unlimited links and calendars", "$12/user/month (Teams, yearly)"],
            [n, "Coaches, therapists and consultants who lose time to cancellations and no-shows", "1 person, unlimited services and bookings", "$12/month (Pro); $69/month for up to 10 people (Team)"],
            ["Acuity Scheduling", "Paid appointments with intake forms", "No free plan", "$16/month (yearly)"],
            ["zcal", "Free scheduling with polls", "Unlimited links and events", "Pro for round robin and SMS"],
            ["Google Calendar appointment schedules", "Already on Google, need one booking page", "1 booking page", "Included in Google Workspace / Google One"],
            ["Microsoft Bookings", "Teams already on Microsoft 365", "No (part of Microsoft 365)", "Included from Microsoft 365 Business Basic"],
            ["HubSpot Meetings", "Sales teams that live in HubSpot", "1 personal link with HubSpot branding", "Paid HubSpot Sales Hub"],
            ["TidyCal", "A one-time price instead of a subscription", "Yes, 1 calendar", "$29 one-time (lifetime)"],
            ["SavvyCal", "A polished booking experience for the person booking", "No standing free plan", "About $12/user/month"],
            ["Doodle", "Group polls to find one time for many people", "Yes, polls", "Paid plans for booking pages"],
          ],
        },
      },
      {
        heading: "Calendly: the safe default",
        paragraphs: [
          "Calendly is the tool most people already know, which matters: clients rarely get confused by a Calendly link. It's reliable, integrates with almost everything, and its Teams plan adds round robin and routing forms for sales teams.",
          "The catch is the free plan. It allows one event type and one calendar, so a coach with an intro call and a paid session already needs Standard at $10 per seat a month on yearly billing. Teams is $16 per seat, so ten people cost $160 a month. Enterprise starts around $15,000 a year.",
        ],
        bullets: [
          "Choose it if: you want the most widely recognised link and don't mind paying per seat.",
          "Skip it if: you need more than one booking type for free, or your team is growing fast.",
        ],
      },
      {
        heading: "Cal.com: the most generous free plan for one person",
        paragraphs: [
          "Cal.com's free Individuals plan gives one person unlimited booking links and unlimited calendar connections, plus payments through Stripe and PayPal, email and SMS notifications and Calendly import. It's open source, so you can host it yourself if you have a developer.",
          "Team features (round robin, collective events, routing forms, removing Cal.com branding) start at $12 per user a month billed yearly, or $16 monthly. It's very configurable, which is a strength for technical teams and a lot of settings for everyone else.",
        ],
        bullets: [
          "Choose it if: you want the most capable free plan, or need self-hosting or an API.",
          "Skip it if: you want something simple that works without configuration.",
        ],
      },
      {
        heading: `${n}: for when cancellations and no-shows cost you money`,
        paragraphs: [
          `${n} is a booking link built for people whose calendar is their income: coaches, therapists, consultants, tutors and small service teams. The free plan covers one person with unlimited services and bookings, Google Calendar and Outlook sync, unlimited booking questions and one reminder per booking.`,
          "Pro ($12 a month) adds what other schedulers leave to you after a booking is made. Clients can join a waitlist for a taken time, and when that booking is cancelled the next person waiting is offered it by email automatically. Confirm-or-release asks clients to confirm before the day and can free the time if they don't. Approvals let you read every request before it lands on your calendar, and each one comes with a short AI summary of who is asking and whether they look like a fit.",
          "Team is $69 a month for up to 10 people in total, not per seat, with round robin, collective services and a shared team page.",
        ],
        bullets: [
          "Choose it if: a cancelled session or a no-show is lost income for you.",
          "Skip it if: you need payments at booking, SMS reminders or enterprise routing today. Those aren't built in.",
        ],
      },
      {
        heading: "Acuity Scheduling: paid appointments and intake forms",
        paragraphs: [
          "Acuity, owned by Squarespace, is built for appointment businesses: intake forms, packages, deposits and client history. Plans run from Emerging at $16 a month (yearly) or $20 monthly, to Growing at $27/$34 with up to six calendars and SMS reminders, to Powerhouse at $49/$61 with up to 36.",
          "There's no free plan, and the setup is heavier than a simple booking link. For salons, clinics and studios that take payment at booking, that depth is the point.",
        ],
      },
      {
        heading: "zcal and Google Calendar: the best $0 options",
        paragraphs: [
          "zcal's free plan includes unlimited booking links and events, meeting polls and automatic Zoom, Google Meet or Teams links. Round robin and SMS reminders need its Pro plan. It's one of the few free tools that doesn't push you to upgrade for basics.",
          "Google Calendar's appointment schedules come free with any Google account. A personal account gets one booking page, without automatic email reminders or payments. Those, plus multiple booking pages, need a paid Google Workspace or Google One plan. If you only ever offer one kind of meeting, it's hard to beat free and already there.",
        ],
      },
      {
        heading: "Microsoft Bookings and HubSpot Meetings: if you already pay for the suite",
        paragraphs: [
          "Microsoft Bookings isn't sold on its own. It's included with Microsoft 365 business plans from Business Basic, and it fits teams that live in Outlook and Teams: staff calendars, Teams links and reminders, managed by IT. Setup and customisation are more rigid than a dedicated scheduler.",
          "HubSpot Meetings is free with HubSpot's CRM: one personal link that logs every meeting to the contact. Round robin for sales teams needs a paid Sales Hub plan. It makes the most sense when your pipeline already lives in HubSpot.",
        ],
      },
      {
        heading: "TidyCal, SavvyCal and Doodle",
        paragraphs: [
          "TidyCal is sold as a one-time purchase: $29 for the Individual plan or $79 for Agency, with a free plan limited to one calendar. TidyCal's branding stays on lifetime plans; removing it needs the Pro subscription.",
          "SavvyCal focuses on the person booking: they can overlay their own calendar to pick a time. It has no standing free plan, and paid plans start around $12 per user a month (third-party listings differ, so check before buying).",
          "Doodle is the tool for one question: when can these eight people all meet? Its polls are excellent for that and less suited to client booking pages.",
        ],
      },
      {
        heading: "Which one should you pick?",
        table: {
          head: ["If you are…", "Start with"],
          rows: [
            ["A coach, therapist or consultant losing sessions to cancellations", n],
            ["A solo professional who wants the most free features", "Cal.com or zcal"],
            ["A sales team that needs routing and is happy to pay per seat", "Calendly (Teams)"],
            ["A salon, clinic or studio that takes payment at booking", "Acuity Scheduling"],
            ["Only ever offering one kind of meeting", "Google Calendar appointment schedules"],
            ["A company that runs on Microsoft 365", "Microsoft Bookings"],
            ["A small team that doesn't want per-seat pricing", `${n} Team ($69 for up to 10)`],
          ],
        },
      },
    ],
    faq: [
      { q: "What is the best free meeting scheduler?", a: `For one person, Cal.com, zcal and ${n} all give you unlimited booking types for free. Calendly's free plan is limited to one event type and one calendar. Google Calendar is free but gives a personal account one booking page.` },
      { q: "What is the cheapest scheduler for a team?", a: `Per-seat tools get expensive as you grow: ten people on Calendly Teams is $160 a month and on Cal.com Teams $120 a month (yearly billing). ${n} Team is $69 a month for up to 10 people in total.` },
      { q: "Which scheduler reduces no-shows the most?", a: `Most tools send reminders. ${n} also asks clients to confirm before the day and can release the time if they don't, so the slot can be rebooked instead of sitting empty.` },
      { q: "Do clients need an account to book?", a: "No, with any of the tools on this list. Clients book from a link and manage the booking from their email." },
    ],
    sources: [src.calendly, src.cal, src.acuity, src.zcal, src.google, src.bookings, src.hubspot, src.tidycal, src.savvycal],
  },
  {
    slug: "free-meeting-scheduler",
    title: "Free meeting scheduler: what every free plan really includes in 2027",
    description:
      "Looking for a free meeting scheduler? We compared the free plans of Calendly, Cal.com, zcal, Google Calendar, TidyCal, HubSpot and more, limit by limit.",
    keyword: "free meeting scheduler",
    published: PUBLISHED,
    updated: PUBLISHED,
    answer: `A free meeting scheduler gives you a booking link people can use to pick a time on your calendar without back-and-forth emails. The most generous free plans for one person are Cal.com, zcal and ${n}, which all allow unlimited booking types. Calendly's free plan stops at one event type and one calendar, and Google Calendar's free version gives you one booking page.`,
    sections: [
      {
        heading: "What a free scheduler should give you",
        paragraphs: [
          "Almost every scheduling tool has a free plan, but the limits differ a lot, and they're usually where you notice them least: on the day you want a second kind of meeting, or a second calendar checked for conflicts.",
          "Before choosing, decide what you can't do without. For most people that's four things: more than one booking type (an intro call and a full session), conflict checking against every calendar you use, an automatic video link, and at least one reminder email so people turn up.",
        ],
      },
      {
        heading: "Free plans side by side",
        table: {
          head: ["Tool", "Booking types", "Calendars checked", "Reminders", "Main free-plan limit"],
          rows: [
            ["Calendly", "1", "1", "Not on free", "One event type; reminders need Standard ($10/seat/month yearly)"],
            ["Cal.com", "Unlimited", "Unlimited", "Email and SMS notifications", "One user; no round robin or branding removal"],
            [n, "Unlimited", "Google Calendar and Outlook", "One per booking", "One person; waitlist, approvals and confirm-or-release are Pro"],
            ["zcal", "Unlimited", "Several", "Automatic email reminder", "Round robin and SMS reminders need Pro"],
            ["Google Calendar", "1 booking page", "Your Google calendar", "Not on free", "Premium features need Workspace or Google One"],
            ["TidyCal", "Unlimited", "1", "Email", "One calendar; TidyCal branding"],
            ["HubSpot Meetings", "1 personal link", "Google or Office 365", "Basic", "HubSpot branding; round robin needs paid Sales Hub"],
          ],
        },
      },
      {
        heading: "The best free meeting schedulers, by situation",
        bullets: [
          "You only ever offer one kind of meeting: Google Calendar appointment schedules. It's already in your account and costs nothing.",
          "You want the most features for $0: Cal.com. Unlimited links and calendars, payments and notifications for one person.",
          "You also run group polls: zcal. Free polls plus unlimited booking links.",
          `You're a coach, therapist or consultant: ${n}. Unlimited services free, and when you're ready, Pro adds the waitlist that refills cancellations and confirm-or-release for no-shows.`,
          "Your pipeline lives in HubSpot: HubSpot Meetings, so every booking lands on the contact record.",
        ],
      },
      {
        heading: "Where free plans usually run out",
        paragraphs: [
          "Free plans are designed to cover one person getting booked. They tend to run out at the same three points: teams (round robin and shared pages are almost always paid), automation (multiple reminders, follow-ups and workflows), and branding (removing the tool's name from your page).",
          "The other gap is what happens after a booking. No free plan we tested refills a cancelled slot for you or asks a client to confirm before the day. Those are the features that protect income, and they're what most paid upgrades are actually for.",
        ],
      },
      {
        heading: "How to set up a free scheduler in 10 minutes",
        bullets: [
          "Connect the calendar you live in, plus any other calendar that should block time (a work and a personal one, for example).",
          "Set your weekly hours and a minimum notice period, so nobody books you for 20 minutes from now.",
          "Create two booking types: a short intro call and your main session.",
          "Add one or two questions that help you prepare, and no more. Every extra question loses a few bookings.",
          "Turn on the automatic video link and the reminder email.",
          "Book yourself from a private window to check the whole flow, then put the link in your email signature, bio and website.",
        ],
      },
    ],
    faq: [
      { q: "Is there a completely free meeting scheduler?", a: `Yes. Cal.com, zcal, Google Calendar and ${n} all have free plans with no time limit and no card needed. Each limits something different, so check the table above against what you need.` },
      { q: "Is Calendly free?", a: "Calendly has a free plan, but it allows one event type and one connected calendar. Reminders and more event types need the Standard plan at $10 per seat a month on yearly billing." },
      { q: "Can I use a free scheduler for my business?", a: `Yes. Free plans from Cal.com, zcal and ${n} are allowed for business use. The limits are about features and team size, not commercial use.` },
      { q: "Do free schedulers add their own branding?", a: "Usually yes. Removing the tool's name from your booking page is one of the most common paid features." },
    ],
    sources: [src.calendly, src.cal, src.zcal, src.google, src.tidycal, src.hubspot],
  },
  {
    slug: "calendly-alternatives",
    title: "Calendly alternatives: 8 tools that fix what Calendly doesn't",
    description:
      "The best Calendly alternatives for 2027, compared on free plans, team pricing, reminders and no-shows. Find the right replacement for the reason you're leaving.",
    keyword: "Calendly alternative",
    published: PUBLISHED,
    updated: PUBLISHED,
    answer: `The best Calendly alternative depends on why you're leaving. For a better free plan, try Cal.com or zcal. For paid appointments with intake forms, Acuity. For team pricing that isn't per seat, or to stop losing sessions to cancellations and no-shows, ${n}. For sales teams already in HubSpot, HubSpot Meetings.`,
    sections: [
      {
        heading: "Why people look for a Calendly alternative",
        paragraphs: [
          "Calendly is reliable and well known, and plenty of people should stay on it. The reasons people leave are consistent, though, and each points to a different replacement.",
        ],
        bullets: [
          "The free plan is tight: one event type and one calendar. An intro call plus a paid session already needs Standard.",
          "Team pricing is per seat: Teams is $16 per seat a month on yearly billing, so ten people cost $160 a month.",
          "It stops at the booking: cancellations leave empty slots, and no-shows are handled with reminders alone.",
          "It's built around sales teams: features like routing forms are great for SDRs and overkill for a coach or a therapist.",
        ],
      },
      {
        heading: "Calendly alternatives at a glance",
        table: {
          head: ["Tool", "Why switch", "Free plan", "Team of 10 (monthly, yearly billing)"],
          rows: [
            ["Calendly (for reference)", "-", "1 event type, 1 calendar", "$160 (Teams, $16/seat)"],
            ["Cal.com", "More on the free plan; open source", "Unlimited links and calendars", "$120 (Teams, $12/user)"],
            [n, "Waitlist refills cancellations; confirm-or-release for no-shows; flat team price", "Unlimited services, 1 person", "$69 for up to 10 people"],
            ["Acuity Scheduling", "Payments, packages, intake forms", "None", "Powerhouse $49 covers up to 36 calendars"],
            ["zcal", "Free with polls", "Unlimited links and events", "Pro pricing per user"],
            ["TidyCal", "Pay once", "1 calendar", "Agency $79 one-time"],
            ["HubSpot Meetings", "Meetings logged in your CRM", "1 personal link", "Paid Sales Hub"],
            ["SavvyCal", "Booker can overlay their own calendar", "None", "About $12/user"],
            ["Microsoft Bookings", "Already paying for Microsoft 365", "Part of Microsoft 365", "Per Microsoft 365 user"],
          ],
        },
      },
      {
        heading: "Cal.com: the closest like-for-like replacement",
        paragraphs: [
          "Cal.com does almost everything Calendly does, and its free plan is much more generous: unlimited booking links and calendars for one person, with payments and notifications. Teams costs $12 per user a month on yearly billing. It's the natural move if your only complaint is Calendly's free plan or you want an open-source tool.",
        ],
      },
      {
        heading: `${n}: for people who lose money after the booking`,
        paragraphs: [
          `Calendly gets you booked. ${n} is built to keep you booked. When a time is taken, clients can join a waitlist for it, and if that booking is cancelled the first person waiting is emailed a private link to claim it. If they don't claim it within two hours, it moves to the next person, so the slot doesn't wait on one inbox.`,
          "Confirm-or-release asks clients to confirm a set number of hours before the session. They confirm in one click from the email; if they don't, you're told and the time can be released and offered to the waitlist. Approvals let you read each request before accepting it, with a short AI summary of who is asking.",
          `Moving over takes a minute: paste a Calendly personal access token into Settings → Import from Calendly, and your event types and weekly hours come across. ${n} is free for one person; Pro is $12 a month, and Team is $69 a month for up to 10 people.`,
        ],
      },
      {
        heading: "Acuity Scheduling: when you take payment at booking",
        paragraphs: [
          "If you sell appointments rather than meetings, Acuity is the stronger tool: deposits, packages, gift certificates, intake forms and client history. It starts at $16 a month on yearly billing, with SMS reminders from the Growing plan. There's no free plan.",
        ],
      },
      {
        heading: "zcal and TidyCal: if price is the reason",
        paragraphs: [
          "zcal's free plan includes unlimited links, polls and automatic video links, which covers most solo use. TidyCal swaps the subscription for a one-time $29 payment, with a free plan limited to one calendar. Both are good value; neither does much once a booking is made.",
        ],
      },
      {
        heading: "HubSpot Meetings, SavvyCal and Microsoft Bookings",
        paragraphs: [
          "HubSpot Meetings is free with HubSpot's CRM and logs every meeting to the contact, which sales teams already in HubSpot will value more than any scheduling feature. SavvyCal is a thoughtful alternative for people who want the booking experience to feel personal. Microsoft Bookings makes sense when everyone already pays for Microsoft 365 and lives in Teams.",
        ],
      },
      {
        heading: "How to switch from Calendly without losing bookings",
        bullets: [
          "Recreate your event types first (or import them), and match lengths, buffers and questions.",
          "Connect the same calendars so existing Calendly bookings still block time.",
          "Leave your Calendly link live until its last booking has happened; send new clients the new link.",
          "Update the link everywhere it lives: email signature, website, social bios, email templates and invoices.",
          "Book a test meeting from a private window and check the confirmation, calendar event and reminder.",
        ],
      },
    ],
    faq: [
      { q: "What is the best free alternative to Calendly?", a: `Cal.com and zcal have the most generous free plans. ${n} is free for one person with unlimited services and is the better fit if cancellations and no-shows are your problem.` },
      { q: "Is there a Calendly alternative without per-seat pricing?", a: `Yes. ${n} Team is $69 a month for up to 10 people in total. TidyCal also avoids subscriptions with a one-time payment.` },
      { q: "Can I import my Calendly event types?", a: `Cal.com and ${n} both import from Calendly. In ${n}, paste a Calendly personal access token into Settings → Import from Calendly.` },
      { q: "Does Calendly have a waitlist?", a: `Not built in. Filling a cancelled Calendly slot from a waitlist needs webhooks or another tool. ${n} Pro includes one.` },
    ],
    sources: [src.calendly, src.cal, src.acuity, src.zcal, src.tidycal, src.hubspot, src.savvycal, src.bookings],
  },
  {
    slug: "cal-com-alternatives",
    title: "Cal.com alternatives: 7 simpler options for 2027",
    description:
      "Cal.com is powerful and very configurable. If you want something simpler, cheaper for teams, or better at handling cancellations, here are the best Cal.com alternatives.",
    keyword: "Cal.com alternative",
    published: PUBLISHED,
    updated: PUBLISHED,
    answer: `Good Cal.com alternatives are Calendly (the most familiar, polished hosted option), ${n} (simpler, with a waitlist that refills cancellations and a flat $69 team price), Acuity Scheduling (paid appointments and intake), zcal (free, with polls) and SavvyCal (a nicer booking experience). Stay on Cal.com if you need self-hosting, an API, or routing forms.`,
    sections: [
      {
        heading: "Why look beyond Cal.com",
        paragraphs: [
          "Cal.com is one of the best scheduling tools available: open source, a generous free plan for one person, and almost every setting you could want. Most people who leave it aren't unhappy with what it can do. They're tired of configuring it.",
        ],
        bullets: [
          "Lots of settings: event types have many tabs, and apps are switched on one by one.",
          "Teams are per user: $12 per user a month on yearly billing, $16 monthly.",
          "Branding: removing Cal.com branding needs a paid team plan.",
          "Built for developers: the API, self-hosting and platform features are a strength, but not something a coach needs.",
        ],
      },
      {
        heading: "Cal.com alternatives at a glance",
        table: {
          head: ["Tool", "Best for", "Free plan", "Team pricing"],
          rows: [
            ["Cal.com (for reference)", "Flexibility, self-hosting, developers", "1 user, unlimited links", "$12/user/month (yearly)"],
            [n, "A link that works out of the box and protects your calendar", "1 person, unlimited services", "$69/month for up to 10 people"],
            ["Calendly", "The most recognised link, sales teams", "1 event type, 1 calendar", "$16/seat/month (yearly)"],
            ["Acuity Scheduling", "Appointments with payments and intake", "None", "Plans by number of calendars"],
            ["zcal", "Free scheduling with polls", "Unlimited links", "Pro per user"],
            ["SavvyCal", "The booker's experience", "None", "About $12/user"],
            ["Google Calendar", "One free booking page", "1 booking page", "With Google Workspace"],
          ],
        },
      },
      {
        heading: `${n}: the same scheduling core, with less to set up`,
        paragraphs: [
          `${n} keeps what you use every day (booking pages, calendar sync, booking questions, reminders, round robin for teams) and drops the configuration. A new account asks a few plain questions and sets up your services for you.`,
          "Where it goes further than Cal.com is after the booking. A waitlist for taken times refills cancellations automatically. Confirm-or-release asks clients to confirm and frees the time if they don't. Each booking request arrives with an AI summary, and an assistant can move or cancel bookings after you approve the change.",
          "Team is $69 a month for up to 10 people in total, which is cheaper than Cal.com Teams from the sixth person.",
        ],
      },
      {
        heading: "Calendly: the polished hosted option",
        paragraphs: [
          "If you want Cal.com's features without self-hosting decisions, Calendly is the obvious hosted alternative, with routing forms and deep integrations. Its free plan is much tighter than Cal.com's, and teams pay $16 per seat a month on yearly billing.",
        ],
      },
      {
        heading: "Acuity, zcal and SavvyCal",
        paragraphs: [
          "Acuity is better than Cal.com for businesses that sell appointments: packages, deposits, intake forms and client records. zcal is a simpler free tool with polls and automatic video links. SavvyCal focuses on making booking pleasant for the other person, with calendar overlay and ranked times.",
        ],
      },
      {
        heading: "When to stay on Cal.com",
        bullets: [
          "You need to self-host for data control.",
          "You're building scheduling into your own product with its API or platform.",
          "You rely on routing forms, organisations, SSO or SCIM.",
          "You take payment at booking through Stripe or PayPal on the free plan.",
        ],
      },
    ],
    faq: [
      { q: "Is Cal.com free?", a: "Yes, for one person. The free Individuals plan includes unlimited booking links and calendar connections. Team features start at $12 per user a month on yearly billing." },
      { q: "What is a simpler alternative to Cal.com?", a: `${n} covers the everyday scheduling with far fewer settings, and adds a waitlist and no-show protection on Pro.` },
      { q: "Which Cal.com alternative is cheapest for a team?", a: `${n} Team is $69 a month for up to 10 people. Cal.com Teams is $12 per user a month on yearly billing, so it's cheaper up to five people and more expensive after that.` },
    ],
    sources: [src.cal, src.calendly, src.acuity, src.zcal, src.savvycal, src.google],
  },
  {
    slug: "how-to-get-more-leads",
    title: "How to get more leads as a coach, consultant or service business",
    description:
      "Practical ways to get more leads for a service business in 2027: where leads come from, how to capture them, and how to turn them into booked calls instead of lost emails.",
    keyword: "how to get more leads",
    published: PUBLISHED,
    updated: PUBLISHED,
    answer: "To get more leads, make one clear offer, put a way to book a call everywhere people already find you (your website, profiles, email signature and content), answer new enquiries within minutes rather than hours, and follow up with the people who showed interest but didn't book. Most service businesses lose more leads to slow replies and missing booking links than to a lack of traffic.",
    sections: [
      {
        heading: "Start with where leads leak, not where they come from",
        paragraphs: [
          "Before chasing more traffic, look at what happens to the interest you already get. In most small service businesses, leads are lost in three places: someone visits but there's no obvious next step, someone enquires and waits a day for a reply, or someone books and then cancels and is never heard from again.",
          "Response time alone is a big leak. When Workato sent demo requests to 114 B2B companies, none called back within five minutes and only 42% responded within the hour. An older Harvard Business Review analysis of over a million leads found that companies contacting a lead within an hour were far more likely to qualify them than those that waited longer.",
        ],
      },
      {
        heading: "1. Make one offer that's easy to say yes to",
        paragraphs: [
          "People book calls for a specific outcome, not for your services list. Pick one first step and name it plainly: a 20-minute fit call, a free website review, a first session at a reduced price. It should be short, low-risk and obviously useful.",
        ],
      },
      {
        heading: "2. Put a booking link everywhere you're found",
        bullets: [
          "Your website: in the header, at the end of every page and on the contact page. Embedding the booking page converts better than a contact form.",
          "Your profiles: Instagram, LinkedIn, TikTok and Google Business Profile all have a link field.",
          "Your email signature and every reply to an enquiry.",
          "The end of every piece of content: posts, videos, newsletters and podcasts.",
        ],
      },
      {
        heading: "3. Create content that answers your clients' real questions",
        paragraphs: [
          "The questions clients ask on your intro calls are the content that attracts more of them. Write each one down and answer it properly in a post, a short video or a guide. Over time this brings in people who are already looking for what you do, and AI assistants like ChatGPT and Perplexity increasingly quote clear, specific answers.",
        ],
      },
      {
        heading: "4. Ask for referrals at the right moment",
        paragraphs: [
          "The best time to ask for a referral is right after a client gets a result, not at the end of the engagement. Make it specific (\"who else do you know who's trying to…\") and give them your booking link so the introduction turns into a call, not an email chain.",
        ],
      },
      {
        heading: "5. Answer fast, or let people book themselves",
        paragraphs: [
          "If you can't reply within minutes, let leads book a time on the spot. A booking link removes the back-and-forth entirely, and booking questions give you the context you'd otherwise ask for by email.",
          `If you want to vet people before they take your time, use approvals instead of a contact form: the person picks a time and answers your questions, and you accept or decline. In ${n}, each request also arrives with a short AI summary and a spam check, so a dozen requests take a minute to review.`,
        ],
      },
      {
        heading: "6. Don't let cancellations become lost leads",
        paragraphs: [
          `A cancelled intro call is still a warm lead. Offer a new time immediately, then follow up once more a few days later. ${n} sends a one-click rebooking email after a cancellation and, on Pro, a second one after three days. If your calendar is full, a waitlist turns \"no times available\" into a list of people waiting for one.`,
        ],
      },
      {
        heading: "Track the few numbers that matter",
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
      { q: "What is the fastest way to get more leads?", a: "Add a clear booking link to the places people already find you, and reply to every enquiry within minutes. Fixing leaks in what you already get is quicker than buying new traffic." },
      { q: "Are booking links better than contact forms?", a: "For most service businesses, yes. A contact form starts an email exchange; a booking link ends with a time on your calendar. Use booking questions or approvals if you need to qualify people first." },
      { q: "How do I stop leads from not showing up?", a: "Send reminders and ask people to confirm before the day. See our guide to reducing no-shows for the details." },
    ],
    sources: [src.leadResponse, src.hbr],
  },
  {
    slug: "how-to-get-clients-on-calls",
    title: "How to get more clients to book a call, and actually show up",
    description:
      "How to get clients on meetings: make booking effortless, qualify without friction, confirm before the day, and recover the calls that cancel. A practical guide for service businesses.",
    keyword: "how to get clients on meetings",
    published: PUBLISHED,
    updated: PUBLISHED,
    answer: "To get more clients on calls, make booking take under a minute, ask only the questions you really need, send a reminder and ask for confirmation the day before, and offer a new time the moment someone cancels. Each step removes a point where a ready client quietly drops out.",
    sections: [
      {
        heading: "Why booked calls don't turn into conversations",
        paragraphs: [
          "Getting someone to agree to a call is only half the job. Between \"yes\" and the call itself, people drop out at predictable points: the booking takes too long, the times don't suit them, they forget, or they cancel and nobody follows up.",
          "No-shows are common in every industry that runs on appointments. A study of ten outpatient clinics found an average no-show rate of about 19%, and reviews of reminder systems show that reminders help but don't solve it on their own.",
        ],
      },
      {
        heading: "Make booking take under a minute",
        bullets: [
          "Send a link, not a list of times. Clients pick what suits them in their own time zone.",
          "Show times soon. If your first free slot is two weeks out, add a short intro slot earlier in the week.",
          "Keep questions to the minimum you need to prepare. Two good questions beat eight.",
          "Don't make people create an account. They should book, reschedule and cancel from email.",
        ],
      },
      {
        heading: "Qualify without adding friction",
        paragraphs: [
          "If you get requests from people who aren't a fit, the answer isn't a longer form. It's an approval step: people pick a time and answer a couple of questions, and you accept or decline.",
          `${n} adds a short AI summary to each request (who is asking, what they want, whether it looks like a fit, and whether it's likely spam), so a full inbox of requests takes a minute to review.`,
        ],
      },
      {
        heading: "Confirm before the day, not just remind",
        paragraphs: [
          "A reminder tells someone a call is coming. A confirmation asks them to say they're still coming. The difference matters: it tells you who isn't, while there's still time to give the slot to someone else.",
          `With confirm-or-release in ${n}, clients get an email a set time before the session with a one-click confirm button. If they don't confirm by the deadline, you're told, and the time can be released automatically.`,
        ],
      },
      {
        heading: "Recover cancellations instead of losing them",
        bullets: [
          "Offer new times in the cancellation email itself, so rebooking is one click.",
          "Follow up once more a few days later; many cancellations are about timing, not interest.",
          "Keep a waitlist for your busiest times, so a cancelled slot goes to someone who wanted it.",
        ],
        paragraphs: [
          `${n} does all three: a one-click rebooking email after every cancellation, a second one after three days on Pro, and a waitlist that offers a freed time to the next person in line.`,
        ],
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
      { q: "How do I get clients to book a call with me?", a: "Give them one clear reason to talk (a short, specific first call), and a booking link they can use in under a minute, everywhere they find you." },
      { q: "How do I reduce no-shows for client calls?", a: "Send a reminder, ask for confirmation before the day, and make rescheduling easy so people move the call instead of skipping it." },
      { q: "Should I charge for the first call?", a: "Free short intro calls usually bring in more clients; a deposit or paid first session reduces no-shows. Many coaches offer a free 15-20 minute fit call and charge for everything after." },
    ],
    sources: [src.noShowStudy, src.reminderReview],
  },
];
