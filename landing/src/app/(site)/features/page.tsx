import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink, Container, PlanBadge } from "@/components/ui";
import { signupUrl, site } from "@/site.config";

export const metadata: Metadata = {
  title: `Features: waitlist, confirm-or-release, approvals, calendar overlay, group sessions and more | ${site.name}`,
  description: `Everything ${site.name} does, one feature after another: a waitlist that refills cancellations, confirm-or-release for no-shows, approvals with AI summaries, rebooking emails, team scheduling and more.`,
  alternates: { canonical: "/features" },
};

type Item = { name: string; plan: string; headline: string; body: string; points: string[]; href: string };

const ITEMS: Item[] = [
  { name: "Waitlist", plan: "Free on 1 service", headline: "Cancelled times refill themselves", body: "When a time is taken, clients can join a waitlist for it. If the booking is cancelled, the next person waiting is offered the time automatically.", points: ["Clients join from your booking page, no account needed", "The first in line gets a private claim link; after two hours it moves to the next person", "Wait for one time, any time that day, or anything earlier", "Free on one service; Pro on every service, and can offer to everyone at once"], href: "/features/waitlist-scheduling" },
  { name: "Confirm-or-release", plan: "Pro", headline: "Clients confirm before the day", body: "Choose a deadline, like 24 hours before. Clients confirm in one click from an email. If they don't, you're told, and the time can be released for someone else.", points: ["One-click confirm, no login", "Optional automatic release", "A released time goes straight to your waitlist"], href: "/features/no-show-protection" },
  { name: "Approvals", plan: "Free", headline: "Read every request before it's booked", body: "Turn on approvals for any service. Requests wait in your dashboard and the time is held while you decide.", points: ["Accepting confirms and sends the invite", "Declining frees the time and tells the client", "Switch it on per service"], href: "/features/booking-approval" },
  { name: "AI request summaries", plan: "Pro", headline: "Know who's asking in ten seconds", body: "Each request comes with a short summary of who the person is and what they want, written from their answers.", points: ["A fit rating: good, unclear or poor", "A spam check", "A suggested reply you can edit and send"], href: "/features/ai-booking-summaries" },
  { name: "Rebooking emails", plan: "Free", headline: "Win back clients who cancel", body: "When a client cancels, they get an email with new times they can book in one click.", points: ["Suggested times on the cancellation page too", "Pro sends a second email after three days", "No account needed to rebook"], href: "/blog/fill-last-minute-cancellations" },
  { name: "Team scheduling", plan: "Team", headline: "One link for the whole team", body: "Create a team, invite people by email or link, and share services that book whoever is free or everyone together.", points: ["Round robin and collective services", "A shared team page and a team waitlist", "$69 a month for up to 10 people, not per seat"], href: "/features/team-scheduling" },
  { name: "Reminders", plan: "Free", headline: "Up to five reminders per booking", body: "Pick when clients hear from you: a week, two days, a day, two hours or an hour before. Every reminder is sent once, in the client's own time zone.", points: ["Up to 5 reminder emails on every plan", "Set per service", "Clients can reschedule from the email"], href: "/docs/confirm-or-release" },
  { name: "Calendar overlay", plan: "Free", headline: "Clients see their own calendar on yours", body: "On your booking page, clients can lay their own calendar over your free times and spot a time that works for both, without switching tabs.", points: ["One switch on the booking page", "Works with Google and Outlook", "Nothing about their calendar is shared with you"], href: "/docs/services" },
  { name: "Buffers and limits", plan: "Free", headline: "Breathing room between sessions", body: "Add time before and after each booking, set a minimum notice, and cap how many sessions you take per day or week.", points: ["Buffers before and after", "Daily, weekly or monthly booking limits", "Minimum notice so nobody books you in 10 minutes"], href: "/docs/services" },
  { name: "Group sessions", plan: "Free", headline: "Several people, one time", body: "Let more than one person book the same time, for group coaching, classes or workshops, with a seat limit you choose.", points: ["Choose how many seats each time has", "Attendees can be kept private from each other", "Each person gets their own confirmation"], href: "/docs/services" },
  { name: "Integrations", plan: "Free", headline: "Connects to the tools you use", body: "Send bookings to your CRM, spreadsheets or anywhere else, on every plan.", points: ["Zapier and Make", "HubSpot, Salesforce and Pipedrive", "Webhooks, Google Analytics, Tag Manager and Meta Pixel"], href: "/docs/integrations" },
  { name: "Calendar sync", plan: "Free", headline: "Never double booked", body: "Google Calendar and Outlook are checked for conflicts, and new bookings are added to your calendar.", points: ["Google Calendar and Outlook (Microsoft 365)", "Google Meet links on every booking", "Busy times hide from your page"], href: "/docs/integrations#calendars" },
  { name: "Embed on your website", plan: "Free", headline: "Booking right on your site", body: "Put your booking page inside your own website with one snippet, inline or as a pop-up.", points: ["Copy the code from the service menu", "Works on any website builder", "Clients never leave your site"], href: "/docs/developers#embed-on-your-site" },
  { name: "Import from Calendly", plan: "Free", headline: "Switch in a minute", body: "Paste a Calendly personal access token and your services and weekly hours come across.", points: ["Services and hours imported", "Check everything before sharing your link", "Keep Calendly live until its last booking"], href: "/docs/get-started#move-from-calendly" },
];

export default function FeaturesPage() {
  return (
    <>
      <Container className="max-w-4xl pt-16 pb-6 text-center">
        <p className="text-muted text-[13px] font-medium uppercase tracking-[0.14em]">Features</p>
        <h1 className="mt-4 text-[44px] leading-[1.04] tracking-[-0.025em] sm:text-[64px]">Everything {site.name} does</h1>
        <p className="text-fg/75 mx-auto mt-5 max-w-[56ch] text-[18px] leading-relaxed">
          A booking link that gets you booked, then keeps you booked: every feature, one after another.
        </p>
      </Container>
      <Container className="max-w-5xl pb-20">
        {ITEMS.map((item, i) => (
          <section
            key={item.name}
            id={item.href.split("/").pop()?.split("#")[0]}
            className="grid gap-6 border-b border-line py-14 md:grid-cols-[1fr_1.15fr] md:gap-14">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-faint font-mono text-[14px]">{String(i + 1).padStart(2, "0")}</span>
                <p className="text-[15px] font-medium">{item.name}</p>
                <PlanBadge plan={item.plan} />
              </div>
              <h2 className="mt-3 text-[34px] leading-[1.1] tracking-[-0.02em]">{item.headline}</h2>
            </div>
            <div className="md:pt-9">
              <p className="text-fg/80 text-[17px] leading-relaxed">{item.body}</p>
              <ul className="mt-5 space-y-2 text-[16px]">
                {item.points.map((pt) => (
                  <li key={pt} className="flex gap-2.5">
                    <span className="text-emerald-400" aria-hidden>✓</span>
                    <span className="text-fg/85">{pt}</span>
                  </li>
                ))}
              </ul>
              <Link href={item.href} className="mt-6 inline-block text-[15px] underline underline-offset-[3px]">
                Learn more about {item.name.toLowerCase()} →
              </Link>
            </div>
          </section>
        ))}
        <div className="mt-14 text-center"><ButtonLink href={signupUrl}>Start for free</ButtonLink></div>
      </Container>
    </>
  );
}
