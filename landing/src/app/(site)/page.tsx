import Image from "next/image";
import Link from "next/link";
import { Accordion } from "@/components/accordion";
import { AudienceCarousel } from "@/components/audience-carousel";
import { HoodPanel } from "@/components/graphics";
import { BookedChip, ClockChip, FaceStack, FeatureRow, JobIllustration } from "@/components/home-parts";
import { PricingCards } from "@/components/pricing-cards";
import { ApprovalMock, HeroWindows, NoShowMock, RebookMock, TeamMock, WaitlistMock } from "@/components/product-mocks";
import { Faq } from "@/components/sections";
import { Container, JsonLd } from "@/components/ui";
import { audiences, homeFaq } from "@/content/site-content";
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

/** Email box that carries the address into sign-up, like Apollo's hero and closing banner. */
function EmailSignup({ light = false }: { light?: boolean }) {
  return (
    <form action={signupUrl} method="get" className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
      <input
        type="email"
        name="email"
        required
        placeholder="Enter your work email"
        aria-label="Email"
        className={`h-11 w-full rounded-md border px-3.5 sm:flex-1 text-sm outline-none transition ${
          light
            ? "border-black/15 bg-white text-black placeholder:text-black/40 focus:border-black/40"
            : "border-line-strong bg-surface text-fg placeholder:text-faint focus:border-fg/40"
        }`}
      />
      <button
        type="submit"
        className={`h-11 rounded-md px-5 text-sm font-medium transition ${light ? "bg-black text-white hover:bg-black/85" : "bg-fg text-bg hover:bg-white"}`}>
        Sign up for free
      </button>
    </form>
  );
}

