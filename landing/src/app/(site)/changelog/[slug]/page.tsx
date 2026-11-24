import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReleaseShot } from "@/components/release-shot";
import { BreadcrumbLd, Container, JsonLd } from "@/components/ui";
import { docSlug } from "@/content/docs";
import { findRelease, releases } from "@/content/releases";
import { signupUrl, site } from "@/site.config";
import { releaseDate } from "../date";

type Params = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => releases.map((r) => ({ slug: r.slug }));

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const r = findRelease((await params).slug);
  if (!r) return {};
  return {
    title: r.title,
    description: r.summary,
    alternates: { canonical: `/changelog/${r.slug}` },
    openGraph: r.image ? { images: [{ url: r.image.src, width: r.image.width, height: r.image.height, alt: r.image.alt }] } : undefined,
  };
}

const H2 = "text-fg scroll-mt-24 text-[32px] leading-tight tracking-[-0.02em]";
const LIST = "mt-5 list-disc space-y-2.5 ps-6 marker:text-line-strong";

export default async function ReleasePage({ params }: Params) {
  const r = findRelease((await params).slug);
  if (!r) notFound();
  const url = `${site.url}/changelog/${r.slug}`;
  const toc = [
    ...r.sections.map((s) => ({ id: docSlug(s.heading), label: s.heading })),
    ...(r.improvements ? [{ id: "features-and-improvements", label: "Features and improvements" }] : []),
    ...(r.fixes ? [{ id: "fixes", label: "Fixes" }] : []),
  ];
  const index = releases.findIndex((x) => x.slug === r.slug);
  const older = releases.slice(index + 1, index + 3);
  return (
    <Container className="max-w-[1160px] pt-10 pb-24">
      <BreadcrumbLd siteUrl={site.url} trail={[{ name: "Changelog", path: "/changelog" }, { name: r.version ?? releaseDate(r.date, r.dateLabel), path: `/changelog/${r.slug}` }]} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "BlogPosting", headline: r.title, description: r.summary, datePublished: r.date, image: r.image ? `${site.url}${r.image.src}` : undefined, mainEntityOfPage: url, author: { "@type": "Organization", name: `${site.name} team` } }} />

      <div className="mx-auto max-w-[880px]">
        <nav className="text-faint flex gap-1.5 text-[13px]" aria-label="Breadcrumb">
          <Link href="/changelog" className="hover:text-fg">Changelog</Link><span>›</span><span>{r.version ?? releaseDate(r.date, r.dateLabel)}</span>
        </nav>
        <h1 className="mt-5 text-[38px] leading-[1.08] tracking-[-0.025em] sm:text-[52px]">{r.title}</h1>
        <p className="text-fg/80 mt-5 text-[18px] leading-relaxed">{r.intro}</p>
        <p className="text-faint mt-6 text-[14px]">
          By the {site.name} team · {releaseDate(r.date, r.dateLabel)} · Issue #{r.issue}
        </p>
        {r.image && <div className="mt-9"><ReleaseShot image={r.image} priority /></div>}
      </div>

      <div className="mt-16 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)_220px]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <p className="text-faint text-[12px] font-medium uppercase tracking-[0.14em]">On this page</p>
            <ol className="mt-3 space-y-1.5 text-[14px]">
              {toc.map((t) => <li key={t.id}><a href={`#${t.id}`} className="text-muted hover:text-fg">{t.label}</a></li>)}
            </ol>
            <div className="mt-8 border-t border-line pt-5">
              <p className="text-[14px]">{site.name} is free for one person. No credit card needed.</p>
              <a href={signupUrl} className="bg-brand mt-3 inline-flex h-9 items-center rounded-md px-4 text-[13px] font-medium text-black">Get started</a>
            </div>
          </div>
        </aside>

        <article className="mx-auto w-full min-w-0 max-w-[720px] text-[18px] leading-[1.75] text-fg/85">
          {r.sections.map((s, i) => (
            <section key={s.heading} className={i === 0 ? "" : "mt-16"}>
              <h2 id={docSlug(s.heading)} className={H2}>{s.heading}</h2>
              {s.image && <div className="mt-6"><ReleaseShot image={s.image} /></div>}
              {s.paragraphs.map((p) => <p key={p} className="mt-5">{p}</p>)}
              {s.bullets && <ul className={LIST}>{s.bullets.map((b) => <li key={b} className="ps-1">{b}</li>)}</ul>}
              {s.cta && (
                <a href={s.cta.href} className="mt-6 inline-flex h-10 items-center rounded-md border border-line-strong px-4 text-[15px] font-medium text-fg transition hover:bg-surface">
                  {s.cta.label} →
                </a>
              )}
            </section>
          ))}
          {r.improvements && (
            <section className="mt-16">
              <h2 id="features-and-improvements" className={H2}>Features and improvements</h2>
              <ul className={LIST}>{r.improvements.map((b) => <li key={b} className="ps-1">{b}</li>)}</ul>
            </section>
          )}
          {r.fixes && (
            <section className="mt-16">
              <h2 id="fixes" className={H2}>Fixes</h2>
              <ul className={LIST}>{r.fixes.map((b) => <li key={b} className="ps-1">{b}</li>)}</ul>
            </section>
          )}
          <div className="mt-16 border-t border-line pt-8">
            <p>Try what's new and tell us what you think. Your feedback decides what we build next: write to us any time at <a href={`mailto:${site.supportEmail}`} className="underline">{site.supportEmail}</a>.</p>
            <p className="mt-5">Cheers,</p>
            <p>The {site.name} team</p>
          </div>
          {older.length > 0 && (
            <div className="mt-14">
              <p className="text-faint text-[12px] font-medium uppercase tracking-[0.14em]">Earlier releases</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {older.map((o) => (
                  <Link key={o.slug} href={`/changelog/${o.slug}`} className="rounded-xl border border-line p-4 text-[15px] leading-snug transition hover:border-line-strong">
                    <span className="text-faint block font-mono text-[12px]">{o.version ? `${o.version} · ` : ""}{releaseDate(o.date, o.dateLabel)}</span>
                    {o.title}
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
