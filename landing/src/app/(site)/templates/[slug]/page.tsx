import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyTextButton } from "@/components/copy-text-button";
import { BreadcrumbLd, ButtonLink, Container, JsonLd } from "@/components/ui";
import { findTemplate, templates } from "@/content/templates";
import { signupUrl, site } from "@/site.config";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => templates.map((t) => ({ slug: t.slug }));

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const t = findTemplate((await params).slug);
  if (!t) return {};
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical: `/templates/${t.slug}`, types: { "text/markdown": `/templates/${t.slug}.md` } },
  };
}

export default async function TemplatePage({ params }: Params) {
  const t = findTemplate((await params).slug);
  if (!t) notFound();
  const others = templates.filter((x) => x.slug !== t.slug).slice(0, 3);
  return (
    <Container className="max-w-[760px] pt-10 pb-24">
      <BreadcrumbLd siteUrl={site.url} trail={[{ name: "Templates", path: "/templates" }, { name: t.title, path: `/templates/${t.slug}` }]} />
      {t.faq.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: t.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          }}
        />
      )}
      <nav aria-label="Breadcrumb" className="text-faint flex gap-1.5 text-[12px]">
        <Link href="/" className="hover:text-fg">Home</Link>
        <span aria-hidden>›</span>
        <Link href="/templates" className="hover:text-fg">Templates</Link>
      </nav>
      <h1 className="mt-6 text-[38px] leading-[1.08] tracking-[-0.02em] sm:text-[48px]">{t.title}</h1>
      <p className="text-fg/85 mt-5 text-[18px] leading-relaxed">{t.answer}</p>

      <h2 className="mt-12 text-[26px] tracking-[-0.015em]">When to use it</h2>
      <ul className="text-fg/85 mt-4 list-disc space-y-2 ps-6 text-[17px] marker:text-line-strong">
        {t.whenToUse.map((w) => <li key={w}>{w}</li>)}
      </ul>

      {t.variants.map((v) => (
        <section key={v.name} className="mt-12">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[26px] tracking-[-0.015em]">{v.name}</h2>
            <CopyTextButton text={v.text} />
          </div>
          {v.note && <p className="text-muted mt-2 text-[15px]">{v.note}</p>}
          <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-line bg-surface p-5 font-sans text-[16px] leading-relaxed">{v.text}</pre>
        </section>
      ))}

      <h2 className="mt-12 text-[26px] tracking-[-0.015em]">Tips</h2>
      <ul className="text-fg/85 mt-4 list-disc space-y-2 ps-6 text-[17px] marker:text-line-strong">
        {t.tips.map((tip) => <li key={tip}>{tip}</li>)}
      </ul>

      <h2 className="mt-12 text-[26px] tracking-[-0.015em]">Questions</h2>
      <div className="mt-4 divide-y divide-line border-y border-line">
        {t.faq.map((f) => (
          <div key={f.q} className="py-4">
            <h3 className="font-sans text-[17px] font-medium">{f.q}</h3>
            <p className="text-fg/80 mt-1.5 text-[16px] leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl border border-line bg-surface p-6">
        <p className="font-serif text-[24px]">Let {site.name} send it for you</p>
        <p className="text-fg/80 mt-2 text-[16px] leading-relaxed">{t.calbee}</p>
        <div className="mt-4"><ButtonLink href={signupUrl}>Try {site.name} free</ButtonLink></div>
      </div>

      <h2 className="mt-14 text-[22px]">More templates</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {others.map((o) => (
          <Link key={o.slug} href={`/templates/${o.slug}`} className="rounded-xl border border-line p-4 text-[14px] transition hover:border-line-strong">
            {o.title}
          </Link>
        ))}
      </div>
    </Container>
  );
}