export default function Home() {
  return (
    <div className="relative">
      {/* Hero: a calendar sentence, then the product on a dark stage. */}
      <section className="relative overflow-hidden">
        <Container className="relative pt-16 pb-12 text-center sm:pt-24">
          <Link
            href="/blog/fill-last-minute-cancellations"
            className="text-muted hover:text-fg inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs transition">
            <span className="rounded-full bg-raised px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide">New</span>
            Waitlists that refill cancelled times
          </Link>
          <h1 className="mx-auto mt-7 max-w-[17ch] text-[40px] font-semibold leading-[1.08] tracking-[-0.04em] sm:text-[76px] sm:leading-[1.02]">
            Where clients <FaceStack /> find
            <br className="hidden sm:block" /> <ClockChip /> the time to meet <BookedChip />
          </h1>
          <p className="text-muted mx-auto mt-6 max-w-[50ch] text-base leading-relaxed sm:text-lg">
            One booking link that gets you booked, refills cancelled slots from a waitlist, and stops no-shows before they
            happen.
          </p>
          <div className="mt-8 flex justify-center">
            <EmailSignup />
          </div>
          <p className="text-faint mt-3 text-xs">Free forever plan. No credit card required.</p>
        </Container>
        <div className="relative pb-6">
          <Container className="max-w-7xl!">
            <div className="relative overflow-hidden rounded-2xl border border-line bg-[radial-gradient(ellipse_at_50%_0%,#1d1d1d,#0b0b0b_70%)] px-3 pt-10 sm:px-20 sm:pt-16">
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_95%,rgba(255,255,255,0.04)_95%),linear-gradient(90deg,transparent_95%,rgba(255,255,255,0.04)_95%)] bg-[size:48px_48px]" />
              <div className="relative">
                <HeroWindows />
              </div>
            </div>
          </Container>
        </div>
      </section>

      {/* Works with: Apollo's logo strip, as the tools people already use. */}
      <section className="py-14">
        <Container>
          <p className="text-faint text-center font-mono text-[11px] uppercase tracking-[0.16em]">
            Works with the calendars and video apps you already use
          </p>
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4 lg:grid-cols-8">
            {integrations.map((item) => (
              <div key={item.name} className="text-muted flex items-center justify-center gap-2 whitespace-nowrap text-sm">
                <Image src={item.logo} alt="" width={22} height={22} className="h-[22px] w-[22px] object-contain opacity-90" />
                {item.name}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Feature rows: product on a grey stage, words and points beside it, alternating sides. */}
      <section id="product" className="scroll-mt-20 border-t border-line py-28">
        <Container className="space-y-32">
          <FeatureRow
            eyebrow="Fill cancellations"
            title="Cancelled times refill themselves"
            body="People join a waitlist for times that are taken. The moment one frees up, the first in line is offered it by email."
            points={[
              { title: "First in line, first offered.", body: "One private claim link at a time, so nobody double books." },
              { title: "Never stuck on one person.", body: "An unclaimed offer moves to the next person on its own." },
              { title: "Any time that day, or earlier.", body: "Clients can wait for a whole day, or for anything sooner." },
            ]}
            href="/features/waitlist-scheduling"
            cta="See how the waitlist works"
            visual={<WaitlistMock />}
          />
          <FeatureRow
            flip
            eyebrow="Approve requests"
            title="Read every request before you say yes"
            body="Approvals are free. On Pro, each request arrives with a short summary of who is asking and whether they're a fit."
            points={[
              { title: "Ask what you need.", body: "Unlimited booking questions on every plan." },
              { title: "Decide in seconds.", body: "Long answers become a few clear lines, with spam flagged." },
              { title: "Accept from anywhere.", body: "The calendar, the email, or just ask the Assistant." },
            ]}
            href="/features/booking-approval"
            cta="See approvals"
            visual={<ApprovalMock />}
          />
          <FeatureRow
            eyebrow="Stop no-shows"
            title="Know who's actually coming"
            body="Clients confirm in one click before your deadline. If they don't, the time can go to someone on the waitlist."
            points={[
              { title: "Confirm or release.", body: "Pick the deadline; unconfirmed bookings free themselves up." },
              { title: "Reminders that land.", body: "A day before, an hour before, or both." },
              { title: "Series stay on track.", body: "Weekly sessions booked in one go, confirmed one at a time." },
            ]}
            href="/features/no-show-protection"
            cta="See no-show protection"
            visual={<NoShowMock />}
          />
          <FeatureRow
            flip
            eyebrow="Win them back"
            title="A retention agent on every cancellation"
            body="When a client cancels, they're offered new times on the spot, then a follow-up email with one opening they can take in a click."
            points={[
              { title: "New times, right away.", body: "Picked around when they like to meet." },
              { title: "A follow-up that books.", body: "Ten minutes later, one open time by email." },
              { title: "Nothing to set up.", body: "It's on for every one-to-one service." },
            ]}
            href="/features/ai-booking-summaries"
            cta="See what the AI does"
            visual={<RebookMock />}
          />
        </Container>
      </section>

      {/* One link, three jobs: Apollo's framed three-column section. */}
      <section className="py-24">
        <Container>
          <div className="rounded-2xl border border-line bg-surface px-5 py-14 sm:px-10">
            <p className="text-faint text-center font-mono text-[11px] uppercase tracking-[0.16em]">How it works</p>
            <h2 className="mt-3 text-center text-3xl font-medium tracking-[-0.025em] sm:text-5xl">One link. Three jobs.</h2>
            <p className="text-muted mx-auto mt-4 max-w-[52ch] text-center text-[15px]">
              Getting booked is the start. {site.name} keeps the calendar full after that, without you chasing anyone.
            </p>
            <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-3">
              {[
                { kind: "book" as const, title: "Get booked", body: "Clients pick a time in their own time zone. Your calendars stay in sync, so you're never double booked.", tags: ["Booking page", "Calendar sync", "Meet & Zoom"] },
                { kind: "keep" as const, title: "Stay booked", body: "Reminders, one-click confirmations and approvals keep the right people in the right slots.", tags: ["Reminders", "Confirm-or-release", "Approvals"] },
                { kind: "fill" as const, title: "Fill the gaps", body: "Waitlists and rebooking offers turn every cancellation into another booking.", tags: ["Waitlist", "Rebook offers", "AI summaries"] },
              ].map((job) => (
                <div key={job.title} className="flex flex-col bg-bg p-7 text-center">
                  <p className="text-2xl font-medium tracking-tight">{job.title}</p>
                  <p className="text-muted mx-auto mt-2 max-w-[30ch] text-[13px] leading-relaxed">{job.body}</p>
                  <div className="my-8">
                    <JobIllustration kind={job.kind} />
                  </div>
                  <div className="mt-auto flex flex-wrap justify-center gap-1.5">
                    {job.tags.map((tag) => (
                      <span key={tag} className="text-muted rounded-md border border-line px-2 py-1 text-[11px]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Four reasons, on a grey band (Apollo's "AI that actually executes"). */}
      <section className="bg-surface border-y border-line py-24">
        <Container>
          <p className="text-faint text-center font-mono text-[11px] uppercase tracking-[0.16em]">Why {site.name}</p>
          <h2 className="mt-3 text-center text-3xl font-medium tracking-[-0.025em] sm:text-5xl">Scheduling that keeps you booked</h2>
          <p className="text-muted mx-auto mt-4 max-w-[54ch] text-center text-[15px]">
            Most booking tools stop at the booking. Ours keeps working on your calendar after it.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: "M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z", title: "Free where it counts", body: "Unlimited services, bookings, approvals and questions on the free plan." },
              { icon: "M5 5h14v14H5zM8.5 9.5h7M8.5 12h7M8.5 14.5h4", title: "AI that reads for you", body: "Every request summarised, spam flagged, and an Assistant that sets up and answers for you." },
              { icon: "M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4", title: "Built to refill", body: "Waitlists, confirm-or-release and rebooking offers turn gaps back into hours." },
              { icon: "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z", title: "Your data stays yours", body: "Calendar access is only used to find free times and add bookings. Leave any time." },
            ].map((card) => (
              <div key={card.title} className="rounded-xl border border-line bg-bg p-6">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-fg/80" aria-hidden>
                  <path d={card.icon} />
                </svg>
                <p className="mt-8 text-[15px] font-medium">{card.title}</p>
                <p className="text-muted mt-2 text-[13px] leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Don't change how you work (Apollo's enterprise accordion). */}
      <section className="py-28">
        <Container>
          <Accordion
            header={
              <>
                <p className="text-faint font-mono text-[11px] uppercase tracking-[0.16em]">Under the hood</p>
                <h2 data-reveal className="mt-3 max-w-[16ch] text-3xl font-medium leading-tight tracking-[-0.025em] sm:text-5xl">
                  Don&apos;t change how you work. Just add {site.name}.
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
                body: "Google Meet or Zoom links are added to every booking, or meet in person or by phone.",
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

      {/* Teams: one more feature row. */}
      <section className="border-t border-line py-28">
        <Container>
          <FeatureRow
            eyebrow="Run a team"
            title="Share the load across the team"
            body="Round robin, everyone at once, or one service copied to each person, with a weekly view of who's free."
            points={[
              { title: "See the gaps early.", body: "A weekly view shows where nobody is free." },
              { title: "Fair by default.", body: "Bookings spread evenly across the team." },
              { title: "One simple price.", body: "$69 a month for up to 10 people, then $10 per extra person." },
            ]}
            href="/features/team-scheduling"
            cta="See team scheduling"
            visual={<TeamMock />}
          />
        </Container>
      </section>

      {/* Big number (Apollo's "600K+"), kept to something true. */}
      <section className="border-t border-line py-24">
        <Container className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
          <div>
            <h2 className="max-w-[16ch] text-3xl font-medium leading-tight tracking-[-0.025em] sm:text-5xl">
              Everything you need to get booked costs
            </h2>
            <p className="text-muted mt-4 max-w-[44ch] text-[15px]">
              Unlimited services, bookings, approvals, questions and calendar sync. Pro adds the parts that refill your
              calendar, for $12 a month.
            </p>
          </div>
          <p className="text-[120px] font-semibold leading-[0.85] tracking-[-0.06em] sm:text-[220px]">$0</p>
        </Container>
      </section>

      {/* Who it's for (where Apollo shows customer stories). */}
      <section className="border-t border-line py-24">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="max-w-[18ch] text-3xl font-medium leading-tight tracking-[-0.025em] sm:text-5xl">
              Made for people whose calendar is their income
            </h2>
            <Link href="/pricing" className="text-muted hover:text-fg text-[13px] transition">
              Compare plans <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="mt-12">
            <AudienceCarousel audiences={audiences} />
          </div>
        </Container>
      </section>

      {/* Pricing */}
      <section className="border-t border-line py-24" id="pricing">
        <Container>
          <h2 data-reveal className="text-3xl font-medium tracking-[-0.025em] sm:text-5xl">
            Simple pricing. <span className="text-faint">Start free, upgrade when it pays for itself.</span>
          </h2>
          <PricingCards />
        </Container>
      </section>

      <Faq items={homeFaq} />

      {/* Closing banner: the one white block on the page, like Apollo's bright one. */}
      <section className="pb-24 pt-8">
        <Container>
          <div className="relative overflow-hidden rounded-2xl bg-[#f4f4f2] px-6 py-16 text-black sm:px-14 sm:py-20">
            <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.07),transparent_65%)]" />
            <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 hidden grid-cols-7 gap-1.5 p-10 opacity-60 lg:grid">
              {Array.from({ length: 35 }, (_, i) => (
                <span key={i} className={`h-8 w-8 rounded-md ${[9, 10, 16, 18, 23, 24, 25, 31].includes(i) ? "bg-black/80" : "bg-black/[0.06]"}`} />
              ))}
            </div>
            <h2 className="relative max-w-[14ch] text-4xl font-semibold leading-[1.05] tracking-[-0.035em] sm:text-6xl">
              Stop losing hours to empty slots.
            </h2>
            <p className="relative mt-5 max-w-[42ch] text-[15px] text-black/60">
              Set up your page in a few minutes, share one link, and let {site.name} keep your week full.
            </p>
            <div className="relative mt-8">
              <EmailSignup light />
            </div>
            <p className="relative mt-3 text-xs text-black/45">Free forever plan. No credit card required.</p>
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
            { "@type": "Offer", name: "Team", price: "69", priceCurrency: "USD" },
          ],
        }}
      />
    </div>
  );
}
