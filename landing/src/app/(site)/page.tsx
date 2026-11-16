import Image from "next/image";
import Link from "next/link";
import { Accordion } from "@/components/accordion";
import { PricingCards } from "@/components/pricing-cards";
import { ApprovalMock, BookingMock, HeroWindows, NoShowMock, TeamMock, WaitlistMock } from "@/components/product-mocks";
import { Faq } from "@/components/sections";
import { type Story, StoryScroller } from "@/components/story-scroller";
import { Container, JsonLd } from "@/components/ui";
import { ConstellationGraphic, GrowthCurve, HoodPanel } from "@/components/graphics";
import { Window } from "@/components/window";
import { homeFaq } from "@/content/site-content";
import { signupUrl, site } from "@/site.config";

const integrations = [
  { name: "Google Calendar", logo: "/logos/google-calendar.svg" },
  { name: "Outlook", logo: "/logos/outlook.svg" },
  { name: "Apple Calendar", logo: "/logos/apple-calendar.svg" },
  { name: "CalDAV", logo: "/logos/caldav.svg" },
  { name: "Google Meet", logo: "/logos/google-meet.webp" },
  { name: "Zoom", logo: "/logos/zoom.svg" },
  { name: "Zapier", logo: "/logos/zapier.svg" },
  { name: "Webhooks", logo: "/logos/webhooks.svg" },
];

const stories: Story[] = [
  {
    id: "get-booked",
    nav: "Get booked",
    lead: "One link, every service.",
    rest: "Clients pick a time that suits them in their own time zone. Your calendars stay in sync, so you're never double booked.",
    visual: <BookingMock />,
    points: [
      { title: "Unlimited services, free.", body: "Each service gets its own link, length, questions and location.", demo: ["Intro call · 15 min", "Consultation · 60 min", "Follow-up · 30 min"] },
      { title: "Your calendars, in sync.", body: "Google, Outlook, Apple and CalDAV are checked for conflicts and updated with every booking.", demo: ["Google Calendar · busy 2–3pm", "New booking added to Outlook"] },
    ],
  },
  {
    id: "fill-cancellations",
    nav: "Fill cancellations",
    lead: "Cancellations refill themselves.",
    rest: "People join a waitlist for times that are taken. The moment one frees up, the first in line gets it.",
    visual: <WaitlistMock />,
    points: [
      { title: "First in line, first offered.", body: "One private claim link at a time, so nobody double books the slot.", demo: ["Priya N. · offered Sat 10:00am", "Claim link sent · 2 hours to accept"] },
      { title: "Never stuck on one person.", body: "An unclaimed offer moves to the next person automatically.", demo: ["Offer expired · Priya N.", "Offered to Tom R. instead"] },
    ],
  },
  {
    id: "stop-no-shows",
    nav: "Stop no-shows",
    lead: "Know who's actually coming.",
    rest: "Clients confirm in one click before your deadline. If they don't, you're told and the time can go to someone else.",
    visual: <NoShowMock />,
    points: [
      { title: "Confirm or release.", body: "Pick the deadline. Unconfirmed bookings can free themselves up.", demo: ["Please confirm by Thu 4pm", "Confirmed in one click"] },
      { title: "Reminders that land.", body: "Send them a day before, an hour before, or both.", demo: ["Reminder · 1 day before", "Reminder · 1 hour before"] },
    ],
  },
  {
    id: "approve-requests",
    nav: "Approve requests",
    lead: "Read every request first.",
    rest: "Approvals are free. On Pro, each request comes with a short summary of who is asking and why.",
    visual: <ApprovalMock />,
    points: [
      { title: "Ask what you need.", body: "Unlimited booking questions on every plan.", demo: ["What do you need help with?", "How did you hear about us?"] },
      { title: "Decide in seconds.", body: "AI summaries turn long answers into a few clear lines.", demo: ["Summary · 6-person studio, budget agreed", "Accept · Decline"] },
    ],
  },
  {
    id: "run-a-team",
    nav: "Run a team",
    lead: "Share the load across the team.",
    rest: "Round robin, collective or one service copied to everyone, with a weekly view of who's free.",
    visual: <TeamMock />,
    points: [
      { title: "See the gaps early.", body: "A weekly heatmap shows where nobody is free during working hours.", demo: ["Nobody free · Tue 1pm–3pm", "Spotted before anyone tries to book"] },
      { title: "One flat price.", body: "Team is $49 a month for up to 10 people. No per-seat maths.", demo: ["Team · $49 a month", "Up to 10 people · no per-seat maths"] },
    ],
  },
];

