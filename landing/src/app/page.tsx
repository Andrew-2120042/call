import Image from "next/image";
import Link from "next/link";
import { PricingCards } from "@/components/pricing-cards";
import { Faq, FinalCta } from "@/components/sections";
import { ButtonLink, Container, Eyebrow, JsonLd, PlanBadge } from "@/components/ui";
import { audiences, features, homeFaq } from "@/content/site-content";
import { signupUrl, site } from "@/site.config";

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-[480px] max-w-4xl rounded-full bg-accent/20 blur-[120px]"
        />
        <Container className="relative pt-20 pb-12 text-center sm:pt-28">
          <Link
            href="/features/waitlist-scheduling"
            className="text-muted hover:text-fg inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs transition">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> New: a waitlist for taken times
          </Link>
          <h1 className="mx-auto mt-6 max-w-[18ch] text-4xl font-medium tracking-[-0.03em] sm:text-6xl">
            The booking link that fills its own cancellations
          </h1>
          <p className="text-muted mx-auto mt-5 max-w-[56ch] text-base sm:text-lg">
            Share one link, get booked, and stop losing hours to gaps and no-shows. Free for everything you need
            today, with a waitlist and no-show protection when you&apos;re ready.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href={signupUrl}>Sign up free</ButtonLink>
            <ButtonLink href="/#how-it-works" variant="secondary">
              See how it works
            </ButtonLink>
          </div>
          <p className="text-faint mt-4 text-xs">No card needed. Import from Calendly in a minute.</p>
        </Container>
        <Container className="relative">
          <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl shadow-black/60">
            <Image
              src="/shots/booking.png"
              alt="A Slotwise booking page showing a calendar and available times"
              width={2160}
              height={1120}
              priority
              sizes="(max-width: 1200px) 100vw, 1152px"
              className="h-auto w-full"
            />
          </div>
        </Container>
      </section>

      <section id="how-it-works" className="py-24">
        <Container>
          <Eyebrow>Why people switch</Eyebrow>
          <h2 className="mt-3 max-w-[22ch] text-3xl font-medium tracking-tight sm:text-4xl">
            Most booking links stop working once you&apos;re booked
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { k: "Cancellations", t: "A cancelled slot refills itself", b: "Clients join a waitlist for times that are taken. When one frees up, the first in line gets a link to claim it." },
              { k: "No-shows", t: "Know who's actually coming", b: "Clients confirm with one click before a deadline you set. If they don't, you're told and the time can be released." },
              { k: "Bad fits", t: "Approve requests before they land", b: "Read every request first, with a short AI summary of who is asking. Approvals are free." },
            ].map((card) => (
              <div key={card.k} className="rounded-2xl border border-line bg-surface p-6">
                <p className="text-faint text-xs font-medium uppercase tracking-[0.12em]">{card.k}</p>
                <h3 className="mt-3 text-lg font-medium">{card.t}</h3>
                <p className="text-muted mt-2 text-sm leading-relaxed">{card.b}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section id="features" className="py-12">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <Eyebrow>Your dashboard</Eyebrow>
              <h2 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">Calm, fast and out of your way</h2>
              <p className="text-muted mt-4 max-w-[48ch]">
                Every service gets its own link. Connect Google, Outlook or Apple calendars so you&apos;re never double
                booked, and add Google Meet, Zoom or built-in video to every booking.
              </p>
              <ul className="text-muted mt-6 space-y-2 text-sm">
                {["Unlimited services and bookings, free", "Booking questions and approvals, free", "Embed on your own website"].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-emerald-400">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="overflow-hidden rounded-2xl border border-line">
              <Image
                src="/shots/dashboard.png"
                alt="The Slotwise dashboard listing services with their booking links"
                width={2560}
                height={1600}
                sizes="(max-width: 1024px) 100vw, 560px"
                className="h-auto w-full"
              />
            </div>
          </div>

          <div className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Link
                key={f.slug}
                href={`/features/${f.slug}`}
                className="group rounded-2xl border border-line bg-surface p-6 transition hover:border-line-strong hover:bg-raised">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{f.name}</h3>
                  <PlanBadge plan={f.plan} />
                </div>
                <p className="text-muted mt-2 text-sm leading-relaxed">{f.summary}</p>
                <p className="text-fg mt-4 text-sm opacity-70 transition group-hover:opacity-100">Learn more →</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-24">
        <Container>
          <Eyebrow>Built for</Eyebrow>
          <div className="mt-4 flex flex-wrap gap-2">
            {audiences.map((a) => (
              <Link
                key={a.slug}
                href={`/for/${a.slug}`}
                className="text-muted hover:text-fg rounded-full border border-line px-4 py-2 text-sm transition hover:border-line-strong">
                {a.plural[0].toUpperCase() + a.plural.slice(1)}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-12" id="pricing">
        <Container>
          <h2 className="text-center text-3xl font-medium tracking-tight sm:text-4xl">Simple pricing</h2>
          <p className="text-muted mx-auto mt-3 max-w-[48ch] text-center">
            Start free. Pay only for the features that protect your calendar.
          </p>
          <PricingCards />
        </Container>
      </section>

      <Faq items={homeFaq} />
      <FinalCta />
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
