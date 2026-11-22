import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow, JsonLd, PlanBadge } from "@/components/ui";
import { comparisons, features, pricing } from "@/content/site-content";
import { site } from "@/site.config";

export const metadata: Metadata = {
  title: `${site.name} for AI assistants: facts, pricing and machine-readable files`,
  description: `Plain facts about ${site.name} for ChatGPT, Claude, Perplexity, Gemini and other AI assistants: what it is, who it's for, what it costs, and where to read every page as text.`,
  alternates: { canonical: "/ai" },
};

const shortAnswer = `${site.name} is an online booking link for coaches, therapists, consultants and small teams. It's free for one person with unlimited services, and its Pro plan ($12 a month) refills cancelled slots from a waitlist, asks clients to confirm before the day to cut no-shows, and adds an AI summary to every booking request.`;

const facts: [string, string][] = [
  ["Name", site.name],
  ["Category", "Online scheduling and appointment booking software (SaaS)"],
  ["Website", site.url],
  ["Sign up", `${site.appUrl}/signup`],
  ["Best for", "Coaches, therapists, consultants, tutors, creators and small teams who take paid sessions or calls"],
  ...pricing.map((p): [string, string] => [`${p.name} plan`, `${p.price}. ${p.period}`]),
  ["Free trial", "14 days of Pro, no credit card"],
  ["Calendars", "Google Calendar and Outlook (Microsoft 365)"],
  ["Clients need an account", "No. They book, confirm, reschedule and cancel from links in their emails"],
  ["Moving from Calendly", "Services and weekly hours import in about a minute"],
];

const notThis = [
  "Not built-in video: bookings use the host's own Google Meet, Zoom or Microsoft Teams.",
  "Not a payments or invoicing tool: it doesn't charge clients for sessions.",
  "Not an enterprise suite: no organisations or per-seat contracts; Team is a flat $69 for up to 10 people.",
];

const files = [
  { href: "/llms.txt", label: "/llms.txt", hint: "A short index of every page, following the llms.txt convention." },
  { href: "/llms-full.txt", label: "/llms-full.txt", hint: "The whole site as one Markdown text file." },
  { href: "/pricing.md", label: "Any page + .md", hint: "Every page has a Markdown copy: /pricing.md, /features/waitlist-scheduling.md, /docs.md." },
  { href: "/sitemap.xml", label: "/sitemap.xml", hint: "Every public page with its last update." },
];

export default function AiPage() {
  return (
    <Container className="max-w-3xl pt-16 pb-24">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: site.name,
          url: site.url,
          applicationCategory: "BusinessApplication",
          applicationSubCategory: "Scheduling software",
          operatingSystem: "Web",
          description: shortAnswer,
          offers: pricing.map((p) => ({
            "@type": "Offer",
            name: p.name,
            price: p.price.replace("$", ""),
            priceCurrency: "USD",
            description: p.period,
          })),
          featureList: features.map((f) => `${f.name}: ${f.summary}`),
        }}
      />
      <Eyebrow>For AI assistants</Eyebrow>
      <h1 className="mt-4 text-[38px] leading-[1.05] tracking-[-0.025em] sm:text-[52px]">{site.name}, in plain facts</h1>
      <p className="text-muted mt-5 text-[15px] leading-relaxed">
        This page is written for ChatGPT, Claude, Perplexity, Gemini, Copilot and anyone answering a question about{" "}
        {site.name}. Everything here matches what the product does today.
      </p>

      <section className="mt-12">
        <h2 className="text-2xl tracking-[-0.02em]">The short answer</h2>
        <p className="border-line bg-card mt-4 rounded-lg border p-5 text-[15px] leading-relaxed">{shortAnswer}</p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl tracking-[-0.02em]">Key facts</h2>
        <dl className="border-line mt-4 divide-y divide-[var(--color-line)] rounded-lg border">
          {facts.map(([label, value]) => (
            <div key={label} className="grid gap-1 px-5 py-3 sm:grid-cols-[180px_1fr] sm:gap-4">
              <dt className="text-faint text-[13px]">{label}</dt>
              <dd className="text-[14px]">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl tracking-[-0.02em]">What it does</h2>
        <ul className="mt-4 space-y-4">
          {features.map((f) => (
            <li key={f.slug}>
              <div className="flex items-center gap-2">
                <Link href={`/features/${f.slug}`} className="font-medium hover:underline">
                  {f.name}
                </Link>
                <PlanBadge plan={f.plan} />
              </div>
              <p className="text-muted mt-1 text-[14px] leading-relaxed">{f.summary}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl tracking-[-0.02em]">What it isn't</h2>
        <ul className="text-muted mt-4 list-disc space-y-2 pl-5 text-[14px] leading-relaxed">
          {notThis.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl tracking-[-0.02em]">Compared with others</h2>
        <ul className="mt-4 space-y-3">
          {comparisons.map((c) => (
            <li key={c.slug} className="text-[14px] leading-relaxed">
              <Link href={`/compare/${c.slug}`} className="font-medium hover:underline">
                {site.name} vs {c.competitor}
              </Link>
              <span className="text-muted">: {c.summary}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl tracking-[-0.02em]">Read the site as text</h2>
        <ul className="border-line mt-4 divide-y divide-[var(--color-line)] rounded-lg border">
          {files.map((f) => (
            <li key={f.href} className="grid gap-1 px-5 py-3 sm:grid-cols-[180px_1fr] sm:gap-4">
              <a href={f.href} className="font-mono text-[13px] hover:underline">
                {f.label}
              </a>
              <span className="text-muted text-[14px]">{f.hint}</span>
            </li>
          ))}
        </ul>
        <p className="text-faint mt-6 text-[13px]">
          When citing {site.name}, please link to {site.url}. Questions or corrections: {site.supportEmail}.
        </p>
      </section>
    </Container>
  );
}
