// All marketing copy lives here so it can be edited without touching layout code.
// Every claim on the site should match what the product actually does today.

export type Feature = {
  slug: string;
  name: string;
  /** Search phrase the page is written for (used in titles and the H1). */
  keyword: string;
  title: string;
  summary: string;
  problem: string;
  how: { title: string; body: string }[];
  plan: "Free" | "Pro" | "Team";
  faq: { q: string; a: string }[];
};

export const features: Feature[] = [
  {
    slug: "waitlist-scheduling",
    name: "Waitlist",
    keyword: "Booking waitlist for cancelled appointments",
    title: "A waitlist that refills cancelled slots on its own",
    summary:
      "When a time is taken, clients can join a waitlist for it. If the booking is cancelled, the first person in line gets an email with a link to claim the slot.",
    problem:
      "A cancellation usually means an empty hour. Most booking tools leave you to chase people by hand, or to wire up webhooks and spreadsheets to fake a waitlist.",
    how: [
      { title: "Clients join from your booking page", body: "On a day with taken times, your page shows a 'Join the waitlist' link. Clients pick the time they wanted and leave their name and email." },
      { title: "A cancellation triggers an offer", body: "The moment that booking is cancelled, the first person in line is emailed a private claim link." },
      { title: "First to claim gets the slot", body: "If they don't claim it in time, the offer moves to the next person automatically. You don't do anything." },
    ],
    plan: "Pro",
    faq: [
      { q: "Do I have to approve waitlist bookings?", a: "No. A claimed slot becomes a normal booking. If the service needs approval, the claim goes through the same approval as any other request." },
      { q: "How long does someone have to claim an offer?", a: "Two hours by default, and never past the start of the slot. After that the offer moves to the next person." },
      { q: "Can I see who is waiting?", a: "Yes. The Waitlist page in your dashboard lists everyone waiting and who has an open offer." },
    ],
  },
  {
    slug: "booking-approval",
    name: "Approvals",
    keyword: "Approve bookings before they are confirmed",
    title: "Approve every booking before it's on your calendar",
    summary:
      "Turn on approvals for any service. Requests land in your dashboard and you accept or decline each one. Free on every plan.",
    problem:
      "Some meetings shouldn't be booked instantly. You want to read who is asking and why before giving away your time.",
    how: [
      { title: "Clients send a request", body: "They pick a time and answer your questions. The time is held while you decide." },
      { title: "You review it in one place", body: "Requests sit in the Unconfirmed tab with everything the client told you." },
      { title: "Accept or decline", body: "Accepting confirms the booking and sends invites. Declining frees the time and lets the client know." },
    ],
    plan: "Free",
    faq: [
      { q: "Is this really free?", a: "Yes. Approvals and unlimited booking questions are part of the free plan." },
      { q: "Can I get help deciding?", a: "On Pro, every request gets a short AI summary of who is asking and what they want, so you can decide faster." },
    ],
  },
  {
    slug: "no-show-protection",
    name: "Confirm-or-release",
    keyword: "Reduce no-shows for appointments",
    title: "Ask clients to confirm, and free the time if they don't",
    summary:
      "Choose how many hours before a booking clients must confirm they're coming. They get an email with a one-click confirm link. If they don't confirm, you're told, and the time can be released automatically.",
    problem:
      "No-shows cost you the slot and the client who would have taken it. A reminder alone doesn't tell you who is actually coming.",
    how: [
      { title: "Set a confirmation window", body: "For example, confirm by 24 hours before the start." },
      { title: "Clients confirm in one click", body: "They get an email a day before the deadline with a confirm button. No login." },
      { title: "Missed? Release the time", body: "If the deadline passes, you get an alert. Turn on release and the booking is cancelled for you, which also offers the slot to your waitlist." },
    ],
    plan: "Pro",
    faq: [
      { q: "Does the client need an account?", a: "No. The link in the email is all they need." },
      { q: "Does this work with the waitlist?", a: "Yes. A released booking frees the slot, and the next person on the waitlist is offered it." },
    ],
  },
  {
    slug: "ai-booking-summaries",
    name: "AI request summaries",
    keyword: "AI summaries for booking requests",
    title: "Know who is asking before you accept",
    summary:
      "Every booking request gets a short summary of who the person is and what they want, written from their answers. It appears next to the request in your dashboard.",
    problem:
      "Long intake answers are slow to read when you have a dozen requests waiting.",
    how: [
      { title: "A request comes in", body: "The client answers your booking questions as usual." },
      { title: "Nodslot writes a summary", body: "Within a minute, a few lines appear: who they are, what they want, anything that needs your attention." },
      { title: "You decide faster", body: "Accept or decline straight from the request." },
    ],
    plan: "Pro",
    faq: [{ q: "Is the client told AI was used?", a: "The summary is only shown to you, inside your dashboard." }],
  },
  {
    slug: "team-scheduling",
    name: "Team scheduling",
    keyword: "Round robin scheduling for small teams",
    title: "One link for your whole team, at one flat price",
    summary:
      "Create a team, invite people by email or link, and share services that book whoever is free (round robin) or everyone together (collective). $49 a month covers up to 10 people.",
    problem:
      "Team plans elsewhere are priced per seat, so every new hire makes scheduling more expensive.",
    how: [
      { title: "Invite your team", body: "Send email invites or share an invite link. Owners and admins manage members and roles." },
      { title: "Pick how bookings are shared", body: "Round robin spreads bookings across hosts. Collective only offers times when every host is free." },
      { title: "Share one team page", body: "Your team gets its own page listing its services, with an option to let clients book members directly." },
    ],
    plan: "Team",
    faq: [
      { q: "Do invited members need to pay?", a: "No. The Team plan covers everyone in the team, up to 10 people." },
      { q: "Can a host always be included in round robin?", a: "Yes. Mark any host as 'always attends' and they join every booking while the others rotate." },
    ],
  },
];

