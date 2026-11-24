import { site } from "@/site.config";
import type { Article, Section, ToolReview } from "./articles";
import { tools } from "./guides-2027";

// "[Competitor] alternatives" posts, one per competitor, from the competitor-sitemap gap analysis (SEO-GAPS.md).
// Prices were checked on CHECKED against vendor pages or the listings named in each post's sources; where
// listings disagree, the post says so rather than picking a number.
const CHECKED = "November 24, 2026";
const PUBLISHED = "2026-11-24";
const n = site.name;

const more = {
  youcanbookme: {
    name: "YouCanBookMe",
    platforms: "Web",
    bestFor: "Simple booking pages with detailed form and email customisation",
    pros: ["Booking requests you accept or reject from the email", "Very customisable booking forms and emails", "Teams plan with shared calendars"],
    cons: ["Free plan is one booking page and one calendar, with branding", "Pricing steps up quickly for more calendars", "Dated look compared with newer tools"],
    pricing: "Free plan (1 booking page, 1 calendar). Individual about $9, Professional about $13 and Teams about $18 per user a month on monthly billing; annual and two-year plans are cheaper.",
    url: "https://youcanbook.me",
  },
  doodle: {
    name: "Doodle",
    platforms: "Web, iOS, Android",
    bestFor: "Group polls to find one time for many people",
    pros: ["Polls that participants answer without an account", "Booking pages and 1:1 links on paid plans", "Widely recognised for group scheduling"],
    cons: ["Free plan shows ads and is limited to one poll, one booking page and one 1:1", "Booking pages are basic compared with dedicated tools", "Pricing differs a lot between listings"],
    pricing: "Free plan with ads. Paid plans per seat; third-party listings range from about $7 to $15 per seat a month for Pro, so check Doodle's own page.",
    url: "https://doodle.com",
  },
  setmore: {
    name: "Setmore",
    platforms: "Web, iOS, Android",
    bestFor: "Small service businesses that want a free staff booking page",
    pros: ["Free plan for a few staff", "Staff calendars and a branded booking page", "Payments through Square and Stripe"],
    cons: ["Reminders by SMS and branding removal are on Pro", "Built more for salons and shops than client sessions", "No waitlist for cancelled times"],
    pricing: "Free plan for small teams. Pro is about $5 per user a month billed yearly, or about $12 monthly.",
    url: "https://www.setmore.com",
  },
  zoho: {
    name: "Zoho Bookings",
    platforms: "Web, iOS, Android",
    bestFor: "Businesses already using Zoho's CRM and apps",
    pros: ["Connects natively with Zoho CRM", "Workspaces for different teams or locations", "Payments and staff management"],
    cons: ["Priced per staff member", "Most useful only inside the Zoho suite", "Setup takes longer than a simple booking link"],
    pricing: "Free plan for a few users. Basic about $6 and Premium about $9 per user a month billed yearly (per third-party guides; Zoho's own page didn't show prices when checked).",
    url: "https://www.zoho.com/bookings/",
  },
  square: {
    name: "Square Appointments",
    platforms: "Web, iOS, Android",
    bestFor: "Salons and service shops that already take payments with Square",
    pros: ["Free plan for one location", "Payments, deposits and no-show fees with Square", "Waitlist on Plus and Premium"],
    cons: ["Paid plans priced per location", "Built around in-person services and Square hardware", "Card processing fees on top"],
    pricing: "Free for one location. Plus and Premium per location: recent listings show $49 and $149 a month in the US, older ones $29 and $69, so check Square's page.",
    url: "https://squareup.com/appointments",
  },
} satisfies Record<string, ToolReview>;

type AltSpec = {
  slug: string;
  competitor: ToolReview;
  /** Short name used in headings, e.g. "Acuity". */
  short: string;
  why: string[];
  /** Where the competitor is still the better choice. */
  stay: string[];
  alternatives: { heading: string; tool: ToolReview; body: string }[];
  table: string[][];
  faq: { q: string; a: string }[];
  sources: { label: string; url: string }[];
};

