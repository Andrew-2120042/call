import Image from "next/image";
import Link from "next/link";
import { Accordion } from "@/components/accordion";
import { AudienceCarousel } from "@/components/audience-carousel";
import { HoodPanel } from "@/components/graphics";
import { FeatureRow, JobVisual } from "@/components/home-parts";
import { ApprovalMock, NoShowMock, RebookMock, TeamMock, WaitlistMock } from "@/components/product-mocks";
import { Faq } from "@/components/sections";
import { Container, JsonLd } from "@/components/ui";
import { audiences, homeFaq } from "@/content/site-content";
import { signupUrl, site } from "@/site.config";

const integrations = [
  { name: "Google Calendar", logo: "/logos/google-calendar.svg" },
  { name: "Outlook", logo: "/logos/outlook.svg" },
  { name: "Google Meet", logo: "/logos/google-meet.webp" },
  { name: "Zoom", logo: "/logos/zoom.svg" },
  { name: "Microsoft Teams", logo: "/logos/microsoft-teams.svg" },
  { name: "Zapier", logo: "/logos/zapier.svg" },
];

/** Email box that carries the address into sign-up, like Apollo's hero and closing banner. */
function EmailSignup({ light = false }: { light?: boolean }) {
  return (
    <form action={signupUrl} method="get" className="flex w-full max-w-[360px] flex-col gap-2 sm:flex-row">
      <input
        type="email"
        name="email"
        required
        placeholder="Enter email"
        aria-label="Email"
        className={`h-11 w-full rounded-md border px-3.5 sm:flex-1 text-sm outline-none transition ${
          light
            ? "border-black/15 bg-white text-black placeholder:text-black/40 focus:border-black/40"
            : "border-line-strong bg-card text-fg placeholder:text-faint focus:border-fg/40"
        }`}
      />
      <button
        type="submit"
        className={`h-10 rounded-md px-5 text-[13px] transition ${light ? "bg-black text-white hover:bg-black/85" : "bg-brand text-black hover:brightness-95"}`}>
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
        <Container className="relative pt-16 pb-16 text-center sm:pt-24">
          <h1 className="mx-auto max-w-[20ch] font-serif text-[44px] leading-[1.04] tracking-[-0.025em] sm:text-[76px]">
            Where every booking starts with one link
          </h1>
          <p className="text-fg/80 mx-auto mt-6 max-w-[52ch] text-[17px] leading-snug">
            Your free times, one link, booked in a few clicks. Built-in AI summaries for every booking request,
            and AI rescheduling when you ask.
          </p>
          <div className="mt-8 flex justify-center">
            <EmailSignup />
          </div>
          <p className="text-faint mt-3 inline-flex items-center gap-1.5 text-[12px]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <rect x="3" y="6" width="18" height="13" rx="2" />
              <path d="M3 10h18M4 4l16 16" />
            </svg>
            No credit card required
          </p>
          <p className="text-faint mt-2 text-[11px]">
            By signing up, I agree to {site.name}&apos;s{" "}
            <Link href="/terms" className="underline">Terms of Service</Link> and{" "}
            <Link href="/privacy" className="underline">Privacy Policy</Link>.
          </p>
        </Container>
      </section>

      {/* Works with: a slow, endless logo strip. */}
      <section className="border-t border-line py-12">
        <p className="text-muted text-center text-[15px]">Works with the calendars and video apps you already use</p>
        {/* Undo the page zoom here: browsers clip an animated strip inside a zoomed parent at the unzoomed width. */}
        <div className="marquee mt-8 overflow-hidden [zoom:calc(1/var(--site-zoom,1))]">
          <div className="marquee-track flex w-max">
            {/* Four copies slid by half: each half is wider than any screen, so the strip never shows a gap. */}
            {[0, 1, 2, 3].map((copy) => (
              <ul key={copy} className="flex shrink-0 items-center gap-14 pr-14" aria-hidden={copy > 0}>
                {integrations.map((item) => (
                  <li key={item.name} className="text-muted flex items-center gap-2.5 whitespace-nowrap text-[16px]">
                    <Image src={item.logo} alt="" width={26} height={26} className="h-[26px] w-[26px] object-contain" />
                    {item.name}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
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
            body="Read who is asking before a booking lands on your calendar. Each request arrives with a short summary of who they are and whether they're a fit."
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

      {/* One link, three jobs: what happens before, around and after each booking. */}
      <section className="border-t border-line py-28">
        <Container>
          <p className="text-faint text-center font-mono text-[11px] uppercase tracking-[0.16em]">How it works</p>
          <h2 className="mt-3 text-center text-4xl font-normal tracking-[-0.025em] sm:text-6xl">One link. Three jobs.</h2>
          <p className="text-muted mx-auto mt-5 max-w-[50ch] text-center text-[15px]">
            Getting booked is the start. {site.name} keeps the calendar full after that, without you chasing anyone.
          </p>
          <div className="mt-16 grid gap-4 md:grid-cols-3">
            {[
              { kind: "book" as const, step: "01", title: "Get booked", body: "Clients pick a time in their own time zone. Your calendars stay in sync, so you're never double booked.", tags: ["Booking page", "Calendar sync", "Meet & Zoom"] },
              { kind: "keep" as const, step: "02", title: "Stay booked", body: "Reminders ask clients to confirm in one click. Anyone who doesn't, frees the time for someone who will.", tags: ["Reminders", "Confirm-or-release", "Approvals"] },
              { kind: "fill" as const, step: "03", title: "Fill the gaps", body: "A cancelled time goes straight to the next person on the waitlist, until someone claims it.", tags: ["Waitlist", "Rebook offers", "AI summaries"] },
            ].map((job) => (
              <div key={job.title} data-reveal className="flex flex-col rounded-2xl border border-line bg-surface">
                <div className="p-7 pb-0">
                  <p className="text-faint font-mono text-[11px] tracking-[0.16em]">{job.step}</p>
                  <h3 className="mt-3 text-[30px] leading-none">{job.title}</h3>
                  <p className="text-muted mt-3 text-[14px] leading-relaxed">{job.body}</p>
                </div>
                <div className="mt-8 flex-1 px-7">
                  <JobVisual kind={job.kind} />
                </div>
                <div className="mt-7 flex flex-wrap gap-1.5 border-t border-line px-7 py-5">
                  {job.tags.map((tag) => (
                    <span key={tag} className="text-muted rounded-md border border-line px-2 py-1 text-[11px]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Four reasons, on a grey band (Apollo's "AI that actually executes"). */}
      <section className="bg-surface border-y border-line py-24">
        <Container>
          <p className="text-faint text-center font-mono text-[11px] uppercase tracking-[0.16em]">Why {site.name}</p>
          <h2 className="mt-3 text-center text-3xl font-normal tracking-[-0.025em] sm:text-5xl">Scheduling that keeps you booked</h2>
          <p className="text-muted mx-auto mt-4 max-w-[54ch] text-center text-[15px]">
            Most booking tools stop at the booking. Ours keeps working on your calendar after it.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: "M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z", title: "Free where it counts", body: "Unlimited services, bookings and booking questions on the free plan." },
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
                <h2 data-reveal className="mt-3 max-w-[16ch] text-3xl font-normal leading-tight tracking-[-0.025em] sm:text-5xl">
                  Don&apos;t change how you work. Just add {site.name}.
                </h2>
              </>
            }
            items={[
              {
                title: "Calendar sync",
                body: "Busy times from Google Calendar and Outlook are respected, and new bookings land on the calendar you choose.",
                visual: <HoodPanel title="Calendars" rows={[["/logos/google-calendar.svg", "Google Calendar", "Checking for conflicts"], ["/logos/outlook.svg", "Outlook", "New bookings go here"]]} />,
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
            <h2 className="max-w-[16ch] text-3xl font-normal leading-tight tracking-[-0.025em] sm:text-5xl">
              Everything you need to get booked costs
            </h2>
            <p className="text-muted mt-4 max-w-[44ch] text-[15px]">
              Unlimited services, bookings, questions and calendar sync. Pro adds approvals and the parts that refill
              your calendar, for $12 a month.
            </p>
          </div>
          <p className="text-ink font-serif text-[120px] font-normal leading-[0.85] tracking-[-0.04em] sm:text-[240px]">$0</p>
        </Container>
      </section>

      {/* Who it's for (where Apollo shows customer stories). */}
      <section className="border-t border-line py-24">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="max-w-[18ch] text-3xl font-normal leading-tight tracking-[-0.025em] sm:text-5xl">
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

      <Faq items={homeFaq} />

      {/* Closing banner: the one white block on the page, like Apollo's bright one. */}
      <section className="pb-24 pt-8">
        <Container>
          <div className="aurora-yellow relative overflow-hidden rounded-2xl px-6 py-16 text-black sm:px-14 sm:py-20">
            <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.07),transparent_65%)]" />
            <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 hidden grid-cols-7 gap-1.5 p-10 opacity-60 lg:grid">
              {Array.from({ length: 35 }, (_, i) => (
                <span key={i} className={`h-8 w-8 rounded-md ${[9, 10, 16, 18, 23, 24, 25, 31].includes(i) ? "bg-black/80" : "bg-black/[0.06]"}`} />
              ))}
            </div>
            <h2 className="relative max-w-[14ch] text-4xl font-normal leading-[1.05] tracking-[-0.035em] sm:text-6xl">
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