const facts = [
  { value: "$0", label: "to start, with unlimited services" },
  { value: "4", label: "calendar providers kept in sync" },
  { value: "2 hrs", label: "default window to claim a freed slot" },
  { value: "10", label: "people on one flat Team plan" },
];

export default function Home() {
  return (
    <div className="relative">
      {/* Thin rails framing the content column all the way down the page. */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 z-0 hidden w-full max-w-6xl -translate-x-1/2 border-x border-line/70 lg:block" />
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[340px] mx-auto h-[520px] max-w-5xl rounded-full bg-accent/25 blur-[140px]" />
        <Container className="relative pt-20 pb-14 text-center sm:pt-28">
          <Link href="/blog/fill-last-minute-cancellations" className="text-faint hover:text-muted text-xs transition">
            How to fill last-minute cancellations <span aria-hidden>›</span>
          </Link>
          <h1 className="mx-auto mt-5 max-w-[16ch] text-[44px] font-medium leading-[1.02] tracking-[-0.035em] sm:text-7xl">
            The booking link that fills itself.
          </h1>
          <p className="text-muted mx-auto mt-6 max-w-[48ch] text-base leading-relaxed sm:text-lg">
            {site.name} gets you booked, refills cancelled slots from a waitlist and stops no-shows before they happen.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            <Link href="/#product" className="rounded-full border border-line-strong px-4 py-2 text-[13px] transition hover:bg-raised">
              See how it works
            </Link>
            <a href={signupUrl} className="bg-fg text-bg rounded-full px-4 py-2 text-[13px] font-medium transition hover:bg-white">
              Start for free
            </a>
          </div>
        </Container>
        <div className="relative pb-10">
          {/* The coloured stage the product sits on, like a lit backdrop rising behind the window. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 top-1/3 bg-[linear-gradient(180deg,transparent,rgba(67,56,202,0.22)_45%,rgba(37,99,235,0.28))]"
          />
          <Container className="relative max-w-7xl!">
            <HeroWindows />
          </Container>
        </div>
      </section>

      {/* Works with */}
      <section className="border-y border-line">
        <Container className="grid grid-cols-2 gap-px bg-line px-0! sm:grid-cols-4">
          {integrations.map((item) => (
            <div key={item.name} className="bg-bg text-fg/85 flex h-28 items-center justify-center gap-3 whitespace-nowrap text-base font-medium tracking-tight transition hover:text-fg">
              <Image src={item.logo} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
              {item.name}
            </div>
          ))}
        </Container>
      </section>

      {/* Product story */}
      <section id="product" className="scroll-mt-20 py-28">
        <Container>
          <p className="text-accent text-xs font-medium">Product</p>
          <h2 data-reveal className="mt-3 max-w-[22ch] text-3xl font-medium leading-tight tracking-tight sm:text-5xl">
            The calendar that works after you&apos;re booked. <span className="text-faint">Fills gaps, catches no-shows, shares the load.</span>
          </h2>
          <div className="mt-20">
            <StoryScroller stories={stories} />
          </div>
        </Container>
      </section>

      {/* Live from day one */}
      <section className="py-24">
        <Container className="text-center">
          <p className="text-accent text-xs font-medium">Set up in minutes</p>
          <h2 data-reveal className="mx-auto mt-3 max-w-[30ch] text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
            Live from day one. <span className="text-faint">Connect your calendar, import from Calendly, and share your link before lunch.</span>
          </h2>
          <a href={signupUrl} className="mt-7 inline-block rounded-full border border-line-strong px-4 py-2 text-[13px] transition hover:bg-raised">
            Start for free
          </a>
          <div data-reveal className="mx-auto mt-14 max-w-4xl">
            <Window title="Bookings">
              <Image src="/shots/bookings.png" alt="The Slotwise bookings list" width={2560} height={1600} className="h-auto w-full" />
            </Window>
          </div>
        </Container>
      </section>

      {/* Dark centrepiece */}
      <section className="relative overflow-hidden border-t border-line pt-36 pb-32">
        {/* One soft glow under the horizon that fades out down the whole section, so nothing has a hard edge. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_42%_at_50%_44%,rgba(79,70,229,0.15),rgba(37,99,235,0.05)_50%,transparent_80%)]"
        />
        {/* A wide horizon: a thin multi-colour ring masked from a gradient, with a soft glow under it. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[300px] h-[1100px] w-[1900px] -translate-x-1/2 [mask-image:linear-gradient(180deg,#000_22%,transparent_42%)]">
          <div className="absolute inset-0 rounded-[50%] bg-[radial-gradient(ellipse_at_50%_0%,rgba(37,99,235,0.18),transparent_45%)]" />
          <div
            className="absolute inset-0 bg-[linear-gradient(90deg,#f97316,#ec4899_30%,#8b5cf6_55%,#2563eb_80%,#22d3ee)] blur-[1px]"
            style={{ mask: "radial-gradient(ellipse 50% 50% at 50% 50%, transparent 99.4%, #000 99.6%, #000 99.9%, transparent 100%)", WebkitMask: "radial-gradient(ellipse 50% 50% at 50% 50%, transparent 99.4%, #000 99.6%, #000 99.9%, transparent 100%)" }}
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(90deg,#f97316,#ec4899_30%,#8b5cf6_55%,#2563eb_80%,#22d3ee)] opacity-60 blur-2xl"
            style={{ mask: "radial-gradient(ellipse 50% 50% at 50% 50%, transparent 97%, #000 99.5%, transparent 100%)", WebkitMask: "radial-gradient(ellipse 50% 50% at 50% 50%, transparent 97%, #000 99.5%, transparent 100%)" }}
          />
        </div>
        <Container className="relative text-center">
          <p className="text-faint text-xs">The only booking link with</p>
          <h2 className="mt-4 text-5xl font-medium tracking-[-0.035em] sm:text-7xl">
            Self-filling calendars<sup className="text-faint align-super text-base">™</sup>
          </h2>
        </Container>
        <Container className="relative mt-56 grid border-t border-line sm:grid-cols-2 lg:grid-cols-5">
          {[
            { t: "It waits for you.", b: "Waitlists queue up for every taken time.", icon: "M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" },
            { t: "It asks for you.", b: "Clients confirm, or the time is released.", icon: "m8 12.5 2.5 2.5L16 9.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" },
            { t: "It reads for you.", b: "Requests arrive with a short summary.", icon: "M5 5h14v14H5zM8.5 9.5h7M8.5 12h7M8.5 14.5h4" },
            { t: "It reminds for you.", b: "Reminders before every booking.", icon: "M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16ZM10 20.5h4" },
            { t: "It shares the load.", b: "Round robin across your team.", icon: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm6.5 0a2.5 2.5 0 1 0 0-5M3.5 19a5.5 5.5 0 0 1 11 0M16 13.5a4.5 4.5 0 0 1 4.5 5" },
          ].map((c) => (
            <div
              key={c.t}
              className="relative flex h-56 flex-col justify-between border-line p-6 lg:[&:not(:last-child)]:border-r lg:[&:not(:last-child)]:after:absolute lg:[&:not(:last-child)]:after:top-full lg:[&:not(:last-child)]:after:-right-px lg:[&:not(:last-child)]:after:h-40 lg:[&:not(:last-child)]:after:w-px lg:[&:not(:last-child)]:after:bg-[linear-gradient(180deg,var(--color-line),transparent)] lg:[&:not(:last-child)]:after:content-['']">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-faint" aria-hidden>
                <path d={c.icon} />
              </svg>
              <div>
                <p className="text-sm font-medium">{c.t}</p>
                <p className="text-faint mt-1.5 text-xs leading-relaxed">{c.b}</p>
              </div>
            </div>
          ))}
        </Container>

        <Container className="relative mt-16 lg:mt-24">
          <Accordion
            header={
              <>
                <p className="text-accent text-xs font-medium">Under the hood</p>
                <h2 data-reveal className="mt-3 max-w-[18ch] text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
                  All the scheduling, none of the busywork. <span className="text-faint">Ready on day one.</span>
                </h2>
              </>
            }
            items={[
              {
                title: "Calendar sync",
                body: "Busy times from Google, Outlook, Apple and CalDAV are respected, and new bookings land on the calendar you choose.",
                visual: <HoodPanel title="Calendars" rows={[["/logos/google-calendar.svg", "Google Calendar", "Checking for conflicts"], ["/logos/outlook.svg", "Outlook", "New bookings go here"], ["/logos/apple-calendar.svg", "Apple Calendar", "Checking for conflicts"]]} />,
              },
              {
                title: "Video and locations",
                body: "Google Meet, Zoom or built-in video links are added to every booking, or meet in person.",
                visual: <HoodPanel title="Where you meet" rows={[["/logos/google-meet.webp", "Google Meet", "Link added to every booking"], ["/logos/zoom.svg", "Zoom", "A new meeting each time"], [null, "In person", "12 High Street, studio 2"]]} />,
              },
              {
                title: "Limits and buffers",
                body: "Minimum notice, buffers, daily limits and how far ahead people can book.",
                visual: <HoodPanel title="Limits" rows={[[null, "Minimum notice", "4 hours"], [null, "Buffer after", "15 minutes"], [null, "Most per day", "6 bookings"], [null, "Book ahead", "Up to 60 days"]]} />,
              },
              {
                title: "Embeds and webhooks",
                body: "Put booking on your own site and send every booking to your other tools.",
                visual: <HoodPanel title="Webhooks" rows={[[null, "booking.created", "200 OK · 84 ms"], [null, "booking.rescheduled", "200 OK · 91 ms"], [null, "booking.cancelled", "200 OK · 77 ms"]]} />,
              },
            ]}
          />
        </Container>
      </section>

      {/* Connected */}
      <section className="border-t border-line py-24">
        <Container className="text-center">
          <p className="text-accent text-xs font-medium">Connectivity</p>
          <h2 data-reveal className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">Your tools, connected.</h2>
          <p className="text-muted mx-auto mt-3 max-w-[46ch] text-sm">Calendars, video and automation you already use. Bring your services and hours over from Calendly in a minute.</p>
          <Link href="/docs/integrations" className="text-muted hover:text-fg mt-5 inline-block text-[13px] transition">
            See every integration <span aria-hidden>→</span>
          </Link>
        </Container>
        <div className="mt-14 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent)]">
          <div className="marquee flex w-max gap-4">
            {[...integrations, ...integrations, ...integrations, ...integrations].map((item, i) => (
              <span
                key={`${item.name}-${i}`}
                aria-hidden={i >= integrations.length}
                className="flex h-[72px] items-center gap-3 rounded-2xl border border-line-strong bg-surface px-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <Image src={item.logo} alt="" width={30} height={30} className="h-[30px] w-[30px] object-contain" />
                <span className="text-muted whitespace-nowrap text-sm">{item.name}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Developers */}
      <section className="border-t border-line py-32">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 data-reveal className="text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
              Webhooks. API keys. Embeds.
              <br />
              <span className="text-faint">Build anything on {site.name}.</span>
            </h2>
            <Link href="/docs/developers" className="text-muted hover:text-fg mt-5 inline-block text-[13px] transition">
              Read the docs <span aria-hidden>→</span>
            </Link>
          </div>
          <ConstellationGraphic />
        </Container>
      </section>

      {/* Statement */}
      <section className="border-t border-line py-32">
        <Container className="text-center">
          <p className="font-serif mx-auto max-w-[24ch] text-3xl leading-snug sm:text-5xl">
            “Every booking tool gets you booked. <span className="text-faint">Ours keeps you booked.</span>”
          </p>
          <p className="text-faint mt-6 text-xs">Why we built {site.name}</p>
        </Container>
      </section>

      {/* Facts */}
      <section className="border-t border-line py-24">
        <Container>
          <p className="text-accent text-xs font-medium">Built to be simple</p>
          <h2 data-reveal className="mt-3 max-w-[14ch] text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
            Free to start. <span className="text-faint">Fair when you grow.</span>
          </h2>
          <div className="mt-12 grid items-end gap-12 lg:grid-cols-[1fr_1.3fr]">
            <div data-reveal className="grid grid-cols-2 gap-x-8 gap-y-10">
              {facts.map((f) => (
                <div key={f.label} className="border-s border-line-strong ps-4">
                  <p className="text-3xl font-medium tabular-nums">{f.value}</p>
                  <p className="text-faint mt-1 text-xs">{f.label}</p>
                </div>
              ))}
            </div>
            <GrowthCurve />
          </div>
        </Container>
      </section>

      {/* Pricing */}
      <section className="border-t border-line py-24" id="pricing">
        <Container>
          <h2 data-reveal className="text-3xl font-medium tracking-tight sm:text-4xl">
            Simple pricing. <span className="text-faint">Start free, upgrade when it pays for itself.</span>
          </h2>
          <PricingCards />
        </Container>
      </section>

      <Faq items={homeFaq} />

      {/* Final CTA */}
      <section className="border-t border-line py-32">
        <Container className="text-center">
          <h2 data-reveal className="mx-auto max-w-[14ch] text-4xl font-medium leading-tight tracking-[-0.03em] sm:text-6xl">Full calendars run on {site.name}.</h2>
          <div className="mt-8 flex justify-center gap-2.5">
            <Link href="/pricing" className="rounded-full border border-line-strong px-4 py-2 text-[13px] transition hover:bg-raised">
              See pricing
            </Link>
            <a href={signupUrl} className="bg-fg text-bg rounded-full px-4 py-2 text-[13px] font-medium transition hover:bg-white">
              Start for free
            </a>
          </div>
        </Container>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: site.name,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          url: site.url,
          description: site.description,
          offers: [
            { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
            { "@type": "Offer", name: "Pro", price: "12", priceCurrency: "USD" },
            { "@type": "Offer", name: "Team", price: "49", priceCurrency: "USD" },
          ],
        }}
      />
    </div>
  );
}
