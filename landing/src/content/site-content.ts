import { site } from "@/site.config";
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
      { q: "Can a client wait for any time that day?", a: "Yes. Clients can wait for one specific time, any time that day, or anything earlier than the booking they already have." },
      { q: "Does the waitlist work for team services?", a: "Yes. On the Team plan, a freed time on any host can go to the next person waiting for that service." },
      { q: "Which plan includes the waitlist?", a: "Pro ($12 a month) and Team. The 14-day Pro trial includes it, no card needed." },
      { q: "Do clients need an account to join?", a: "No. They leave their name and email on your booking page and claim the time from the email." },
    ],
  },
  {
    slug: "booking-approval",
    name: "Approvals",
    keyword: "Approve bookings before they are confirmed",
    title: "Approve every booking before it's on your calendar",
    summary:
      "Turn on approvals for any service. Requests land in your dashboard with a short AI summary, and you accept or decline each one.",
    problem:
      "Some meetings shouldn't be booked instantly. You want to read who is asking and why before giving away your time.",
    how: [
      { title: "Clients send a request", body: "They pick a time and answer your questions. The time is held while you decide." },
      { title: "You review it in one place", body: "Requests sit in the Unconfirmed tab with everything the client told you." },
      { title: "Accept or decline", body: "Accepting confirms the booking and sends invites. Declining frees the time and lets the client know." },
    ],
    plan: "Pro",
    faq: [
      { q: "Which plan includes approvals?", a: "Approvals are part of Pro ($12 a month) and Team. The 14-day Pro trial includes them, no card needed." },
      { q: "What happens to the time while I decide?", a: "It's held for the client, so nobody else can book it while the request is waiting." },
      { q: "Is the client told when I accept or decline?", a: "Yes. Accepting confirms the booking and sends the calendar invite; declining frees the time and lets the client know." },
      { q: "Do I get help deciding?", a: "Every request gets a short AI summary of who is asking and what they want, whether they look like a fit, and whether it looks like spam." },
      { q: "Can I approve only some services?", a: "Yes. Approvals are switched on per service, so an intro call can book instantly while a full session waits for you." },
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
      { q: "When does the client get asked to confirm?", a: "You choose the deadline, for example 24 hours before the start. The confirm email goes out ahead of that deadline with a one-click button." },
      { q: "Do I have to release unconfirmed bookings?", a: "No. Release is optional. Without it you're simply told who hasn't confirmed, and you decide what to do." },
      { q: "Is this better than a reminder?", a: "A reminder tells a client the session is coming. A confirmation tells you whether they're actually coming, while there's still time to fill the slot." },
      { q: "Which plan includes it?", a: "Pro ($12 a month) and Team." },
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
      { title: `${site.name} writes a summary`, body: "Within a minute, a few lines appear: who they are, what they want, anything that needs your attention." },
      { title: "You decide faster", body: "Accept or decline straight from the request." },
    ],
    plan: "Pro",
    faq: [
      { q: "What does the summary include?", a: "A sentence or two on who is asking and what they want, a fit rating (good, unclear or poor), a spam check, and a short reply you can send." },
      { q: "Which bookings get a summary?", a: "Requests waiting for your approval, so you can decide faster. They appear next to the request in your dashboard." },
      { q: "Can I reply to the client from there?", a: "Yes. Edit the suggested reply if you like and send it straight from the request." },
      { q: "Is the client told AI was used?", a: "The summary is only shown to you, inside your dashboard." },
      { q: "Which plan includes it?", a: "Pro ($12 a month) and Team, together with approvals." },
    ],
  },
  {
    slug: "team-scheduling",
    name: "Team scheduling",
    keyword: "Round robin scheduling for small teams",
    title: "One link for your whole team, at one simple price",
    summary:
      "Create a team, invite people by email or link, and share services that book whoever is free (round robin) or everyone together (collective). $69 a month covers up to 10 people; each extra person is $10.",
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
      { q: "What's the difference between round robin and collective?", a: "Round robin books one host who is free, spreading bookings across the team. Collective only offers times when every host is free, for meetings everyone attends." },
      { q: "Can clients book a specific person?", a: "Yes. The team page can list members so clients book them directly, or you can hide that and only show team services." },
      { q: "Can I set a service up once for everyone?", a: "Yes. Managed services copy one setup to every member, and you choose which settings members can change." },
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
      `Calendly is the best-known booking link. ${site.name} covers the everyday scheduling you use it for, then adds the pieces Calendly users keep asking for: a real waitlist and a way to stop no-shows.`,
    rows: [
      { label: "Free plan", us: "Unlimited services and calendars", them: "1 event type, 1 calendar, one-on-one only" },
      { label: "Waitlist that refills cancellations", us: "Built in (Pro)", them: "Not built in; needs webhooks or another tool" },
      { label: "Approve bookings before confirming", us: "Built in (Pro)", them: "Not built in" },
      { label: "Confirm-or-release for no-shows", us: "Built in (Pro)", them: "Reminders on paid plans" },
      { label: "Round robin for teams", us: "$69/month for up to 10 people", them: "Teams plan, $16 per seat/month" },
      { label: "Calendar sync, video links, reminders", us: "Yes", them: "Yes" },
    ],
    verdict:
      `If cancellations and no-shows are what cost you money, ${site.name} was built for exactly that. You can import your Calendly services and hours in a minute.`,
  },
  {
    slug: "cal-com-alternative",
    competitor: "Cal.com",
    title: "A Cal.com alternative for people who just want a link",
    summary:
      `Cal.com is powerful and very configurable. ${site.name} keeps the scheduling core and drops the setup work, with a calm dashboard and features aimed at filling your calendar.`,
    rows: [
      { label: "Unlimited booking questions", us: "Free", them: "Free" },
      { label: "Approvals with an AI summary of each request", us: "Built in (Pro)", them: "Approvals only" },
      { label: "Waitlist for taken times", us: "Built in (Pro)", them: "Not built in" },
      { label: "Confirm-or-release", us: "Built in (Pro)", them: "Not built in" },
      { label: "AI summaries of booking requests", us: "Built in (Pro)", them: "Not built in" },
      { label: "Round robin for teams", us: "$69/month for up to 10 people", them: "Teams plan, $12 per user/month" },
    ],
    verdict:
      `Choose ${site.name} if you want a booking link that works out of the box and actively protects your time.`,
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
  /** Services to set up first, with typical lengths for this job. */
  services?: { name: string; length: string; note: string }[];
  faq?: { q: string; a: string }[];
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
    example: `A prospect in another time zone requests a call. ${site.name} shows them your hours in their time, and you approve it after a ten-second read.`,
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
    title: "Team scheduling for small agencies, one simple price",
    summary: "Route client calls across your team with round robin, or book everyone together for kick-offs.",
    pains: ["Per-seat pricing as the team grows", "Client calls landing on the wrong person", "Finding a time when the whole team is free"],
    highlights: ["team-scheduling", "booking-approval", "ai-booking-summaries"],
    example: "A new lead books a discovery call on your team page. Round robin gives it to whoever is free, and the AI summary tells them what the lead needs.",
  },
  {
    slug: "personal-trainers",
    name: "Personal trainer",
    plural: "personal trainers",
    title: "Booking software for personal trainers that keeps your sessions full",
    summary: "Clients book sessions around your gym hours, late cancellations get refilled from a waitlist, and everyone confirms before an early start.",
    pains: ["Early-morning sessions that clients skip", "Last-minute cancellations on your busiest slots", "Juggling sessions across gyms, parks and video calls"],
    highlights: ["waitlist-scheduling", "no-show-protection", "team-scheduling"],
    example: "A client cancels Thursday's 7am at 9pm the night before. The next person on your waitlist gets the offer, claims it before bed, and your morning stays full.",
    services: [
      { name: "Free consultation", length: "20 min", note: "Goals and a quick movement check; books instantly." },
      { name: "1:1 session", length: "45 or 60 min", note: "Ask clients to confirm 12 hours before early starts." },
      { name: "Online check-in", length: "15 min", note: "With a Google Meet link for remote clients." },
    ],
    faq: [
      { q: "Can clients book recurring weekly sessions?", a: "Yes. A service can let clients book a repeating series, like every Tuesday at 7am for eight weeks." },
      { q: "Can I block the hours I'm at the gym floor?", a: "Yes. Set your working hours per day, add a break, and switch off days you don't take sessions." },
    ],
  },
  {
    slug: "photographers",
    name: "Photographer",
    plural: "photographers",
    title: "Booking software for photographers: consultations, shoots and mini sessions",
    summary: "Let clients pick a consultation or shoot slot, read what they want before you accept, and fill cancelled mini-session slots from a waitlist.",
    pains: ["Enquiries that turn out not to fit your style or budget", "Popular mini-session days that sell out, then lose a slot to a cancellation", "Travel time between shoots"],
    highlights: ["booking-approval", "ai-booking-summaries", "waitlist-scheduling"],
    example: "Your autumn mini-session day sells out. Two slots cancel the week before, and both are claimed from the waitlist within an hour, without a single message from you.",
    services: [
      { name: "Discovery call", length: "20 min", note: "Ask about the occasion, location and budget; use approvals." },
      { name: "Portrait session", length: "60–90 min", note: "Add a buffer after for travel and backing up cards." },
      { name: "Mini session", length: "20 min", note: "Turn on the waitlist so cancelled slots refill." },
    ],
    faq: [
      { q: "Can I add travel time between shoots?", a: "Yes. Add a buffer before and after any service so back-to-back bookings leave you time to travel." },
      { q: "Can I screen enquiries before booking?", a: "Yes. With approvals, each request waits for you with a short AI summary of what the client wants." },
    ],
  },
  {
    slug: "lawyers",
    name: "Lawyer",
    plural: "lawyers",
    title: "Client booking for lawyers: consultations you can screen first",
    summary: "Prospective clients request a consultation and answer your intake questions; you check the matter and conflicts before accepting.",
    pains: ["Consultation requests outside your practice area", "Time lost to calls that should have been declined", "Clients who don't show for paid consultations"],
    highlights: ["booking-approval", "ai-booking-summaries", "no-show-protection"],
    example: "A prospect requests a 30-minute consultation about a lease dispute. The summary flags it as in scope, you accept, and they confirm the day before.",
    services: [
      { name: "Initial consultation", length: "30 min", note: "Use approvals and ask for the matter type and the other party's name." },
      { name: "Follow-up meeting", length: "45–60 min", note: "For existing clients; books instantly." },
    ],
    faq: [
      { q: "Can I check for conflicts before accepting?", a: "Yes. Ask for the other party's name as a booking question and use approvals, so nothing is confirmed until you accept." },
      { q: "Should I store sensitive case details in booking questions?", a: "Keep booking questions to what you need to decide whether to accept. Collect confidential details through your usual secure channels." },
    ],
  },
  {
    slug: "financial-advisors",
    name: "Financial advisor",
    plural: "financial advisors",
    title: "Scheduling for financial advisors: reviews, discovery calls and a team page",
    summary: "Prospects book discovery calls, existing clients book annual reviews, and a team page shares bookings across your advisors.",
    pains: ["Discovery calls with prospects who aren't a fit", "Annual reviews that slip because clients forget to book", "Sharing new enquiries fairly across advisors"],
    highlights: ["booking-approval", "team-scheduling", "no-show-protection"],
    example: "A new enquiry books through your firm's team page; round robin gives it to the advisor who's free, and the AI summary tells them what the prospect wants to discuss.",
    services: [
      { name: "Discovery call", length: "30 min", note: "Use approvals and ask about goals and investable assets." },
      { name: "Annual review", length: "60 min", note: "For existing clients; ask them to confirm the day before." },
    ],
    faq: [
      { q: "Can several advisors share one booking page?", a: "Yes. The Team plan covers up to 10 people for $69 a month, with round robin and a shared team page." },
    ],
  },
  {
    slug: "real-estate-agents",
    name: "Real estate agent",
    plural: "real estate agents",
    title: "Booking links for real estate agents: viewings, valuations and calls",
    summary: "Buyers book viewings in open slots, sellers book valuations, and cancelled viewings go to the next person waiting.",
    pains: ["Viewings that don't turn up", "Back-and-forth messages to find a viewing time", "Popular properties with more interest than slots"],
    highlights: ["waitlist-scheduling", "no-show-protection", "booking-approval"],
    example: "A property gets ten viewing requests for six Saturday slots. The other four join the waitlist, and when two viewings cancel, the slots are claimed within the hour.",
    services: [
      { name: "Property viewing", length: "20–30 min", note: "Turn on the waitlist for popular listings." },
      { name: "Valuation visit", length: "45 min", note: "Use approvals to check the address and timing." },
      { name: "Buyer call", length: "15 min", note: "Books instantly." },
    ],
    faq: [
      { q: "Can buyers join a waitlist for a full viewing day?", a: "Yes. They can wait for a specific time or any time that day, and get offered the slot if someone cancels." },
    ],
  },
  {
    slug: "music-teachers",
    name: "Music teacher",
    plural: "music teachers",
    title: "Lesson booking for music teachers: weekly lessons and trial lessons",
    summary: "Students book trial lessons and weekly slots, reschedule from their email, and cancelled lessons go to students waiting for a better time.",
    pains: ["Students who cancel the day of the lesson", "Parents messaging to swap lesson times", "Popular after-school slots that are always full"],
    highlights: ["waitlist-scheduling", "no-show-protection", "booking-approval"],
    example: "A student wants a 4pm Wednesday slot but it's taken, so they join the waitlist for 'anything earlier'. When the 4pm student cancels, the offer goes straight to them.",
    services: [
      { name: "Trial lesson", length: "30 min", note: "Books instantly; ask the instrument and level." },
      { name: "Weekly lesson", length: "30, 45 or 60 min", note: "Let students book a repeating series." },
    ],
    faq: [
      { q: "Can students book the same time every week?", a: "Yes. Turn on recurring bookings so a student can book a weekly series in one go." },
      { q: "Can parents reschedule without messaging me?", a: "Yes. Every confirmation email has a reschedule link that only shows your free times." },
    ],
  },
  {
    slug: "nutritionists",
    name: "Nutritionist",
    plural: "nutritionists and dietitians",
    title: "Booking software for nutritionists and dietitians",
    summary: "Clients book initial assessments and follow-ups, answer intake questions in advance, and confirm before each appointment.",
    pains: ["Follow-ups that clients forget", "Intake details collected at the start of the session instead of before", "Late cancellations on longer initial assessments"],
    highlights: ["no-show-protection", "waitlist-scheduling", "ai-booking-summaries"],
    example: "A new client books a 60-minute assessment and answers questions about goals and dietary needs, so you start the session prepared instead of filling in forms.",
    services: [
      { name: "Initial assessment", length: "60 min", note: "Ask about goals and dietary requirements as booking questions." },
      { name: "Follow-up", length: "30 min", note: "Ask clients to confirm the day before." },
    ],
    faq: [
      { q: "Should I collect medical history in booking questions?", a: "Ask only what you need to prepare. Keep detailed health information in your usual secure records." },
    ],
  },
  {
    slug: "recruiters",
    name: "Recruiter",
    plural: "recruiters",
    title: "Interview scheduling for recruiters and small hiring teams",
    summary: "Candidates book screening calls in open slots, interviews go to whichever interviewer is free, and everyone gets reminders.",
    pains: ["Days spent emailing candidates to find a time", "Interviewers' calendars that don't line up", "Candidates who don't show for screening calls"],
    highlights: ["team-scheduling", "no-show-protection", "booking-approval"],
    example: "You send one screening link to twenty candidates. They book across the week, confirm the day before, and the panel interview only offers times when all interviewers are free.",
    services: [
      { name: "Screening call", length: "15–20 min", note: "Books instantly; ask for the role and notice period." },
      { name: "Panel interview", length: "45–60 min", note: "A collective team service, so every interviewer is free." },
    ],
    faq: [
      { q: "Can an interview only show times when every interviewer is free?", a: "Yes. A collective team service only offers times when every host is free." },
    ],
  },
];