const calbeeBody = (short: string, extra: string) =>
  `${n} is a booking link for coaches, therapists and consultants that keeps your calendar full after people book. When a time is taken, clients can join a waitlist; if the booking is cancelled, the next person waiting is offered it automatically. Clients confirm before the day or the time is released, every request comes with an AI summary, and Team is $69 a month for up to 10 people. ${extra} Compared with ${short}, it's simpler to set up but doesn't take payments at booking.`;

function altArticle(spec: AltSpec): Article {
  const name = spec.competitor.name;
  const sections: Section[] = [
    { heading: `Why people look for a ${spec.short} alternative`, bullets: spec.why },
    { heading: `${name} alternatives at a glance`, table: { head: ["Tool", "Best for", "Free plan", "Paid from"], rows: spec.table } },
    { heading: `${name} for reference`, tool: spec.competitor, paragraphs: [`Here's what you'd be moving away from, so you can compare like for like.`] },
    ...spec.alternatives.map((a): Section => ({ heading: a.heading, tool: a.tool, paragraphs: [a.body] })),
    { heading: `When to stay on ${spec.short}`, bullets: spec.stay },
    {
      heading: `How to switch from ${spec.short}`,
      bullets: [
        "Recreate your services first, matching lengths, buffers and booking questions.",
        "Connect the same calendars, so existing bookings still block time.",
        `Keep your ${spec.short} link live until its last booking has happened; send new clients the new link.`,
        "Update the link everywhere it lives: website, email signature, social bios and templates.",
        "Book a test appointment from a private window and check the confirmation and reminder.",
      ],
    },
  ];
  return {
    slug: spec.slug,
    category: "Alternatives",
    title: `The best ${name} alternatives in 2027`,
    description: `Looking for a ${name} alternative? We compared the best options on free plans, pricing, reminders and what happens when clients cancel, and say when ${name} is still the right choice.`,
    keyword: `${name} alternative`,
    published: PUBLISHED,
    updated: PUBLISHED,
    answer: `The best ${name} alternatives are ${spec.alternatives.map((a) => a.tool.name).join(", ").replace(/, ([^,]*)$/, " and $1")}. ${spec.alternatives[0].tool.name === n ? `Pick ${n} if cancellations and no-shows cost you sessions.` : ""} Stay on ${name} if ${spec.stay[0].charAt(0).toLowerCase()}${spec.stay[0].slice(1).replace(/\.$/, "")}.`,
    sections,
    faq: spec.faq,
    sources: [...spec.sources, { label: `Prices checked ${CHECKED}`, url: spec.competitor.url }],
  };
}

const capterra = (label: string, url: string) => ({ label: `${label} (checked ${CHECKED})`, url });

