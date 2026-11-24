import { site } from "@/site.config";

// Copy-ready templates for appointment-based businesses. Each page answers one search ("cancellation policy
// template", "appointment reminder email") with text people can use as-is; placeholders are in {curly braces}.

export type TemplatePage = {
  slug: string;
  title: string;
  description: string;
  keyword: string;
  /** One or two sentences answering the search directly. */
  answer: string;
  whenToUse: string[];
  variants: { name: string; note?: string; text: string }[];
  tips: string[];
  faq: { q: string; a: string }[];
  /** How Calbee handles this for you, in one sentence. */
  calbee: string;
};

export const templates: TemplatePage[] = [
  {
    slug: "cancellation-policy-template",
    title: "Appointment cancellation policy template (free to copy)",
    description: "A clear, fair cancellation policy for coaches, therapists, consultants and other appointment-based businesses. Three versions to copy, from relaxed to strict.",
    keyword: "cancellation policy template",
    answer: "A good appointment cancellation policy says how much notice clients must give, what happens if they cancel late, and how to reschedule. Copy one of the three versions below and change the parts in {curly braces}.",
    whenToUse: ["On your booking page, next to the Confirm button", "In your booking confirmation email", "In your client agreement or onboarding pack"],
    variants: [
      {
        name: "Relaxed (24 hours, no fee)",
        text: "Cancellation policy\n\nPlans change, and that's fine. If you need to cancel or move your appointment, please do it at least 24 hours before it starts, using the link in your confirmation email. That way the time can go to someone else who needs it.\n\nIf you cancel with less than 24 hours' notice more than twice, I may ask you to book further ahead in future.\n\nThank you,\n{your name}",
      },
      {
        name: "Standard (24 hours, late fee)",
        text: "Cancellation policy\n\nPlease cancel or reschedule at least 24 hours before your appointment, using the link in your confirmation email.\n\n• Cancelled 24 hours or more before: no charge.\n• Cancelled less than 24 hours before: {50%} of the session fee.\n• Not attended without notice: the full session fee.\n\nIf something urgent comes up, like illness or an emergency, tell me as soon as you can and I'll waive the fee.\n\n{your name}",
      },
      {
        name: "Strict (48 hours, prepaid sessions)",
        text: "Cancellation policy\n\nSessions are reserved for you and paid in advance. To cancel or reschedule, please give at least 48 hours' notice through the link in your confirmation email.\n\n• 48 hours or more: full refund or a new time.\n• Less than 48 hours: the session is used, but I'll offer the time to my waitlist and refund you if someone takes it.\n• No-shows: the session is used.\n\n{your name}",
      },
    ],
    tips: [
      "Put the policy where clients see it before they book, not only after.",
      "Pick one notice period and use it everywhere: booking page, emails and invoices.",
      "Offer a way back: a late cancellation that gets refilled from your waitlist can be forgiven.",
      "Keep an exception for genuine emergencies; it builds more loyalty than it costs.",
    ],
    faq: [
      { q: "How much notice should a cancellation policy ask for?", a: "24 hours is the most common for coaching, therapy and consulting. 48 hours suits longer or prepaid sessions." },
      { q: "Can I charge a late cancellation fee?", a: "Yes, as long as clients agreed to the policy before booking. Show it on your booking page and in the confirmation email." },
      { q: "What should happen to the cancelled time?", a: "Offer it to someone else. A waitlist that tells the next person automatically turns many late cancellations into new bookings." },
    ],
    calbee: `${site.name} lets clients cancel or reschedule from their email, and offers the freed time to your waitlist automatically.`,
  },
  {
    slug: "no-show-policy-template",
    title: "No-show policy template for appointments",
    description: "A no-show policy that's firm but friendly, for client sessions and appointments. Copy it, plus a follow-up message for after a missed appointment.",
    keyword: "no-show policy template",
    answer: "A no-show policy explains what counts as a no-show (usually not arriving within 10–15 minutes without notice) and what happens next, such as a fee or booking further ahead. Copy the policy and the follow-up message below.",
    whenToUse: ["On your booking page and in your terms", "In reminder emails before each session", "As a reply after a client misses an appointment"],
    variants: [
      {
        name: "No-show policy",
        text: "No-show policy\n\nIf you don't arrive within {15} minutes of your appointment's start time and haven't let me know, the session counts as a no-show.\n\n• First no-show: no charge, but please let me know next time.\n• After that: {the full session fee} is charged for each no-show.\n• After {two} no-shows, I'll ask you to confirm each future booking a day before.\n\nYou can always cancel or reschedule from your confirmation email, at no cost, up to {24} hours before.\n\n{your name}",
      },
      {
        name: "Message after a missed appointment",
        note: "Send the same day. Friendly first, policy second.",
        text: "Hi {client name},\n\nI was ready for our {session type} at {time} today but didn't see you. I hope everything's okay.\n\nIf you'd like a new time, you can pick one here: {booking link}\n\nJust a reminder that under my no-show policy, {what happens}. If something unexpected came up, reply and let me know.\n\n{your name}",
      },
    ],
    tips: [
      "Make it easy not to be a no-show: a one-click reschedule link in every reminder.",
      "Ask for a confirmation the day before; people who say yes almost always turn up.",
      "Be kind the first time. The goal is a client who comes back, not a fee.",
    ],
    faq: [
      { q: "What counts as a no-show?", a: "Usually a client who doesn't arrive within 10–15 minutes of the start time and hasn't cancelled or contacted you." },
      { q: "How do I reduce no-shows without charging fees?", a: "Send a reminder the day before and ask clients to confirm. Anyone who doesn't confirm can have their time released for someone else." },
    ],
    calbee: `${site.name}'s confirm-or-release asks every client to confirm before the day and can free the time if they don't, so no-shows become rebookings.`,
  },
  {
    slug: "appointment-reminder-email-template",
    title: "Appointment reminder email templates (24 hours and 1 hour before)",
    description: "Short appointment reminder emails that clients actually read: one for the day before and one for an hour before, with an easy way to reschedule.",
    keyword: "appointment reminder email template",
    answer: "A good appointment reminder is short: the date and time in the client's time zone, where to go or the video link, and a one-click way to reschedule. Send one the day before and one an hour before.",
    whenToUse: ["24 hours before each appointment", "1 hour before online sessions", "The morning of in-person sessions"],
    variants: [
      {
        name: "24 hours before",
        text: "Subject: See you tomorrow at {time}\n\nHi {client name},\n\nJust a reminder that your {session type} with {your name} is tomorrow, {date} at {time} ({time zone}).\n\nWhere: {address or video link}\n\nCan't make it? Reschedule or cancel here: {reschedule link}\n\nSee you then,\n{your name}",
      },
      {
        name: "1 hour before",
        text: "Subject: Starting in an hour\n\nHi {client name},\n\nYour {session type} starts at {time}. Here's the link to join: {video link}\n\nRunning late? Just reply to this email.\n\n{your name}",
      },
    ],
    tips: [
      "Put the time in the subject line; it's often all people read.",
      "Always include the reschedule link. A moved session beats a missed one.",
      "Don't send more than two reminders for one appointment.",
    ],
    faq: [
      { q: "When should I send appointment reminders?", a: "The day before is the most useful. A second reminder an hour before helps for online sessions." },
      { q: "Do reminders reduce no-shows?", a: "They help, but research finds the effect varies. Asking clients to confirm, not just reminding them, tells you who isn't coming in time to fill the slot." },
    ],
    calbee: `${site.name} sends reminders automatically: one per booking on Free, several on Pro, each with a reschedule link.`,
  },
  {
    slug: "appointment-confirmation-request-template",
    title: "\"Please confirm your appointment\" email template",
    description: "Ask clients to confirm they're still coming before the day. A short confirmation request email and a follow-up for anyone who doesn't reply.",
    keyword: "appointment confirmation email template",
    answer: "A confirmation request asks the client to click to confirm they're still coming, by a set time. It tells you who isn't coming while there's still time to give the slot to someone else.",
    whenToUse: ["24–48 hours before high-value or long sessions", "For clients who have missed sessions before", "For first sessions with new clients"],
    variants: [
      {
        name: "Confirmation request",
        text: "Subject: Please confirm: {session type} on {date}\n\nHi {client name},\n\nYou're booked for {session type} on {date} at {time} ({time zone}).\n\nPlease confirm you're still coming by {deadline}: {confirm link}\n\nIf you can't make it, reschedule here instead: {reschedule link}\n\nIf I don't hear back by {deadline}, I'll offer the time to someone on my waitlist.\n\nThanks,\n{your name}",
      },
      {
        name: "Gentle follow-up (no reply yet)",
        text: "Subject: Still on for {day}?\n\nHi {client name},\n\nJust checking you're still coming on {date} at {time}. One click confirms it: {confirm link}\n\n{your name}",
      },
    ],
    tips: [
      "Give a clear deadline and say what happens if they miss it.",
      "Make confirming one click, with no login.",
      "Send the follow-up only once.",
    ],
    faq: [
      { q: "What's the difference between a reminder and a confirmation request?", a: "A reminder tells the client the appointment is coming. A confirmation request asks them to say they're still coming, so you know who isn't." },
      { q: "What if a client doesn't confirm?", a: "Contact them once, then release the time if they still don't reply, and offer it to someone waiting." },
    ],
    calbee: `${site.name} sends the confirmation request automatically, and if the deadline passes without a reply it can release the time and offer it to your waitlist.`,
  },
  {
    slug: "waitlist-offer-message-template",
    title: "Waitlist message template: offering a cancelled appointment",
    description: "Tell people on your waitlist that a time has opened up. A message that gets claimed fast, plus versions for 'first come, first served' and a reply for when it's gone.",
    keyword: "waitlist message template",
    answer: "A waitlist offer message says which time has opened, how long the person has to claim it, and gives a one-click way to book. Offer it to one person at a time, or to everyone with 'first to claim gets it'.",
    whenToUse: ["When a client cancels a time other people wanted", "When a client doesn't confirm and the time is released", "When you add extra hours on a busy week"],
    variants: [
      {
        name: "Offer to the next person in line",
        text: "Subject: A time just opened: {date} at {time}\n\nHi {name},\n\nGood news: the {session type} you were waiting for just opened up. {date} at {time} ({time zone}) is yours if you want it.\n\nClaim it here: {claim link}\n\nI'll hold it for you until {claim deadline}. After that it goes to the next person on the list.\n\n{your name}",
      },
      {
        name: "First come, first served",
        text: "Subject: {date} at {time} is free\n\nHi {name},\n\nA {session type} slot just opened: {date} at {time}. I've let everyone on the waitlist know, so the first person to claim it gets it.\n\nClaim it: {claim link}\n\n{your name}",
      },
      {
        name: "When someone else got it",
        text: "Hi {name},\n\nSorry, someone else claimed that time first. You're still on the waitlist, and I'll let you know as soon as another time opens.\n\n{your name}",
      },
    ],
    tips: [
      "Keep the claim window short (an hour or two) so the slot doesn't sit empty.",
      "Put the date and time in the subject line.",
      "Always tell people what happens next if they miss it.",
    ],
    faq: [
      { q: "Should I offer a cancelled slot to one person or everyone?", a: "One at a time is fairer to whoever waited longest. Everyone at once fills the slot faster. Many businesses offer it to one person for an hour or two, then to everyone." },
      { q: "How long should someone have to claim a waitlist offer?", a: "One to two hours works well for most appointments, and never past the start of the slot." },
    ],
    calbee: `${site.name} sends this offer for you the moment a booking is cancelled, gives the person two hours, then moves on to the next in line.`,
  },
  {
    slug: "rebooking-email-after-cancellation-template",
    title: "Email to win back a client who cancelled (rebooking template)",
    description: "A short email that gets clients who cancelled to book again, plus a follow-up for a few days later. Retention templates for coaches, therapists and consultants.",
    keyword: "email to client who cancelled appointment",
    answer: "The best way to win back a client who cancelled is to offer a new time straight away, with a one-click link, then follow up once a few days later. Most cancellations are about timing, not interest.",
    whenToUse: ["Right after a client cancels", "A few days later if they haven't rebooked", "After a no-show, once you've reached out"],
    variants: [
      {
        name: "Straight after the cancellation",
        text: "Subject: Let's find you another time\n\nHi {client name},\n\nNo problem about {day}. I've got a few times this week that might suit you better:\n\n• {time option 1}\n• {time option 2}\n• {time option 3}\n\nPick one here and it's booked: {booking link}\n\n{your name}",
      },
      {
        name: "Follow-up a few days later",
        text: "Subject: Still want to {goal}?\n\nHi {client name},\n\nI noticed we haven't found a new time since you cancelled. If now's a better moment, here's my calendar: {booking link}\n\nIf things have changed, no problem at all. Just reply and let me know.\n\n{your name}",
      },
    ],
    tips: [
      "Send the first email within minutes of the cancellation, while they still want the session.",
      "Suggest specific times instead of 'let me know when works'.",
      "Follow up once, not repeatedly.",
    ],
    faq: [
      { q: "Should I follow up when a client cancels?", a: "Yes. Offer a new time straight away and follow up once a few days later. Many cancellations are about timing, and a quick, specific offer brings them back." },
      { q: "How soon should the follow-up be?", a: "Two to four days after the cancellation, if they haven't booked again." },
    ],
    calbee: `${site.name} emails every client who cancels with new times they can book in one click, and on Pro sends a second email after three days.`,
  },
];

export const findTemplate = (slug: string) => templates.find((t) => t.slug === slug);
