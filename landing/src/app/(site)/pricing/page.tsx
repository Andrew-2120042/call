import type { Metadata } from "next";
import { PricingCards, PricingCompare } from "@/components/pricing-cards";
import { Faq, FinalCta } from "@/components/sections";
import { BreadcrumbLd, Container, JsonLd } from "@/components/ui";
import { homeFaq, pricing } from "@/content/site-content";
import { site } from "@/site.config";

export const metadata: Metadata = {
  title: "Pricing: free booking link, Pro $12, Team $69 for 10 people",
  description: `${site.name} is free for unlimited services and bookings. Pro adds a waitlist, no-show protection and AI request summaries for $12 a month. Teams of up to 10 pay $69 a month in total, then $10 per extra person.`,
  alternates: { canonical: "/pricing", types: { "text/markdown": "/pricing.md" } },
};

export default function PricingPage() {
  return (
    <>
      <BreadcrumbLd siteUrl={site.url} trail={[{ name: "Pricing", path: "/pricing" }]} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: site.name,
          url: `${site.url}/pricing`,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          offers: pricing.map((plan) => ({
            "@type": "Offer",
            name: plan.name,
            price: plan.price.replace("$", ""),
            priceCurrency: "USD",
            description: `${plan.period}. ${plan.items.join("; ")}.`,
            url: `${site.url}/pricing`,
          })),
        }}
      />
      <Container className="grid items-end gap-6 pt-14 pb-10 lg:grid-cols-[1.4fr_1fr] lg:pt-16">
        <h1 className="max-w-[18ch] text-[38px] leading-[1.04] tracking-[-0.025em] sm:text-[52px]">
          Free to start. Paid when it pays for itself.
        </h1>
        <div className="lg:pb-2">
          <p className="text-fg/80 text-[15px] leading-snug">
            A booking link that's free for good. Pro when you want cancelled slots refilled and no-shows caught. Team when
            everyone shares one link, without paying per seat.
          </p>
          <p className="text-faint mt-4 text-[13px]">No credit card to start. Cancel any time, keep everything.</p>
        </div>
      </Container>

      <Container>
        <PricingCards />
        <p className="text-faint mt-10 text-center text-[13px]">Prices in US dollars and exclude any applicable taxes.</p>
      </Container>

      <section className="mt-24 border-t border-line py-24">
        <Container>
          <h2 className="text-center text-4xl tracking-[-0.025em] sm:text-5xl">Compare all plans</h2>
          <div className="mt-12">
            <PricingCompare />
          </div>
        </Container>
      </section>

      <Faq items={homeFaq} title="Pricing questions" />
      <FinalCta />
    </>
  );
}