export type Comparison = {
  slug: string;
  competitor: string;
  title: string;
  summary: string;
  rows: { label: string; us: string; them: string }[];
  verdict: string;
};

// Competitor facts are kept general and should be re-checked against their pricing pages before launch.
export const comparisons: Comparison[] = [
  {
    slug: "calendly-alternative",
    competitor: "Calendly",
    title: "A Calendly alternative with a built-in waitlist",
    summary:
      "Calendly is the best-known booking link. Nodslot covers the everyday scheduling you use it for, then adds the pieces Calendly users keep asking for: a real waitlist and a way to stop no-shows.",
    rows: [
      { label: "Free plan", us: "Unlimited services and calendars", them: "1 event type, 1 calendar, one-on-one only" },
      { label: "Waitlist that refills cancellations", us: "Built in (Pro)", them: "Not built in; needs webhooks or another tool" },
      { label: "Approve bookings before confirming", us: "Free", them: "Not built in" },
      { label: "Confirm-or-release for no-shows", us: "Built in (Pro)", them: "Reminders on paid plans" },
      { label: "Round robin for teams", us: "$49/month flat, up to 10 people", them: "Teams plan, $16 per seat/month" },
      { label: "Calendar sync, video links, reminders", us: "Yes", them: "Yes" },
    ],
    verdict:
      "If cancellations and no-shows are what cost you money, Nodslot was built for exactly that. You can import your Calendly services and hours in a minute.",
  },
  {
    slug: "cal-com-alternative",
    competitor: "Cal.com",
    title: "A Cal.com alternative for people who just want a link",
    summary:
      "Cal.com is powerful and very configurable. Nodslot keeps the scheduling core and drops the setup work, with a calm dashboard and features aimed at filling your calendar.",
    rows: [
      { label: "Approvals and unlimited questions", us: "Free", them: "Free" },
      { label: "Waitlist for taken times", us: "Built in (Pro)", them: "Not built in" },
      { label: "Confirm-or-release", us: "Built in (Pro)", them: "Not built in" },
      { label: "AI summaries of booking requests", us: "Built in (Pro)", them: "Not built in" },
      { label: "Round robin for teams", us: "$49/month flat, up to 10 people", them: "Teams plan, $12 per user/month" },
    ],
    verdict:
      "Choose Nodslot if you want a booking link that works out of the box and actively protects your time.",
  },
];