export const pricing = [
  {
    name: "Free",
    price: "$0",
    period: "Forever, for one person",
    blurb: "Everything you need for a professional booking link.",
    cta: "Get started",
    items: [
      "Unlimited services and bookings",
      "Google Calendar and Outlook sync",
      "Google Meet, Zoom and Microsoft Teams links",
      "Unlimited booking questions",
      "One reminder email per booking",
      "Embed booking on your website",
    ],
  },
  {
    name: "Pro",
    price: "$12",
    period: "Per month, for one person",
    blurb: "Protect your calendar from gaps and no-shows.",
    cta: "Start with Pro",
    highlight: true,
    items: [
      "Everything in Free",
      "Approve bookings before they're confirmed",
      "Waitlist that refills cancelled slots",
      "Confirm-or-release for no-shows",
      "AI summaries of booking requests",
      "Several reminder emails per booking",
      "A second rebooking email if a client cancels and doesn't come back",
      "Your own domain, like book.yourname.com",
      `No ${site.name} badge`,
    ],
  },
  {
    name: "Team",
    price: "$69",
    period: "Per month for up to 10 people, then $10 per extra person",
    blurb: "One link for the whole team, without paying per seat.",
    cta: "Start a team",
    items: [
      "Everything in Pro, for every member",
      "Round robin and collective services",
      "Managed services, set up once for everyone",
      "Team waitlist across every host",
      "Weekly coverage view of who's free",
      "A shared team booking page",
      "Invite by email or link, with roles",
    ],
  },
];

