import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReleaseCollage } from "@/components/release-collage";
import { SectionFigure } from "@/components/section-figure";
import { stickerFor } from "@/lib/section-sticker";
import type { PaletteName } from "@/stickers/fun";
import { BreadcrumbLd, Container, JsonLd } from "@/components/ui";
import { docSlug } from "@/content/docs";
import { findRelease, releases } from "@/content/releases";
import { signupUrl, site } from "@/site.config";
import { releaseDate } from "../page";

const FIGURE_PALETTES: PaletteName[] = ["riso", "matcha", "candy", "aqua", "sunset", "clay"];

type Params = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => releases.map((r) => ({ slug: r.slug }));

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const r = findRelease((await params).slug);
  if (!r) return {};
  return { title: r.title, description: r.intro, alternates: { canonical: `/changelog/${r.slug}` } };
}

// "Summarise with AI" links open the assistant with a ready-made prompt about this page.
const AI_LINKS = [
  { name: "ChatGPT", url: (u: string) => `https://chatgpt.com/?q=${encodeURIComponent(`Summarise this release: ${u}`)}` },
  { name: "Claude", url: (u: string) => `https://claude.ai/new?q=${encodeURIComponent(`Summarise this release: ${u}`)}` },
  { name: "Perplexity", url: (u: string) => `https://www.perplexity.ai/search?q=${encodeURIComponent(`Summarise this release: ${u}`)}` },
];

export default async function ReleasePage({ params }: Params) {
  const r = findRelease((await params).slug);
  if (!r) notFound();
  const url = `${site.url}/changelog/${r.slug}`;
  const toc = [
    ...r.sections.map((s) => ({ id: docSlug(s.heading), label: s.heading })),
    ...(r.improvements ? [{ id: "improvements", label: "Improvements" }] : []),
    ...(r.fixes ? [{ id: "fixes", label: "Fixes" }] : []),
  ];
  const index = releases.findIndex((x) => x.slug === r.slug);
  const older = releases.slice(index + 1, index + 3);
  return (
    <Container className="max-w-[1160px] pt-10 pb-24">
      <BreadcrumbLd siteUrl={site.url} trail={[{ name: "Changelog", path: "/changelog" }, { name: r.version, path: `/changelog/${r.slug}` }]} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "BlogPosting", headline: r.title, description: r.intro, datePublished: r.date, mainEntityOfPage: url, author: { "@type": "Organization", name: `${site.name} team` } }} />
      <div className="mx-auto max-w-[820px]">
        <nav className="text-faint flex gap-1.5 text-[12px]" aria-label="Breadcrumb"><Link href="/" className="hover:text-fg">Home</Link><span>›</span><Link href="/changelog" className="hover:text-fg">Changelog</Link></nav>
        <p className="text-faint mt-6 text-[13px]"><span className="text-fg font-mono">{r.version}</span> · {releaseDate(r.date, r.dateLabel)}</p>
        <h1 className="mt-2 text-[38px] leading-[1.08] tracking-[-0.025em] sm:text-[52px]">{r.title}</h1>
        <p className="text-fg/80 mt-4 text-[18px] leading-relaxed">{r.intro}</p>
        <p className="text-faint mt-5 text-[13px]">By the {site.name} team</p>
        <div className="text-muted mt-3 flex flex-wrap items-center gap-2 text-[13px]">
          <span>Summarise with AI:</span>
          {AI_LINKS.map((ai) => (
            <a key={ai.name} href={ai.url(url)} target="_blank" rel="noopener" className="rounded-full border border-line px-3 py-1 hover:border-line-strong">Open in {ai.name}</a>
          ))}
        </div>
        <div className="mt-8"><ReleaseCollage release={r} /></div>
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)_220px]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <p className="text-faint text-[12px] font-medium uppercase tracking-[0.14em]">On this page</p>
            <ol className="mt-3 space-y-1.5 text-[14px]">
              {toc.map((t) => (<li key={t.id}><a href={`#${t.id}`} className="text-muted hover:text-fg">{t.label}</a></li>))}
            </ol>
            <div className="mt-8 border-t border-line pt-5">
              <p className="text-[14px]">{site.name} is free for one person. No credit card needed.</p>
              <a href={signupUrl} className="bg-brand mt-3 inline-flex h-9 items-center rounded-md px-4 text-[13px] font-medium text-black">Get started</a>
            </div>
          </div>
        </aside>
        <article className="mx-auto w-full min-w-0 max-w-[720px] text-[18px] leading-[1.75] text-fg/85">
          {r.sections.map((s, i) => (
            <section key={s.heading} className="mt-14 first:mt-0">
              <h2 id={docSlug(s.heading)} className="text-fg scroll-mt-24 text-[30px] leading-tight tracking-[-0.02em]">{s.heading}</h2>
              <SectionFigure sticker={stickerFor(s.heading + " " + s.body)} caption={s.heading} palette={FIGURE_PALETTES[i % FIGURE_PALETTES.length]} offset={i * 30} />
              <p className="mt-6">{s.body}</p>
              {s.bullets && <ul className="mt-4 list-disc space-y-2 ps-6 marker:text-line-strong">{s.bullets.map((b) => <li key={b}>{b}</li>)}</ul>}
            </section>
          ))}
          {r.improvements && (
            <section className="mt-14">
              <h2 id="improvements" className="text-fg scroll-mt-24 text-[30px] tracking-[-0.02em]">Improvements</h2>
              <ul className="mt-4 list-disc space-y-2 ps-6 marker:text-line-strong">{r.improvements.map((b) => <li key={b}>{b}</li>)}</ul>
            </section>
          )}
          {r.fixes && (
            <section className="mt-14">
              <h2 id="fixes" className="text-fg scroll-mt-24 text-[30px] tracking-[-0.02em]">Fixes</h2>
              <ul className="mt-4 list-disc space-y-2 ps-6 marker:text-line-strong">{r.fixes.map((b) => <li key={b}>{b}</li>)}</ul>
            </section>
          )}
          <p className="mt-12">Thanks for using {site.name}. Tell us what to build next at <a href={`mailto:${site.supportEmail}`} className="underline">{site.supportEmail}</a>.</p>
          <p className="mt-2">The {site.name} team</p>
          {older.length > 0 && (
            <div className="mt-12 border-t border-line pt-6">
              <p className="text-faint text-[12px] font-medium uppercase tracking-[0.14em]">Earlier releases</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {older.map((o) => (
                  <Link key={o.slug} href={`/changelog/${o.slug}`} className="rounded-xl border border-line p-4 text-[15px] leading-snug transition hover:border-line-strong">
                    <span className="text-faint block font-mono text-[12px]">{o.version}</span>{o.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
        <div className="hidden lg:block" />
      </div>
    </Container>
  );
}
