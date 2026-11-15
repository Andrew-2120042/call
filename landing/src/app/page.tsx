import Image from "next/image";
import Link from "next/link";
import { Accordion } from "@/components/accordion";
import { PricingCards } from "@/components/pricing-cards";
import { ApprovalMock, BookingMock, HeroWindows, NoShowMock, TeamMock, WaitlistMock } from "@/components/product-mocks";
import { Faq } from "@/components/sections";
import { type Story, StoryScroller } from "@/components/story-scroller";
import { Container, JsonLd } from "@/components/ui";
import { Window } from "@/components/window";
import { articles } from "@/content/articles";
import { homeFaq } from "@/content/site-content";
import { signupUrl, site } from "@/site.config";

const integrations = ["Google Calendar", "Outlook", "Apple Calendar", "CalDAV", "Google Meet", "Zoom", "Zapier", "Webhooks"];

const stories: Story[] = [
  {
    id: "get-booked",
    nav: "Get booked",
    lead: "One link, every service.",
    rest: "Clients pick a time that suits them in their own time zone. Your calendars stay in sync, so you're never double booked.",
    visual: <BookingMock />,
    points: [
      { title: "Unlimited services, free.", body: "Each service gets its own link, length, questions and location." },
      { title: "Your calendars, in sync.", body: "Google, Outlook, Apple and CalDAV are checked for conflicts and updated with every booking." },
    ],
  },
  {
    id: "fill-cancellations",
    nav: "Fill cancellations",
    lead: "Cancellations refill themselves.",
    rest: "People join a waitlist for times that are taken. The moment one frees up, the first in line gets it.",
    visual: <WaitlistMock />,
    points: [
      { title: "First in line, first offered.", body: "One private claim link at a time, so nobody double books the slot." },
      { title: "Never stuck on one person.", body: "An unclaimed offer moves to the next person automatically." },
    ],
  },
  {
    id: "stop-no-shows",
    nav: "Stop no-shows",
    lead: "Know who's actually coming.",
    rest: "Clients confirm in one click before your deadline. If they don't, you're told and the time can go to someone else.",
    visual: <NoShowMock />,
    points: [
      { title: "Confirm or release.", body: "Pick the deadline. Unconfirmed bookings can free themselves up." },
      { title: "Reminders that land.", body: "Send them a day before, an hour before, or both." },
    ],
  },
  {
    id: "approve-requests",
    nav: "Approve requests",
    lead: "Read every request first.",
    rest: "Approvals are free. On Pro, each request comes with a short summary of who is asking and why.",
    visual: <ApprovalMock />,
    points: [
      { title: "Ask what you need.", body: "Unlimited booking questions on every plan." },
      { title: "Decide in seconds.", body: "AI summaries turn long answers into a few clear lines." },
    ],
  },
  {
    id: "run-a-team",
    nav: "Run a team",
    lead: "Share the load across the team.",
    rest: "Round robin, collective or one service copied to everyone, with a weekly view of who's free.",
    visual: <TeamMock />,
    points: [
      { title: "See the gaps early.", body: "A weekly heatmap shows where nobody is free during working hours." },
      { title: "One flat price.", body: "Team is $49 a month for up to 10 people. No per-seat maths." },
    ],
  },
];

const changelog = [
  { date: "Nov 2026", title: "Teams", body: "Invite by email or link, roles, a shared team page." },
  { date: "Nov 2026", title: "Managed services", body: "Set a service up once; every member gets a copy." },
  { date: "Nov 2026", title: "Team waitlist", body: "One queue across every host on a team service." },
  { date: "Nov 2026", title: "Coverage view", body: "See who's free this week and where the gaps are." },
];

const facts = [
  { value: "$0", label: "to start, with unlimited services" },
  { value: "4", label: "calendar providers kept in sync" },
  { value: "2 hrs", label: "default window to claim a freed slot" },
  { value: "10", label: "people on one flat Team plan" },
];