/** Plan-by-plan detail for the pricing page table: true, false, or a short value. */
export const pricingCompare: { group: string; rows: { label: string; values: [string | boolean, string | boolean, string | boolean] }[] }[] = [
  {
    group: "Booking",
    rows: [
      { label: "Services and bookings", values: ["Unlimited", "Unlimited", "Unlimited"] },
      { label: "Booking questions", values: ["Unlimited", "Unlimited", "Unlimited"] },
      { label: "Approve requests before booking", values: [false, true, true] },
      { label: "AI summary of each request", values: [false, true, true] },
      { label: "Embed on your website", values: [true, true, true] },
      { label: "Your own domain", values: [false, true, true] },
      { label: `Remove the ${site.name} badge`, values: [false, true, true] },
    ],
  },
  {
    group: "Calendars and video",
    rows: [
      { label: "Google Calendar and Outlook", values: [true, true, true] },
      { label: "Google Meet, Zoom and Microsoft Teams", values: [true, true, true] },
      { label: "Reminder emails per booking", values: ["One", "Several", "Several"] },
    ],
  },
  {
    group: "Keeping your calendar full",
    rows: [
      { label: "Waitlist for taken times", values: [false, true, true] },
      { label: "Confirm-or-release for no-shows", values: [false, true, true] },
      { label: "Rebooking emails after a client cancels", values: ["One", "Two", "Two"] },
      { label: "Team waitlist across every host", values: [false, false, true] },
    ],
  },
  {
    group: "Teams",
    rows: [
      { label: "People included", values: ["1", "1", "10, then $10 each"] },
      { label: "Round robin and collective services", values: [false, false, true] },
      { label: "Managed services", values: [false, false, true] },
      { label: "Weekly coverage view", values: [false, false, true] },
      { label: "Roles: owner, admin, member", values: [false, false, true] },
    ],
  },
];

