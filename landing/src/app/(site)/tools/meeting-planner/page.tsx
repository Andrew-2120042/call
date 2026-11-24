import type { Metadata } from "next";
import Link from "next/link";
import { MeetingPlanner } from "@/components/tz-tools";
import { BreadcrumbLd, ButtonLink, Container, JsonLd } from "@/components/ui";
import { signupUrl, site } from "@/site.config";

export const metadata: Metadata = {
  title: "Meeting planner across time zones: find a time that works for everyone",
  description: "Free meeting planner for people in different time zones. Add up to six cities and see, hour by hour, when everyone is inside working hours.",
  alternates: { canonical: "/tools/meeting-planner" },
};

const FAQ = [
  { q: "How do I find a meeting time across time zones?", a: "Add each person's city. Rows marked with a star are hours when everyone is between 9am and 5pm; amber hours are early or late but still possible." },
  { q: "What if there's no time when everyone is in working hours?", a: "Pick an amber hour that's early for one side and late for the other, and rotate which side gets the awkward time on recurring meetings." },
  { q: "How many cities can I compare?", a: "Up to six at a time." },
];

export default function Page() {
  return (
    <Container className="max-w-4xl pt-12 pb-24">
      <BreadcrumbLd siteUrl={site.url} trail={[{ name: "Tools", path: "/tools" }, { name: "Meeting planner", path: "/tools/meeting-planner" }]} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebApplication", name: "Meeting planner across time zones", url: `${site.url}/tools/meeting-planner`, applicationCategory: "UtilitiesApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } }} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />
      <nav className="text-faint flex gap-1.5 text-[12px]" aria-label="Breadcrumb"><Link href="/" className="hover:text-fg">Home</Link><span>›</span><Link href="/tools" className="hover:text-fg">Tools</Link></nav>
      <h1 className="mt-6 text-[40px] leading-[1.06] tracking-[-0.02em] sm:text-[52px]">Meeting planner across time zones</h1>
      <p className="text-fg/80 mt-4 max-w-[60ch] text-[18px] leading-relaxed">Add everyone's city and see, hour by hour, when you're all inside working hours. Free, no sign-up.</p>
      <div className="mt-8"><MeetingPlanner /></div>
      <div className="max-w-3xl">
        <h2 className="mt-14 text-[26px]">Questions</h2>
        <div className="mt-4 divide-y divide-line border-y border-line">
          {FAQ.map((f) => (<div key={f.q} className="py-4"><h3 className="font-sans text-[17px] font-medium">{f.q}</h3><p className="text-fg/80 mt-1.5 text-[16px] leading-relaxed">{f.a}</p></div>))}
        </div>
        <div className="mt-12 rounded-xl border border-line bg-surface p-6">
          <p className="font-serif text-[24px]">Let them pick the time</p>
          <p className="text-fg/80 mt-2 text-[16px] leading-relaxed">Send a {site.name} booking link instead: people see your free times in their own time zone and book the one that suits them.</p>
          <div className="mt-4"><ButtonLink href={signupUrl}>Get your free booking link</ButtonLink></div>
        </div>
      </div>
    </Container>
  );
}
