import { site } from "@/site.config";
import type { Metadata } from "next";
import { PricingCards } from "@/components/pricing-cards";
import { Faq, FinalCta } from "@/components/sections";
import { Container } from "@/components/ui";
import { homeFaq } from "@/content/site-content";

export const metadata: Metadata = {
  title: "Pricing: free booking link, Pro $12, Team $69 for 10 people",
  description:
    `${site.name} is free for unlimited services and bookings. Pro adds a waitlist, no-show protection and AI request summaries for $12 a month. Teams of up to 10 pay $69 a month in total, then $10 per extra person.`,
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <Container className="pt-20 text-center">
        <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">Pricing</h1>
        <p className="text-muted mx-auto mt-4 max-w-[52ch]">
          Free for a professional booking link. Pro when you want your calendar to protect itself. Team when you
          want one link for everyone, without paying per seat.
        </p>
      </Container>
      <Container>
        <PricingCards />
      </Container>
      <Faq items={homeFaq} title="Pricing questions" />
      <FinalCta />
    </>
  );
}
