import { site } from "@/site.config";
import type { Article } from "./articles";

// One post per money leak practitioners describe on Reddit (see MONEY-RESEARCH.md). Each answers the search people
// type when it happens to them, with advice that works with or without our product, and says plainly where we fit.
const PUBLISHED = "2026-11-25";
const n = site.name;

const r = {
  cancellations: { label: "r/therapists: “Cancellations” (a whole day of clients cancelling)", url: "https://www.reddit.com/r/therapists/comments/1gf7xqb/cancellations/" },
  salary: { label: "r/therapists: “After 2 no-shows and a cancellation…”", url: "https://www.reddit.com/r/therapists/comments/1oigmwa/omg_this_salary_are_you_kidding_me/" },
  callNoShows: { label: "r/therapists: “I don't want to call no-shows”", url: "https://www.reddit.com/r/therapists/comments/1ij53fz/i_dont_want_to_call_noshows/" },
  missing: { label: "r/therapists: “Letting clients miss their appointment”", url: "https://www.reddit.com/r/therapists/comments/1wtrx46/letting_clients_miss_their_appointment/" },
  tutorNoShow: { label: "r/Tutoring: what to say to a student who no-showed", url: "https://www.reddit.com/r/Tutoring/comments/1ubpf13/what_do_you_actually_say_to_a_student_who/" },
  excuses: { label: "r/hairstylist: client with excuses to dodge the cancellation fee", url: "https://www.reddit.com/r/hairstylist/comments/1fwnwno/client_uses_crazy_excuses_to_get_out_of_paying/" },
  slotAlert: { label: "r/Tutoring: a waitlist “slot alert” that filled a cancellation in 10 minutes", url: "https://www.reddit.com/r/Tutoring/comments/1uquu37/built_an_auto_fill_tool_for_my_partners_tutoring/" },
  coachingNoShows: { label: "r/lifecoaching: what coaches learned about cancellations and no-shows", url: "https://www.reddit.com/r/lifecoaching/comments/1tpvubn/what_i_learned_about_cancellationsnoshows_from/" },
  consultingNoShows: { label: "r/consulting: “Client No Shows”", url: "https://www.reddit.com/r/consulting/comments/1xcl6w4/client_no_shows/" },
  trainer: { label: "r/personaltraining: “I've been independent for 10 years…”", url: "https://www.reddit.com/r/personaltraining/comments/1sfwxj3/ive_been_independent_for_10_years_the_stuff_that/" },
  tutorAdmin: { label: "r/Tutoring: how tutors handle the admin side", url: "https://www.reddit.com/r/Tutoring/comments/1ssse9q/how_do_you_guys_handle_the_admin_side_of_tutoring/" },
  jmir: { label: "JMIR Formative Research (2025): no-shows cost a primary care network 3–14% of revenue", url: "https://formative.jmir.org/" },
};

