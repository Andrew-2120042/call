import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { templates } from "@/content/templates";
import { site } from "@/site.config";

export const metadata: Metadata = {
  title: `Free appointment templates: cancellation policy, reminders, waitlist messages | ${site.name}`,
  description: "Copy-ready templates for appointment-based businesses: cancellation and no-show policies, reminder and confirmation emails, waitlist offers and rebooking emails.",
  alternates: { canonical: "/templates" },
};

export default function TemplatesIndex() {
  return (
    <Container className="max-w-5xl pt-16 pb-24">
      <p className="text-muted text-[13px] font-medium uppercase tracking-[0.14em]">Templates</p>
      <h1 className="mt-3 text-[44px] leading-[1.05] tracking-[-0.025em] sm:text-[60px]">Free appointment templates</h1>
      <p className="text-fg/75 mt-4 max-w-[60ch] text-[18px] leading-relaxed">
        Policies and messages that keep your calendar full and your clients coming back. Copy them, change the parts in
        curly braces, and use them today.
      </p>
      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {templates.map((t) => (
          <Link key={t.slug} href={`/templates/${t.slug}`} className="group rounded-xl border border-line p-6 transition hover:border-line-strong">
            <p className="font-serif text-[24px] leading-snug group-hover:underline">{t.title}</p>
            <p className="text-muted mt-2 text-[15px] leading-relaxed">{t.description}</p>
            <p className="text-faint mt-4 text-[13px]">{t.variants.length} {t.variants.length === 1 ? "template" : "templates"} to copy</p>
          </Link>
        ))}
      </div>
    </Container>
  );
}