export type Audience = {
  slug: string;
  name: string;
  plural: string;
  title: string;
  summary: string;
  pains: string[];
  /** Feature slugs to highlight, in order. */
  highlights: string[];
  example: string;
};

export const audiences: Audience[] = [
  {
    slug: "therapists",
    name: "Therapist",
    plural: "therapists",
    title: "Online booking for therapists that respects your time",
    summary: "Screen new clients before the first session, and keep your week full when sessions are cancelled.",
    pains: ["Late cancellations leave gaps you can't fill", "New client requests need a quick screen first", "No-shows on recurring sessions"],
    highlights: ["booking-approval", "waitlist-scheduling", "no-show-protection"],
    example: "A new client requests an intake call and answers three questions. You read the summary, accept, and the session is on both calendars.",
  },
  {
    slug: "coaches",
    name: "Coach",
    plural: "coaches",
    title: "A booking link for coaches who sell their time",
    summary: "Let clients book discovery calls and sessions without the back-and-forth, and stop losing paid hours to no-shows.",
    pains: ["Discovery calls from people who aren't a fit", "Clients who forget sessions", "Popular times always taken"],
    highlights: ["ai-booking-summaries", "no-show-protection", "waitlist-scheduling"],
    example: "Your Thursday evening slots are full. Two clients join the waitlist. One cancellation later, the first of them books it without you lifting a finger.",
  },
  {
    slug: "consultants",
    name: "Consultant",
    plural: "consultants",
    title: "Scheduling for consultants: approve first, then book",
    summary: "Read every request before it reaches your calendar, and keep prospects from booking calls you don't want.",
    pains: ["Prospects booking calls without context", "Back-to-back meetings with no buffer", "Time zones with international clients"],
    highlights: ["booking-approval", "ai-booking-summaries", "team-scheduling"],
    example: "A prospect in another time zone requests a call. Nodslot shows them your hours in their time, and you approve it after a ten-second read.",
  },
  {
    slug: "salons-and-studios",
    name: "Salon or studio",
    plural: "salons and studios",
    title: "Appointment booking for salons and studios with a waitlist",
    summary: "Fill last-minute cancellations from a waitlist and share one link for your whole team.",
    pains: ["Same-day cancellations", "Clients asking for times that are already taken", "Sharing bookings across stylists or instructors"],
    highlights: ["waitlist-scheduling", "team-scheduling", "no-show-protection"],
    example: "Saturday morning is fully booked. A cancellation comes in at 8pm Friday, and the slot is claimed from the waitlist before you've seen the email.",
  },
  {
    slug: "tutors",
    name: "Tutor",
    plural: "tutors",
    title: "Lesson booking for tutors: no more chasing confirmations",
    summary: "Students confirm they're coming, popular slots have a waitlist, and parents book without messaging you.",
    pains: ["Lessons forgotten by students", "After-school times always full", "Rescheduling by text message"],
    highlights: ["no-show-protection", "waitlist-scheduling", "booking-approval"],
    example: "A student hasn't confirmed tomorrow's lesson by the deadline. You get a heads-up, the slot is released, and a waiting student takes it.",
  },
  {
    slug: "agencies",
    name: "Agency",
    plural: "agencies",
    title: "Team scheduling for small agencies, one flat price",
    summary: "Route client calls across your team with round robin, or book everyone together for kick-offs.",
    pains: ["Per-seat pricing as the team grows", "Client calls landing on the wrong person", "Finding a time when the whole team is free"],
    highlights: ["team-scheduling", "booking-approval", "ai-booking-summaries"],
    example: "A new lead books a discovery call on your team page. Round robin gives it to whoever is free, and the AI summary tells them what the lead needs.",
  },
];