export const moneyGuides: Article[] = [
  {
    slug: "clients-cancel-last-minute",
    category: "Grow your practice",
    title: "Clients cancel last minute? How to stop losing the whole day",
    description:
      "When three or four clients cancel the same morning, a full day turns into no income. Here's why it happens, what to do the same day, and how to set things up so a cancelled slot gets refilled.",
    keyword: "clients cancel last minute",
    published: PUBLISHED,
    updated: PUBLISHED,
    answer:
      "Last-minute cancellations cost you most when the freed time sits empty. Three things stop that: a waitlist that offers the time to someone else straight away, a confirmation the day before so cancellations come earlier, and a rebooking link for the person who cancelled. A clear notice period helps, but only if it is easy to follow.",
    sections: [
      {
        heading: "Why it hurts more than it looks",
        paragraphs: [
          "One cancellation is an annoyance. Four on the same morning is a day you prepared for and didn't get paid for. A therapist on Reddit described exactly that: a busy day, fully prepared, and every client cancelled. Another worked out that after two no-shows and a cancellation, the day paid $8.50 an hour.",
          "The real cost isn't the cancelled session. It's the time you can no longer sell, because nobody knows it's free.",
        ],
      },
      {
        heading: "What to do the same day",
        bullets: [
          "Post the free time where waiting clients will see it: a short message to people who asked for an earlier slot.",
          "Offer the person who cancelled two specific new times instead of “let me know when works”. Specific times get booked; open questions get ignored.",
          "Use the gap for work that would otherwise eat an evening: notes, admin, marketing.",
        ],
      },
      {
        heading: "Set it up so it refills itself",
        paragraphs: [
          "Keep a waitlist for your busiest times. When a slot frees up, the next person waiting should hear about it within minutes, not when you remember to check your messages. A tutor's partner built exactly this for her practice and said it filled a cancelled slot in about ten minutes.",
          "Ask clients to confirm the day before. Cancellations still happen, but they happen a day earlier, while there is still time to fill the slot.",
          "Give the person who cancelled a one-click way to rebook. Most people who cancel mean to come back; the ones who have to message you to find a new time often don't.",
        ],
      },
      {
        heading: `How ${n} handles it`,
        paragraphs: [
          `${n}'s waitlist offers a freed time to the next person in line by email, with a private link to claim it. If they don't claim it within two hours, it moves to the next person. Clients can confirm the day before in one click, and anyone who cancels is shown new times straight away and sent a rebooking email. The waitlist is free on one service; Pro turns it on for every service.`,
        ],
      },
    ],
    faq: [
      { q: "How much notice should I ask clients to give?", a: "24 hours is the most common for coaches, therapists and tutors; 48 hours suits longer or higher-priced sessions. Longer is only better if you can actually refill the time." },
      { q: "Should I charge for last-minute cancellations?", a: "Many practitioners do, but fees only work if you collect them consistently, usually from a card on file or a deposit. Refilling the slot keeps the income without the awkward conversation." },
      { q: "Why do cancellations come in waves?", a: "Practitioners report seasonal slumps: summer holidays, autumn illness and the run-up to the holidays. Plan for fewer bookings then, and keep the waitlist active." },
    ],
    sources: [r.cancellations, r.salary, r.slotAlert],
  },
  {
    slug: "client-no-show-what-to-do",
    category: "Grow your practice",
    title: "Client didn't show up? What to do in the first 15 minutes, and after",
    description:
      "Waiting in an empty room or Zoom is one of the most frustrating parts of running a practice. Here's how long to wait, whether to call, what to say afterwards and how to get fewer no-shows next time.",
    keyword: "client no show what to do",
    published: PUBLISHED,
    updated: PUBLISHED,
    answer:
      "Wait 10–15 minutes, send one short message, then use the time for something else. Afterwards, ask kindly what happened and restate your policy once. To get fewer no-shows, ask clients to confirm the day before: you find out early, and the hour can go to someone who will come.",
    sections: [
      {
        heading: "The first 15 minutes",
        bullets: [
          "Wait 10 to 15 minutes. Most practitioners use 15 as the cut-off.",
          "Send one message at the 5-minute mark: “I'm here and ready when you are.” If they're running late or forgot the link, this saves the session.",
          "Don't chase further. Several therapists on Reddit stopped calling no-shows: “They know when the appointment is.”",
        ],
      },
      {
        heading: "What to say afterwards",
        paragraphs: [
          "Lead with concern, then the boundary. Something like: “I missed you today and wanted to check you're okay. Just a reminder that I ask for 24 hours' notice to change a session. Shall we find a new time?”",
          "A tutor asked what to say when a student no-showed and then messaged the next day as if nothing happened. The best replies did both: check in, then name the policy once, calmly.",
        ],
      },
      {
        heading: "Why reminders alone aren't enough",
        paragraphs: [
          "A reminder tells the client the session exists. It doesn't tell you whether they're coming. A confirmation does: one click to say “yes, I'll be there”. Anyone who hasn't confirmed by the deadline is the person most likely to no-show, and you know a day early instead of fifteen minutes in.",
        ],
      },
      {
        heading: `How ${n} handles it`,
        paragraphs: [
          `${n}'s confirm-or-release asks clients to confirm a set number of hours before the session, from an email, with no login. If they don't, you're told, and you can let the time be released automatically to your waitlist. It's part of Pro, and the 14-day trial includes it.`,
        ],
      },
    ],
    faq: [
      { q: "How long should I wait for a client who hasn't shown up?", a: "Ten to fifteen minutes is standard. Tell clients your wait time when they book so it isn't a surprise." },
      { q: "Should I call clients who don't show up?", a: "It depends on your work. In private practice a quick call at the 2–5 minute mark sometimes saves the session. Many practitioners stop calling repeat no-shows and rely on confirmations instead." },
      { q: "Is a no-show the same as a late cancellation?", a: "Most policies treat them the same: the time can't be resold, so the same fee or consequence applies." },
    ],
    sources: [r.callNoShows, r.tutorNoShow, r.missing],
  },
  {
    slug: "enforce-cancellation-policy",
    category: "Grow your practice",
    title: "How to enforce a cancellation policy without the awkward conversation",
    description:
      "Most practitioners have a cancellation policy and almost never enforce it, especially with clients they like. Here's how to write one people respect and make it run without you having to be the bad guy.",
    keyword: "how to enforce a cancellation policy",
    published: PUBLISHED,
    updated: PUBLISHED,
    answer:
      "A cancellation policy works when it's written down, agreed at booking and applied the same way every time, so enforcing it isn't personal. Keep it short, show it before people book, and let your booking system apply it. Payment upfront or a card on file makes a fee collectable; without one, focus on refilling the slot instead.",
    sections: [
      {
        heading: "Why policies don't get enforced",
        paragraphs: [
          "“I've got a cancellation policy in theory but I've honestly never enforced it with a student I actually like.” That tutor isn't alone: therapists say they waive fees more often than they charge them. And some clients learn to dodge them: one stylist's client cancelled 15 minutes before every Friday appointment with a new emergency each time.",
          "The problem is that enforcing feels like a personal judgement. It shouldn't be.",
        ],
      },
      {
        heading: "Write a policy people respect",
        bullets: [
          "One notice period (for example, 24 hours), in plain words.",
          "What happens if they miss it: the fee, or that the session counts as used.",
          "One grace: many practitioners waive the first time, then apply the policy.",
          "How to cancel: a link, not “text me”.",
        ],
      },
      {
        heading: "Make the system enforce it, not you",
        paragraphs: [
          "A personal trainer with ten years of independent practice put it simply: when it's documented and signed, enforcing it isn't personal; you're just following the agreement. Show the policy when people book, repeat it in the confirmation email, and let the booking system handle the timing.",
          "Fees need payment details on file to be collectable. If you don't take payment at booking, the better lever is time: ask clients to confirm the day before, and refill the slot the moment someone cancels.",
        ],
      },
      {
        heading: `Where ${n} fits`,
        paragraphs: [
          `${n} doesn't take payments yet, so it can't charge a cancellation fee. What it does is make cancellations cost you less: clients confirm before the day, freed times go to your waitlist, and the person who cancelled gets new times to rebook. We've also written a free cancellation policy template you can copy.`,
        ],
      },
    ],
    faq: [
      { q: "Is it legal to charge a cancellation fee?", a: "Generally yes, if the client agreed to it before booking. Rules differ by country and profession (for example, insurance-billed therapy), so check yours." },
      { q: "What if a client keeps finding excuses?", a: "Name the pattern without accusing: “Fridays don't seem to work for you; shall we move your standing time?” If it continues, ask for payment upfront for future sessions." },
      { q: "Should I waive the fee the first time?", a: "Many practitioners give one grace, then apply the policy. Write that into the policy so the grace is the rule, not a favour." },
    ],
    sources: [r.tutorNoShow, r.excuses, r.trainer],
  },
  {
    slug: "repeat-no-show-clients",
    category: "Grow your practice",
    title: "How to handle clients who keep no-showing",
    description:
      "Every practice has one: the client who misses, apologises, books again and misses again. Here's a fair three-step approach practitioners use, and when it's time to let a client go.",
    keyword: "client keeps no showing",
    published: PUBLISHED,
    updated: PUBLISHED,
    answer:
      "Use the same three steps for everyone: a free pass the first time with a reminder of your policy, a consequence the second time (a fee or a confirmation requirement), and a change of arrangement the third time, such as no standing appointment or payment upfront. Consistency is what makes it fair.",
    sections: [
      {
        heading: "A fair three-step approach",
        bullets: [
          "First miss: no charge, a kind check-in and a reminder of the policy.",
          "Second miss: apply the policy, whether that's a fee or confirming the day before from now on.",
          "Third miss: remove their standing time slot. They can book week to week, or pay upfront.",
        ],
        paragraphs: [
          "A therapist on Reddit described almost exactly this, ending with removing recurring appointments after the third miss. The thread's top tip was blunter: move repeat no-shows to the end of your day, so a miss at least means going home early.",
        ],
      },
      {
        heading: "Check whether it's about fit",
        paragraphs: [
          "Coaches often find repeat no-shows trace back to how the client arrived: no questions before booking, no clear expectations, nothing at stake. One coach put it as “a low quality lead problem”. Asking one or two questions before someone books, and approving new clients yourself, filters out many of them before they ever miss a session.",
        ],
      },
      {
        heading: "When to let a client go",
        paragraphs: [
          "If the pattern continues after the third step, it's fine to end the arrangement kindly: “I think you need someone with more flexibility than I can offer.” A stylist shared that exact wording after losing too much income to one client's cancellations.",
        ],
      },
      {
        heading: `Where ${n} fits`,
        paragraphs: [
          `With ${n} you can ask booking questions, approve new clients before they're booked (free on every plan) and, on Pro, ask clients to confirm before each session. Freed times go to your waitlist, so a repeat no-show costs you less while you sort it out.`,
        ],
      },
    ],
    faq: [
      { q: "Is it unprofessional to drop a client for no-shows?", a: "No, if your policy says so and you apply it to everyone. Clients who keep missing take time other clients could have booked." },
      { q: "Should repeat no-shows pay upfront?", a: "It's the most common fix practitioners suggest: payment upfront for the next sessions, refunded only with proper notice." },
      { q: "Could something else be going on?", a: "Sometimes. Executive-function struggles, illness or avoidance can be behind missed sessions, which is why a check-in comes before any consequence." },
    ],
    sources: [r.missing, r.coachingNoShows, r.excuses],
  },
  {
    slug: "cost-of-no-shows",
    category: "Grow your practice",
    title: "What no-shows and late cancellations really cost a solo practice",
    description:
      "Two missed sessions a week sounds small. At $120 a session it's over $11,000 a year. Here's how to work out your own number and which fixes pay back fastest.",
    keyword: "cost of no shows",
    published: PUBLISHED,
    updated: PUBLISHED,
    answer:
      "Multiply your price per session by the sessions you lose each week, then by your working weeks. At $120 a session and two lost sessions a week over 48 weeks, that's $11,520 a year. A peer-reviewed 2025 study put the loss at 3–14% of revenue for a primary care network.",
    sections: [
      {
        heading: "Work out your number",
        paragraphs: [
          "Price per session × sessions lost per week × working weeks. Count late cancellations as lost when you couldn't refill the time, and no-shows always.",
        ],
        table: {
          head: ["Price per session", "Lost per week", "Lost per year (48 weeks)"],
          rows: [
            ["$60", "1", "$2,880"],
            ["$90", "2", "$8,640"],
            ["$120", "2", "$11,520"],
            ["$150", "3", "$21,600"],
          ],
        },
      },
      {
        heading: "The cost nobody counts",
        bullets: [
          "Time spent chasing: messages, calls and reschedules.",
          "Preparation for sessions that don't happen.",
          "Clients who cancel “for now” and never come back.",
          "Better clients who couldn't get a time because the slot looked taken.",
        ],
      },
      {
        heading: "Which fixes pay back fastest",
        paragraphs: [
          "Refilling the slot pays back first: every refilled cancellation is a full session of income. Confirmations come second, because they move cancellations earlier, when there's still time to refill. Rebooking the person who cancelled keeps the client relationship as well as the session.",
        ],
      },
      {
        heading: `How ${n} helps`,
        paragraphs: [
          `${n} does all three: a waitlist that refills cancelled times, confirm-or-release before the day, and one-click rebooking. Home shows what it saved you each month, valued at each service's own price. Try the calculator on our home page with your own numbers.`,
        ],
      },
    ],
    faq: [
      { q: "What's a normal no-show rate?", a: "It varies widely by field. Medical practices often report 5–30%; solo practitioners with confirmations and a clear policy tend to sit at the low end." },
      { q: "Do reminders reduce no-shows?", a: "Yes, and they're the most common fix. Confirmations go further because they tell you who isn't coming." },
      { q: "Is it worth paying for a tool to fix this?", a: "If refilling one $120 session a month covers it, a $12 tool pays for itself ten times over." },
    ],
    sources: [r.jmir, r.salary, r.cancellations],
  },
  {
    slug: "discovery-call-no-shows",
    category: "Grow your practice",
    title: "Why people ghost discovery calls, and how to get them to show up",
    description:
      "Booked discovery calls that never happen cost coaches and consultants hours every week. Here's why it happens and the small changes that bring show-up rates up.",
    keyword: "discovery call no show",
    published: PUBLISHED,
    updated: PUBLISHED,
    answer:
      "People skip discovery calls they booked on impulse. Ask one or two questions before they book, keep the call short (15–20 minutes), confirm the day before, and send a short agenda. Approving requests before they land on your calendar filters out people who were never serious.",
    sections: [
      {
        heading: "Why discovery calls get ghosted",
        bullets: [
          "Booking was too easy: one click, nothing asked, nothing at stake.",
          "The call is too long; an hour feels like a commitment.",
          "They forgot why they booked by the time the call comes round.",
          "They weren't a fit and knew it, but didn't want to say so.",
        ],
        paragraphs: [
          "A consultant on Reddit spent weeks lining up three stakeholders for a one-hour discovery call, and none of them showed up. The most upvoted advice was practical: send the agenda and questions in advance, and keep calls short.",
        ],
      },
      {
        heading: "Small changes that work",
        bullets: [
          "Ask one or two questions when people book. Coaches report that even one question improves the quality of calls.",
          "Offer 15–20 minutes, not 60.",
          "Send a short agenda the day before.",
          "Ask them to confirm. No confirmation, no call.",
          "Approve requests from people you don't know before they're booked.",
        ],
      },
      {
        heading: `How ${n} helps`,
        paragraphs: [
          `${n} lets you ask booking questions and approve requests before they're booked, free on every plan. On Pro, each request comes with a short AI summary and a Good fit or Fit unclear label, and clients confirm before the day in one click.`,
        ],
      },
    ],
    faq: [
      { q: "Should discovery calls be free?", a: "Most coaches keep them free but short. If many people skip them, a small refundable deposit or a few qualifying questions helps." },
      { q: "How long should a discovery call be?", a: "15 to 20 minutes is enough to check fit and agree a next step." },
      { q: "What should I send before the call?", a: "A one-line reminder of what they asked for, two or three questions you'll cover, and the link." },
    ],
    sources: [r.consultingNoShows, r.coachingNoShows],
  },
  {
    slug: "stop-chasing-clients-reschedule",
    category: "Grow your practice",
    title: "How to stop chasing clients to reschedule",
    description:
      "Rescheduling by text and WhatsApp eats hours every week. Here's how practitioners cut the back-and-forth to one click, without losing the personal touch.",
    keyword: "client rescheduling back and forth",
    published: PUBLISHED,
    updated: PUBLISHED,
    answer:
      "Give clients a reschedule link in every confirmation and reminder, offer specific times instead of asking when works, and send one follow-up with an open time to anyone who cancels. The fewer messages a reschedule needs, the more of them actually happen.",
    sections: [
      {
        heading: "Where the time goes",
        paragraphs: [
          "Tutors describe the most annoying part of the job as chasing messages, rescheduling and keeping track. Each reschedule by message takes three to six back-and-forths, and every one of them is a chance for the client to stop replying.",
        ],
      },
      {
        heading: "Cut it to one click",
        bullets: [
          "Put a reschedule link in the booking confirmation and every reminder.",
          "Offer two or three specific times, never “let me know when works”.",
          "When someone cancels, send one follow-up with a time they can take in one click.",
          "Keep your availability current so the times offered are real.",
        ],
      },
      {
        heading: "Keep it personal",
        paragraphs: [
          "Automating the scheduling frees you to send a real message where it matters: a quick note when someone is going through a hard time, or a thank-you after a good session.",
        ],
      },
      {
        heading: `How ${n} helps`,
        paragraphs: [
          `Every ${n} booking email includes links to reschedule or cancel. When someone cancels, they're shown new times straight away and sent a rebooking email, free on every plan; Pro sends one more nudge after three days. You can also ask the Agent to move bookings for you.`,
        ],
      },
    ],
    faq: [
      { q: "Should clients be able to reschedule themselves?", a: "Yes, within your notice period. It saves you messages and means fewer cancellations become lost sessions." },
      { q: "How many times should I follow up?", a: "Once or twice. A reminder with a specific time, then a final one a few days later." },
      { q: "What about clients who reschedule too often?", a: "Set a limit in your policy, for example two reschedules per month, and stick to it." },
    ],
    sources: [r.tutorAdmin, r.tutorNoShow],
  },
  {
    slug: "deposits-reduce-no-shows",
    category: "Grow your practice",
    title: "Do deposits stop no-shows? What practitioners actually say",
    description:
      "Payment upfront is the fix practitioners mention most for no-shows. Here's how deposits, card-on-file and prepaid packages compare, and what to do if you don't take payment at booking.",
    keyword: "deposit to reduce no shows",
    published: PUBLISHED,
    updated: PUBLISHED,
    answer:
      "Yes. Practitioners consistently say payment upfront cuts no-shows: “no payment, no commitment”. A deposit, a card on file with a 24-hour rule, or prepaid packages all work. Without payment at booking, confirmations the day before and a waitlist that refills freed times recover much of the same income.",
    sections: [
      {
        heading: "What practitioners say",
        paragraphs: [
          "In a thread about cancellations, coaches were near unanimous: upfront payment is a must-have. One keeps a card on file and charges anyone who doesn't cancel within 24 hours, and says most people simply show up. A personal trainer moved every client to automatic monthly billing and stopped chasing payments altogether.",
        ],
      },
      {
        heading: "Deposits, card on file and packages compared",
        table: {
          head: ["Option", "How it works", "Best for"],
          rows: [
            ["Deposit", "Part of the fee paid at booking, kept for late cancels", "New clients, discovery sessions"],
            ["Card on file", "Charged only for late cancels or no-shows", "Regular clients you trust"],
            ["Prepaid packages", "5 or 10 sessions paid upfront", "Coaching and training programmes"],
            ["Monthly subscription", "Billed automatically every month", "Standing weekly sessions"],
          ],
        },
      },
      {
        heading: "If you don't take payment at booking",
        paragraphs: [
          "You can still recover most of the lost income. Ask clients to confirm the day before, so cancellations come early. Keep a waitlist so freed times refill. Offer the person who cancelled new times straight away.",
        ],
      },
      {
        heading: `Where ${n} fits`,
        paragraphs: [
          `Honest answer: ${n} doesn't take payments yet; deposits are on our roadmap. Today it covers the other half: confirm-or-release before the day, a waitlist that refills cancelled times, and one-click rebooking.`,
        ],
      },
    ],
    faq: [
      { q: "How much should a deposit be?", a: "Commonly 20–50% of the session, or the full fee for a first session." },
      { q: "Do deposits put clients off?", a: "Serious clients rarely mind, and coaches report that clear terms make the experience feel more professional." },
      { q: "Should the deposit count towards the session?", a: "Usually yes: it comes off the session price if they turn up, and is kept if they don't give notice." },
    ],
    sources: [r.coachingNoShows, r.trainer],
  },
];