export const homeFaq = [
  {
    q: `What is ${site.name}?`,
    a: `${site.name} is an online booking link. Clients pick a time that suits them, it lands in your calendar, and ${site.name} handles what comes after: refilling cancelled slots from a waitlist, asking clients to confirm so you get fewer no-shows, and summarising booking requests you approve.`,
  },
  {
    q: `How is ${site.name} different from Calendly or Cal.com?`,
    a: `All three get you booked. ${site.name} also keeps you booked: a cancelled slot is offered to the next person on the waitlist automatically, and unconfirmed bookings can free themselves up. The free plan includes unlimited services, and Team is $69 for up to 10 people instead of a price per seat.`,
  },
  {
    q: "Is the free plan really free?",
    a: "Yes. No trial and no card. One person gets unlimited services and bookings, calendar sync, video links and unlimited booking questions, for as long as you like.",
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
    q: `Which calendars and video apps work with ${site.name}?`,
    a: "Google Calendar and Outlook (Microsoft 365) are checked for conflicts and get new bookings. Bookings can include a Google Meet, Zoom or Microsoft Teams link. Zapier, Make and webhooks connect everything else.",
  },
  {
    q: "Do my clients need an account?",
    a: "No. Clients book, confirm, reschedule, cancel and claim waitlist slots from links in their emails, without signing up.",
  },
  {
    q: "How does team pricing work?",
    a: "Team is $69 a month for up to 10 people, then $10 a month for each extra person. It adds round robin and collective services, managed services that copy one setup to every member, a shared team page and a team waitlist.",
  },
  {
    q: "Can I cancel any time?",
    a: "Yes. You keep your paid plan until the end of the period you paid for, then move back to Free with your services and bookings intact.",
  },
];