export const pricing = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    blurb: "Everything you need for a professional booking link.",
    cta: "Get started",
    items: [
      "Unlimited services and bookings",
      "Google, Outlook and Apple calendar sync",
      "Google Meet, Zoom and built-in video",
      "Approvals and unlimited booking questions",
      "One reminder email per booking",
      "Embed on your website",
    ],
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month",
    blurb: "Protect your calendar from gaps and no-shows.",
    cta: "Start with Pro",
    highlight: true,
    items: [
      "Everything in Free",
      "Waitlist that refills cancelled slots",
      "Confirm-or-release for no-shows",
      "AI summaries of booking requests",
      "Multiple reminder emails",
      "Your own domain and no Nodslot badge",
    ],
  },
  {
    name: "Team",
    price: "$49",
    period: "per month",
    blurb: "One flat price for up to 10 people.",
    cta: "Start a team",
    items: [
      "Everything in Pro",
      "Round robin and collective services",
      "Invite by email or link, with roles",
      "A shared team booking page",
      "No per-seat pricing",
    ],
  },
];

export const homeFaq = [
  {
    q: "What is Nodslot?",
    a: "Nodslot is an online booking link. Clients pick a time that suits them, it lands in your calendar, and Nodslot handles what comes after: refilling cancelled slots from a waitlist, asking clients to confirm so you get fewer no-shows, and summarising booking requests you approve.",
  },
  {
    q: "How is Nodslot different from Calendly or Cal.com?",
    a: "All three get you booked. Nodslot also keeps you booked: a cancelled slot is offered to the next person on the waitlist automatically, and unconfirmed bookings can free themselves up. The free plan includes unlimited services, and Team is one flat price instead of a price per seat.",
  },
  {
    q: "Is the free plan really free?",
    a: "Yes. No trial and no card. One person gets unlimited services and bookings, calendar sync, video links, approvals and booking questions, for as long as you like.",
  },
  {
    q: "How does the waitlist fill a cancelled slot?",
    a: "When a time is taken, clients can join its waitlist. If that booking is cancelled, the first person gets a private link to claim the time. If they don't claim it within two hours, it's offered to the next person, so the slot never waits on one inbox.",
  },
  {
    q: "What happens if a client doesn't confirm?",
    a: "Turn on confirmation for a service and pick a deadline. Clients confirm with one click from their reminder. If they haven't by the deadline, you're told, and you can let the time be released automatically so someone else can book it.",
  },
  {
    q: "Can I move over from Calendly?",
    a: "Yes. Paste a Calendly personal access token into Settings → Import from Calendly. Your services and weekly hours come across in about a minute, and you can check everything before sharing your new link.",
  },
  {
    q: "Which calendars and video apps work with Nodslot?",
    a: "Google Calendar, Outlook and Microsoft 365, Apple iCloud and any CalDAV calendar are checked for conflicts and get new bookings. Bookings can include a Google Meet, Zoom, Microsoft Teams or built-in video link. Zapier, Make and webhooks connect everything else.",
  },
  {
    q: "Do my clients need an account?",
    a: "No. Clients book, confirm, reschedule, cancel and claim waitlist slots from links in their emails, without signing up.",
  },
  {
    q: "How does team pricing work?",
    a: "Team is $49 a month for up to 10 people, not a price per seat. It adds round robin and collective services, managed services that copy one setup to every member, a shared team page and a team waitlist.",
  },
  {
    q: "Can I cancel any time?",
    a: "Yes. You keep your paid plan until the end of the period you paid for, then move back to Free with your services and bookings intact.",
  },
];
