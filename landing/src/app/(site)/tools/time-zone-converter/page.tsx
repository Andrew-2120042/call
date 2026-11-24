import type { Metadata } from "next";
import Link from "next/link";
import { TimeZoneConverter } from "@/components/tz-tools";
import { BreadcrumbLd, ButtonLink, Container, JsonLd } from "@/components/ui";
import { signupUrl, site } from "@/site.config";

export const metadata: Metadata = {
  title: "Time zone converter: convert a meeting time to any city",
  description: "Free time zone converter. Pick a date and time in one city and see the local time in London, New York, Los Angeles, India, Sydney or any time zone, with daylight saving handled.",
  alternates: { canonical: "/tools/time-zone-converter" },
};

const FAQ = [
  { q: "How do I convert a meeting time to another time zone?", a: "Choose the time zone the meeting is in, set the date and time, and read the local time for each city in the list. Add any city with the box underneath." },
  { q: "Does this handle daylight saving time?", a: "Yes. Conversions use your browser's time zone data for the exact date you pick, so clocks changing in spring and autumn are included." },
  { q: "Why does the date change for some cities?", a: "When it's evening in one place it can already be tomorrow somewhere else. A different date is highlighted so it's easy to spot." },
];

export default function Page() {
  return (
    <Container className="max-w-3xl pt-12 pb-24">
      <BreadcrumbLd siteUrl={site.url} trail={[{ name: "Tools", path: "/tools" }, { name: "Time zone converter", path: "/tools/time-zone-converter" }]} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebApplication", name: "Time zone converter", url: `${site.url}/tools/time-zone-converter`, applicationCategory: "UtilitiesApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } }} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />
      <nav className="text-faint flex gap-1.5 text-[12px]" aria-label="Breadcrumb"><Link href="/" className="hover:text-fg">Home</Link><span>›</span><Link href="/tools" className="hover:text-fg">Tools</Link></nav>
      <h1 className="mt-6 text-[40px] leading-[1.06] tracking-[-0.02em] sm:text-[52px]">Time zone converter</h1>
      <p className="text-fg/80 mt-4 text-[18px] leading-relaxed">Pick a date and time in one city and see what time it is everywhere else, with daylight saving included. Free, no sign-up.</p>
      <div className="mt-8"><TimeZoneConverter /></div>
      <h2 className="mt-14 text-[26px]">Questions</h2>
      <div className="mt-4 divide-y divide-line border-y border-line">
        {FAQ.map((f) => (<div key={f.q} className="py-4"><h3 className="font-sans text-[17px] font-medium">{f.q}</h3><p className="text-fg/80 mt-1.5 text-[16px] leading-relaxed">{f.a}</p></div>))}
      </div>
      <div className="mt-12 rounded-xl border border-line bg-surface p-6">
        <p className="font-serif text-[24px]">Skip the converting</p>
        <p className="text-fg/80 mt-2 text-[16px] leading-relaxed">A {site.name} booking link shows your free times in each visitor's own time zone, so nobody has to work it out.</p>
        <div className="mt-4"><ButtonLink href={signupUrl}>Get your free booking link</ButtonLink></div>
      </div>
      <p className="text-muted mt-8 text-[15px]">Scheduling across several cities? Try the <Link href="/tools/meeting-planner" className="underline">meeting planner</Link>.</p>
    </Container>
  );
}