export const alternativeGuides: Article[] = [
  altArticle({
    slug: "acuity-scheduling-alternatives",
    short: "Acuity",
    competitor: tools.acuity,
    why: ["There's no free plan: every option is paid from day one.", "Setup is heavy if you only need a booking link.", "SMS reminders need the Growing plan or higher."],
    stay: ["You take payment, deposits or packages at booking.", "You rely on detailed intake forms and client history.", "You run classes alongside appointments."],
    alternatives: [
      { heading: `Best Acuity alternative for one-to-one sessions: ${n}`, tool: tools.calbee, body: calbeeBody("Acuity", "There's a free plan for one person with unlimited services.") },
      { heading: "Best Acuity alternative with payments: Square Appointments", tool: more.square, body: "If payments at booking are why you use Acuity, Square Appointments covers them with a free plan for one location, though paid plans are priced per location." },
      { heading: "Best free Acuity alternative: Cal.com", tool: tools.cal, body: "Cal.com's free plan includes payments through Stripe and PayPal for one person, with unlimited booking links. Expect more settings to configure." },
      { heading: "Best simple Acuity alternative: Setmore", tool: more.setmore, body: "Setmore gives small teams a free branded booking page with staff calendars; SMS reminders and branding removal are on Pro." },
    ],
    table: [["Acuity (reference)", "Paid appointments, intake", "None", "$16/month (yearly)"], [n, "Client sessions, cancellations", "1 person, unlimited services", "$12/month"], ["Square Appointments", "Payments, in-person services", "1 location", "Per location"], ["Cal.com", "Most free features", "1 user", "$12/user/month (yearly)"], ["Setmore", "Small service teams", "A few staff", "About $5/user/month (yearly)"]],
    faq: [
      { q: "Is there a free alternative to Acuity Scheduling?", a: `Yes. ${n}, Cal.com, Setmore and Square Appointments all have free plans; Acuity doesn't.` },
      { q: "Which Acuity alternative takes payments?", a: "Square Appointments, Cal.com and Setmore can take payments at booking. Calbee doesn't yet." },
      { q: "Does Acuity have a waitlist?", a: `Yes, Acuity has a waitlist for appointments and classes. ${n} also has one, offering a cancelled time to one person at a time with a two-hour claim window.` },
    ],
    sources: [capterra("Acuity Scheduling pricing on Capterra", "https://www.capterra.com/p/191978/Acuity-Scheduling/pricing/")],
  }),
  altArticle({
    slug: "youcanbookme-alternatives",
    short: "YouCanBookMe",
    competitor: more.youcanbookme,
    why: ["The free plan is one booking page and one calendar, with YouCanBookMe branding.", "More calendars and booking pages mean stepping up a plan.", "Teams are priced per user.", "Nothing refills a cancelled slot for you."],
    stay: ["You need very detailed booking forms and email customisation.", "You like accepting or rejecting requests straight from the email."],
    alternatives: [
      { heading: `Best YouCanBookMe alternative for keeping your calendar full: ${n}`, tool: tools.calbee, body: calbeeBody("YouCanBookMe", "Approvals work like YouCanBookMe's booking requests, with an AI summary of each one.") },
      { heading: "Best free YouCanBookMe alternative: Cal.com", tool: tools.cal, body: "Cal.com gives one person unlimited booking links and calendars for free, and its 'requires confirmation' setting works like YouCanBookMe's requests." },
      { heading: "Best YouCanBookMe alternative with polls: zcal", tool: tools.zcal, body: "zcal is free with unlimited links and adds meeting polls, which YouCanBookMe doesn't do." },
      { heading: "Best known YouCanBookMe alternative: Calendly", tool: tools.calendly, body: "Calendly is the most recognised booking link, with routing and deep integrations on paid plans." },
    ],
    table: [["YouCanBookMe (reference)", "Custom forms and emails", "1 page, 1 calendar", "About $9/month"], [n, "Cancellations, no-shows, approvals", "1 person, unlimited services", "$12/month"], ["Cal.com", "Most free features", "1 user, unlimited links", "$12/user/month (yearly)"], ["zcal", "Free with polls", "Unlimited links", "Pro per user"], ["Calendly", "Recognised link", "1 event type", "$10/seat/month (yearly)"]],
    faq: [
      { q: "Is YouCanBookMe free?", a: "There's a free plan with one booking page and one calendar connection, and YouCanBookMe branding. More pages and calendars need a paid plan." },
      { q: "Which YouCanBookMe alternative lets me approve bookings?", a: `${n} (Pro, with an AI summary of each request) and Cal.com (free, 'requires confirmation').` },
      { q: "What's the cheapest YouCanBookMe alternative for a team?", a: `${n} Team is $69 a month for up to 10 people in total, instead of a price per user.` },
    ],
    sources: [capterra("YouCanBookMe pricing on Capterra", "https://www.capterra.com/p/163194/YouCanBookMe/pricing/"), { label: "Koalendar: YouCanBookMe pricing guide", url: "https://koalendar.com/blog/youcanbookme-pricing" }],
  }),
  altArticle({
    slug: "savvycal-alternatives",
    short: "SavvyCal",
    competitor: tools.savvycal,
    why: ["There's no standing free plan for taking bookings.", "It's priced per user.", "Fewer team and automation features than Calendly or Cal.com.", "Nothing refills a cancelled time for you."],
    stay: ["You care most about how booking feels for the person on the other end.", "You like ranked availability and letting bookers overlay their own calendar."],
    alternatives: [
      { heading: `Best SavvyCal alternative for client sessions: ${n}`, tool: tools.calbee, body: calbeeBody("SavvyCal", "It's free for one person.") },
      { heading: "Best free SavvyCal alternative: Cal.com", tool: tools.cal, body: "Cal.com's free plan covers what most solo users pay SavvyCal for, with unlimited links and calendars." },
      { heading: "Best SavvyCal alternative for teams: Calendly", tool: tools.calendly, body: "Calendly Teams adds routing forms and round robin for sales teams, at $16 per seat a month billed yearly." },
      { heading: "Best SavvyCal alternative with polls: zcal", tool: tools.zcal, body: "zcal is free and includes meeting polls, similar to SavvyCal's polling, without a subscription." },
    ],
    table: [["SavvyCal (reference)", "The booker's experience", "None for bookings", "About $12/user/month"], [n, "Cancellations, no-shows", "1 person, unlimited services", "$12/month"], ["Cal.com", "Most free features", "1 user, unlimited links", "$12/user/month (yearly)"], ["Calendly", "Sales teams", "1 event type", "$10/seat/month (yearly)"], ["zcal", "Free with polls", "Unlimited links", "Pro per user"]],
    faq: [
      { q: "Is SavvyCal free?", a: "SavvyCal doesn't have a standing free plan for taking bookings; paid plans start around $12 per user a month." },
      { q: "What is a free alternative to SavvyCal?", a: `Cal.com, zcal and ${n} all have free plans with unlimited booking types for one person.` },
    ],
    sources: [{ label: `SavvyCal pricing history on PricingSaaS (checked ${CHECKED})`, url: "https://pricingsaas.com/companies/savvycal" }],
  }),
  altArticle({
    slug: "tidycal-alternatives",
    short: "TidyCal",
    competitor: tools.tidycal,
    why: ["The free plan checks only one calendar.", "TidyCal branding stays on lifetime plans unless you also pay for Pro.", "Team features are light.", "Nothing refills a cancelled slot for you."],
    stay: ["You want to pay once and never think about a subscription.", "You only need the basics for one person."],
    alternatives: [
      { heading: `Best TidyCal alternative for a full calendar: ${n}`, tool: tools.calbee, body: calbeeBody("TidyCal", "Its free plan checks Google Calendar and Outlook.") },
      { heading: "Best free TidyCal alternative: Cal.com", tool: tools.cal, body: "Cal.com's free plan connects unlimited calendars, which fixes TidyCal's one-calendar limit, and includes payments." },
      { heading: "Best TidyCal alternative with polls: zcal", tool: tools.zcal, body: "zcal is free with unlimited links, several calendars and meeting polls." },
    ],
    table: [["TidyCal (reference)", "Paying once", "1 calendar", "$29 one-time"], [n, "Cancellations, no-shows", "1 person, Google + Outlook", "$12/month"], ["Cal.com", "Most free features", "Unlimited calendars", "$12/user/month (yearly)"], ["zcal", "Free with polls", "Several calendars", "Pro per user"]],
    faq: [
      { q: "Is TidyCal really a one-time payment?", a: "The Individual ($29) and Agency ($79) plans are one-time purchases. Removing TidyCal branding needs the separate Pro subscription." },
      { q: "What's a better free alternative to TidyCal?", a: "Cal.com checks unlimited calendars for free; Calbee checks Google Calendar and Outlook and adds no-show protection on Pro." },
    ],
    sources: [{ label: "TidyCal help center: TidyCal vs Calendly", url: "https://help.tidycal.com/article/714-tidycal-vs-calendly" }],
  }),
  altArticle({
    slug: "doodle-alternatives",
    short: "Doodle",
    competitor: more.doodle,
    why: ["The free plan shows ads to you and the people you invite.", "Free polls are limited, and so are free booking pages.", "Booking pages are basic if you take client sessions.", "Paid pricing is per seat."],
    stay: ["Your main job is finding one time for a group with a poll.", "Your participants already know Doodle."],
    alternatives: [
      { heading: "Best free Doodle alternative for polls: zcal", tool: tools.zcal, body: "zcal includes meeting polls and unlimited booking links on its free plan, without ads." },
      { heading: `Best Doodle alternative for client bookings: ${n}`, tool: tools.calbee, body: calbeeBody("Doodle", "It's built for one-to-one sessions rather than group polls.") },
      { heading: "Best Doodle alternative for teams: Calendly", tool: tools.calendly, body: "Calendly covers group and team scheduling with collective events and round robin on paid plans." },
      { heading: "Best Doodle alternative for the booker: SavvyCal", tool: tools.savvycal, body: "SavvyCal combines polls with booking links and lets participants overlay their own calendar." },
    ],
    table: [["Doodle (reference)", "Group polls", "1 poll, 1 booking page, ads", "Per seat"], ["zcal", "Free polls", "Unlimited links and polls", "Pro per user"], [n, "Client sessions", "1 person, unlimited services", "$12/month"], ["Calendly", "Teams", "1 event type", "$10/seat/month (yearly)"], ["SavvyCal", "Booker experience", "Polls only", "About $12/user/month"]],
    faq: [
      { q: "Is Doodle still free?", a: "There's a free plan, but it shows ads and limits you to one group poll, one booking page and one 1:1 link." },
      { q: "What's the best free alternative to Doodle polls?", a: "zcal includes meeting polls on its free plan, without ads." },
    ],
    sources: [{ label: "Rallly: Is Doodle still free? (October 2026)", url: "https://rallly.co/blog/is-doodle-still-free" }, capterra("Doodle pricing on Capterra", "https://capterra.com/p/142620/Doodle/pricing/")],
  }),
  altArticle({
    slug: "setmore-alternatives",
    short: "Setmore",
    competitor: more.setmore,
    why: ["SMS reminders and branding removal need Pro.", "It's built for salons and shops more than client sessions.", "Pro is priced per user.", "There's no waitlist for cancelled times."],
    stay: ["You run a small salon or shop with staff calendars.", "You take payments through Square or Stripe."],
    alternatives: [
      { heading: `Best Setmore alternative for client sessions: ${n}`, tool: tools.calbee, body: calbeeBody("Setmore", "It adds a waitlist and confirmations that Setmore doesn't have.") },
      { heading: "Best Setmore alternative with payments: Square Appointments", tool: more.square, body: "Square Appointments is free for one location and handles payments, deposits and no-show fees, with a waitlist on paid plans." },
      { heading: "Best Setmore alternative for appointment businesses: Acuity", tool: tools.acuity, body: "Acuity goes deeper on intake forms, packages and client history, with no free plan." },
    ],
    table: [["Setmore (reference)", "Small service teams", "A few staff", "About $5/user/month (yearly)"], [n, "Client sessions, cancellations", "1 person, unlimited services", "$12/month"], ["Square Appointments", "Payments, in-person", "1 location", "Per location"], ["Acuity", "Intake and packages", "None", "$16/month (yearly)"]],
    faq: [
      { q: "Is Setmore free?", a: "Yes, there's a free plan for a few staff. SMS reminders, branding removal and some calendar features need Pro." },
      { q: "Which Setmore alternative has a waitlist?", a: `${n}, Acuity and Square Appointments (Plus and Premium) all have waitlists.` },
    ],
    sources: [capterra("Setmore pricing on Capterra", "https://capterra.com/p/122035/SetMore/pricing/")],
  }),
  altArticle({
    slug: "zoho-bookings-alternatives",
    short: "Zoho Bookings",
    competitor: more.zoho,
    why: ["It's priced per staff member.", "It's most useful if you already run Zoho CRM.", "Setup takes longer than a simple booking link."],
    stay: ["Your business runs on Zoho CRM and other Zoho apps.", "You need separate workspaces for teams or locations."],
    alternatives: [
      { heading: `Best Zoho Bookings alternative for a small team: ${n}`, tool: tools.calbee, body: calbeeBody("Zoho Bookings", "Team is a flat $69 for up to 10 people instead of per staff member.") },
      { heading: "Best Zoho Bookings alternative for sales teams: Calendly", tool: tools.calendly, body: "Calendly Teams has routing forms and CRM integrations for sales teams outside the Zoho suite." },
      { heading: "Best free Zoho Bookings alternative: Cal.com", tool: tools.cal, body: "Cal.com is free for one person and connects to Salesforce and HubSpot as well as calendars." },
    ],
    table: [["Zoho Bookings (reference)", "Zoho CRM users", "A few users", "About $6/user/month (yearly)"], [n, "Small teams, flat price", "1 person, unlimited services", "$12/month; Team $69 for 10"], ["Calendly", "Sales teams", "1 event type", "$10/seat/month (yearly)"], ["Cal.com", "Most free features", "1 user", "$12/user/month (yearly)"]],
    faq: [
      { q: "Is Zoho Bookings free?", a: "There's a free plan for a few users; paid plans are priced per staff member." },
      { q: "Is Zoho Bookings worth it without Zoho CRM?", a: "Its biggest strength is the Zoho CRM connection. Without Zoho, a dedicated booking tool is usually simpler." },
    ],
    sources: [{ label: "Zoho Bookings plan comparison", url: "https://www.zoho.com/bookings/plan-comparison.html" }, { label: "Zeeg: Zoho Bookings pricing guide", url: "https://zeeg.me/en/blog/post/zoho-bookings-pricing-and-features" }],
  }),
  altArticle({
    slug: "square-appointments-alternatives",
    short: "Square Appointments",
    competitor: more.square,
    why: ["Paid plans are priced per location.", "It's built around in-person services and Square hardware.", "Card processing fees come on top of the plan."],
    stay: ["You already take payments with Square.", "You run an in-person salon, barber or spa with staff."],
    alternatives: [
      { heading: `Best Square Appointments alternative for online sessions: ${n}`, tool: tools.calbee, body: calbeeBody("Square Appointments", "It's built for one-to-one sessions, in person or online.") },
      { heading: "Best Square Appointments alternative for appointment businesses: Acuity", tool: tools.acuity, body: "Acuity handles payments, packages and intake forms without tying you to Square hardware." },
      { heading: "Best free Square Appointments alternative: Setmore", tool: more.setmore, body: "Setmore gives small service teams a free booking page and staff calendars, with payments through Square or Stripe." },
    ],
    table: [["Square Appointments (reference)", "In-person, Square payments", "1 location", "Per location"], [n, "Client sessions", "1 person, unlimited services", "$12/month"], ["Acuity", "Payments and intake", "None", "$16/month (yearly)"], ["Setmore", "Small service teams", "A few staff", "About $5/user/month (yearly)"]],
    faq: [
      { q: "Is Square Appointments free?", a: "Yes, for one location. Plus and Premium are priced per location and add features like the waitlist." },
      { q: "Does Square Appointments have a waitlist?", a: "Yes, on the Plus and Premium plans. Calbee's waitlist is part of Pro at $12 a month." },
    ],
    sources: [{ label: "Square Appointments pricing", url: "https://squareup.com/appointments/pricing" }, { label: "Square: waitlist with Square Appointments", url: "https://squareup.com/help/us/en/article/7923" }],
  }),
  altArticle({
    slug: "microsoft-bookings-alternatives",
    short: "Microsoft Bookings",
    competitor: tools.bookings,
    why: ["It isn't sold on its own, only with Microsoft 365.", "Setup and customisation are rigid.", "It feels built for internal teams more than client booking.", "Payments aren't built in."],
    stay: ["Your whole company runs on Microsoft 365 and Teams.", "IT needs to manage scheduling centrally."],
    alternatives: [
      { heading: `Best Microsoft Bookings alternative for client sessions: ${n}`, tool: tools.calbee, body: calbeeBody("Microsoft Bookings", "It syncs with Outlook, so it still fits a Microsoft calendar.") },
      { heading: "Best Microsoft Bookings alternative for teams: Calendly", tool: tools.calendly, body: "Calendly connects to Outlook and Microsoft 365 and is easier to customise for external clients." },
      { heading: "Best free Microsoft Bookings alternative: Cal.com", tool: tools.cal, body: "Cal.com is free for one person and connects to Outlook calendars, without a Microsoft 365 licence." },
    ],
    table: [["Microsoft Bookings (reference)", "Microsoft 365 companies", "Part of Microsoft 365", "Microsoft 365 Business Basic"], [n, "Client sessions with Outlook", "1 person, unlimited services", "$12/month"], ["Calendly", "Teams", "1 event type", "$10/seat/month (yearly)"], ["Cal.com", "Most free features", "1 user", "$12/user/month (yearly)"]],
    faq: [
      { q: "Can I use Microsoft Bookings without Microsoft 365?", a: "No. Bookings comes with Microsoft 365 business plans and isn't sold separately." },
      { q: "Which Microsoft Bookings alternative works with Outlook?", a: `${n}, Calendly and Cal.com all sync with Outlook calendars.` },
    ],
    sources: [capterra("Microsoft Bookings on Capterra", "https://capterra.com/p/176567/Bookings/")],
  }),
  altArticle({
    slug: "google-calendar-appointment-schedule-alternatives",
    short: "Google Calendar",
    competitor: tools.google,
    why: ["A personal account gets one booking page.", "Reminders and payments need a paid Google plan.", "There's very little customisation.", "Booking pages can only be created on a computer."],
    stay: ["You only ever offer one kind of meeting.", "You don't want another account."],
    alternatives: [
      { heading: `Best Google Calendar alternative for client sessions: ${n}`, tool: tools.calbee, body: calbeeBody("Google Calendar appointment schedules", "It works on top of your Google Calendar, with unlimited services free.") },
      { heading: "Best free Google Calendar alternative: Cal.com", tool: tools.cal, body: "Cal.com gives unlimited booking links and reminders free for one person, still checking your Google Calendar." },
      { heading: "Best Google Calendar alternative with polls: zcal", tool: tools.zcal, body: "zcal adds unlimited links and meeting polls for free." },
      { heading: "Best known Google Calendar alternative: Calendly", tool: tools.calendly, body: "Calendly is the most familiar booking link and connects to Google Calendar and Meet." },
    ],
    table: [["Google Calendar (reference)", "One kind of meeting", "1 booking page", "Workspace / Google One"], [n, "Client sessions", "1 person, unlimited services", "$12/month"], ["Cal.com", "Most free features", "Unlimited links", "$12/user/month (yearly)"], ["zcal", "Free with polls", "Unlimited links", "Pro per user"], ["Calendly", "Recognised link", "1 event type", "$10/seat/month (yearly)"]],
    faq: [
      { q: "Is Google Calendar's booking page free?", a: "Yes, a personal Google account gets one appointment schedule. Reminders, payments and more pages need Google Workspace or Google One." },
      { q: "Do these alternatives still use my Google Calendar?", a: "Yes. Calbee, Cal.com, zcal and Calendly all check your Google Calendar for conflicts and add bookings to it." },
    ],
    sources: [{ label: "Google Calendar Help: compare premium features for appointment schedules", url: "https://support.google.com/calendar/answer/16287038" }],
  }),
];