export default function Home() {
  return (
    <>
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
        <Container className="relative pb-10">
          <HeroWindows />
        </Container>
      </section>

      {/* Works with */}
      <section className="border-y border-line">
        <Container className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
          {integrations.map((name) => (
            <div key={name} className="text-faint flex h-20 items-center justify-center border-line text-[13px] font-medium [&:not(:last-child)]:lg:border-r">
              {name}
            </div>
          ))}
        </Container>
      </section>

      {/* Product story */}
      <section id="product" className="scroll-mt-20 py-28">
        <Container>
          <p className="text-accent text-xs font-medium">Product</p>
          <h2 className="mt-3 max-w-[22ch] text-3xl font-medium leading-tight tracking-tight sm:text-5xl">
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
          <h2 className="mx-auto mt-3 max-w-[30ch] text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
            Live from day one. <span className="text-faint">Connect your calendar, import from Calendly, and share your link before lunch.</span>
          </h2>
          <a href={signupUrl} className="mt-7 inline-block rounded-full border border-line-strong px-4 py-2 text-[13px] transition hover:bg-raised">
            Start for free
          </a>
          <div className="mx-auto mt-14 max-w-4xl">
            <Window title="Bookings">
              <Image src="/shots/bookings.png" alt="The Slotwise bookings list" width={2560} height={1600} className="h-auto w-full" />
            </Window>
          </div>
        </Container>
      </section>

      {/* Dark centrepiece */}
      <section className="relative overflow-hidden border-y border-line py-32">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-[58%] h-[900px] w-[1400px] -translate-x-1/2 rounded-[50%] border-t border-accent/50 shadow-[0_-30px_120px_-20px_rgba(37,99,235,0.45)]" />
        <Container className="relative text-center">
          <p className="text-faint text-xs">The only booking link with</p>
          <h2 className="mt-4 text-5xl font-medium tracking-[-0.035em] sm:text-7xl">Self-filling calendars</h2>
        </Container>
        <Container className="relative mt-40 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
          {[
            { t: "It waits for you.", b: "Waitlists queue up for every taken time." },
            { t: "It asks for you.", b: "Clients confirm, or the time is released." },
            { t: "It reads for you.", b: "Requests arrive with a short summary." },
            { t: "It reminds for you.", b: "Reminders before every booking." },
            { t: "It shares the load.", b: "Round robin across your team." },
          ].map((c) => (
            <div key={c.t} className="bg-bg p-6">
              <p className="text-sm font-medium">{c.t}</p>
              <p className="text-faint mt-1.5 text-xs leading-relaxed">{c.b}</p>
            </div>
          ))}
        </Container>
      </section>

      {/* Signals-style accordion */}
      <section className="py-28">
        <Container className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <p className="text-accent text-xs font-medium">Under the hood</p>
            <h2 className="mt-3 max-w-[18ch] text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
              All the scheduling, none of the busywork. <span className="text-faint">Ready on day one.</span>
            </h2>
            <div className="mt-10">
              <Accordion
                items={[
                  { title: "Calendar sync", body: "Busy times from Google, Outlook, Apple and CalDAV are respected, and new bookings land on the calendar you choose." },
                  { title: "Video and locations", body: "Google Meet, Zoom or built-in video links are added to every booking, or meet in person." },
                  { title: "Limits and buffers", body: "Minimum notice, buffers, daily limits and how far ahead people can book." },
                  { title: "Embeds and webhooks", body: "Put booking on your own site and send every booking to your other tools." },
                ]}
              />
            </div>
          </div>
          <div aria-hidden className="relative mx-auto aspect-square w-full max-w-md">
            {[100, 78, 58, 40, 24].map((size) => (
              <span key={size} className="absolute rounded-full border border-line-strong" style={{ inset: `${(100 - size) / 2}%` }} />
            ))}
            <span className="bg-fg absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_30px_6px_rgba(37,99,235,0.6)]" />
          </div>
        </Container>
      </section>

      {/* Connected */}
      <section className="border-t border-line py-24">
        <Container className="text-center">
          <p className="text-accent text-xs font-medium">Connectivity</p>
          <h2 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">Your tools, connected.</h2>
          <p className="text-muted mx-auto mt-3 max-w-[46ch] text-sm">Calendars, video and automation you already use. Bring your services and hours over from Calendly in a minute.</p>
          <div className="mx-auto mt-12 flex max-w-3xl flex-wrap justify-center gap-2.5">
            {integrations.map((name) => (
              <span key={name} className="text-muted rounded-full border border-line-strong bg-surface px-4 py-2 text-[13px]">
                {name}
              </span>
            ))}
          </div>
        </Container>
      </section>

      {/* Developers */}
      <section className="border-t border-line py-24">
        <Container>
          <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">
            Webhooks. API keys. Embeds. <span className="text-faint">Build on {site.name}.</span>
          </h2>
          <a href={signupUrl} className="text-muted hover:text-fg mt-4 inline-block text-[13px] transition">
            Get started <span aria-hidden>→</span>
          </a>
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
          <h2 className="mt-3 max-w-[20ch] text-3xl font-medium tracking-tight sm:text-4xl">
            Free to start. <span className="text-faint">Fair when you grow.</span>
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label} className="border-s border-line-strong ps-4">
                <p className="text-3xl font-medium tabular-nums">{f.value}</p>
                <p className="text-faint mt-1 text-xs">{f.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Guides as stories */}
      <section className="border-t border-line py-24">
        <Container>
          <p className="text-accent text-xs font-medium">Guides</p>
          <h2 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
            Straight answers. <span className="text-faint">About scheduling tools and full calendars.</span>
          </h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
            {articles.slice(0, 3).map((a) => (
              <Link key={a.slug} href={`/blog/${a.slug}`} className="group bg-bg p-6 transition hover:bg-surface">
                <p className="text-faint text-[11px] uppercase tracking-[0.12em]">{a.keyword}</p>
                <p className="mt-3 text-lg font-medium leading-snug">{a.title}</p>
                <p className="text-muted mt-3 text-[13px] opacity-0 transition group-hover:opacity-100">Read <span aria-hidden>→</span></p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Changelog */}
      <section className="border-t border-line py-24">
        <Container>
          <p className="text-accent text-xs font-medium">Changelog</p>
          <h2 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
            Better as you grow. <span className="text-faint">New features to keep pace with you.</span>
          </h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {changelog.map((c) => (
              <div key={c.title} className="bg-bg p-6">
                <p className="text-faint text-[11px]">{c.date}</p>
                <p className="mt-3 text-sm font-medium">{c.title}</p>
                <p className="text-muted mt-1 text-[13px]">{c.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Pricing */}
      <section className="border-t border-line py-24" id="pricing">
        <Container>
          <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">
            Simple pricing. <span className="text-faint">Start free, upgrade when it pays for itself.</span>
          </h2>
          <PricingCards />
        </Container>
      </section>

      <Faq items={homeFaq} />

      {/* Final CTA */}
      <section className="border-t border-line py-32">
        <Container className="text-center">
          <h2 className="mx-auto max-w-[14ch] text-4xl font-medium leading-tight tracking-[-0.03em] sm:text-6xl">Full calendars run on {site.name}.</h2>
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
    </>
  );
}
