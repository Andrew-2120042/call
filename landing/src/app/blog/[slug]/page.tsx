import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/ui";
import { articles } from "@/content/articles";
import { docSlug } from "@/content/docs";
import { signupUrl, site } from "@/site.config";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => articles.map((a) => ({ slug: a.slug }));

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const a = articles.find((x) => x.slug === slug);
  if (!a) return {};
  return {
    title: a.title,
    description: a.description,
    alternates: { canonical: `/blog/${a.slug}`, types: { "text/markdown": `/blog/${a.slug}.md` } },
    openGraph: { type: "article", title: a.title, description: a.description, publishedTime: a.published, modifiedTime: a.updated },
  };
}

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const a = articles.find((x) => x.slug === slug);
  if (!a) notFound();
  const url = `${site.url}/blog/${a.slug}`;
  const index = articles.findIndex((x) => x.slug === a.slug);
  const prev = articles[index - 1];
  const next = articles[index + 1];
  return (
    <>
      <article className="mx-auto max-w-[760px] px-5 pt-10 pb-16 sm:px-10 lg:pt-14">
        <p className="text-faint text-[11px] font-medium uppercase tracking-[0.16em]">Guide</p>
        <h1 className="mt-3 text-[36px] font-normal leading-[1.08] tracking-[-0.02em] sm:text-[48px]">{a.title}</h1>
        <p className="text-faint mt-4 text-[13px]">
          By the {site.name} team · Published <time dateTime={a.published}>{formatDate(a.published)}</time> · Updated{" "}
          <time dateTime={a.updated}>{formatDate(a.updated)}</time>
        </p>
        <div className="mt-8 rounded-lg border border-line bg-surface px-5 py-4">
          <p className="text-faint text-[11px] font-medium uppercase tracking-[0.14em]">Short answer</p>
          <p className="mt-2 text-[16px] leading-relaxed">{a.answer}</p>
        </div>
        {a.sections.length > 3 && (
          <nav className="mt-6 rounded-lg border border-line px-5 py-4" aria-label="Table of contents">
            <p className="text-faint text-[11px] font-medium uppercase tracking-[0.14em]">In this guide</p>
            <ol className="mt-2 list-decimal space-y-1 ps-5 text-[14px]">
              {a.sections.map((s) => (
                <li key={s.heading}>
                  <a href={`#${docSlug(s.heading)}`} className="hover:text-fg text-muted underline-offset-[3px] hover:underline">
                    {s.heading}
                  </a>
                </li>
              ))}
              {a.faq.length > 0 && (
                <li>
                  <a href="#questions" className="hover:text-fg text-muted underline-offset-[3px] hover:underline">
                    Questions
                  </a>
                </li>
              )}
            </ol>
          </nav>
        )}
        <div className="text-fg/85 text-[16px] leading-[1.75]">
          {a.sections.map((s) => (
            <section key={s.heading}>
              <h2 id={docSlug(s.heading)} className="text-fg mt-12 scroll-mt-24 text-[26px] font-normal leading-tight tracking-[-0.015em]">
                {s.heading}
              </h2>
              {s.paragraphs?.map((p) => <p key={p} className="mt-4">{p}</p>)}
              {s.bullets && (
                <ul className="mt-4 list-disc space-y-2 ps-5 marker:text-line-strong">
                  {s.bullets.map((b) => <li key={b} className="ps-1">{b}</li>)}
                </ul>
              )}
              {s.table && (
                <div className="mt-5 overflow-x-auto rounded-lg border border-line">
                  <table className="w-full min-w-[560px] text-left text-[13px] leading-snug">
                    <thead className="text-faint bg-surface">
                      <tr>{s.table.head.map((h) => <th key={h} scope="col" className="px-3 py-2 font-medium">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {s.table.rows.map((row) => (
                        <tr key={row[0]}>
                          {row.map((cell, i) =>
                            i === 0 ? (
                              <th key={i} scope="row" className="text-fg px-3 py-2 text-left font-medium">{cell}</th>
                            ) : (
                              <td key={i} className="px-3 py-2 align-top">{cell}</td>
                            )
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
          {a.faq.length > 0 && (
            <section>
              <h2 id="questions" className="text-fg mt-12 scroll-mt-24 text-[26px] font-normal leading-tight tracking-[-0.015em]">Questions</h2>
              {a.faq.map((f) => (
                <div key={f.q}>
                  <h3 className="font-sans text-fg mt-6 text-[17px] font-medium">{f.q}</h3>
                  <p className="mt-1.5">{f.a}</p>
                </div>
              ))}
            </section>
          )}
          {a.sources.length > 0 && (
            <section className="mt-10 border-t border-line pt-5">
              <h2 className="font-sans text-faint text-[10px] font-medium uppercase tracking-[0.14em]">Sources</h2>
              <ul className="mt-2 space-y-1 text-[13px]">
                {a.sources.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} rel="nofollow noopener" target="_blank" className="underline decoration-line-strong underline-offset-[3px] hover:text-fg">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
        <div className="mt-10 rounded-lg border border-line px-4 py-4 text-[13px]">
          <p className="font-medium">Try {site.name} free</p>
          <p className="text-muted mt-1 text-xs">A booking link that refills cancellations and stops no-shows. Free for one person, no card.</p>
          <a href={signupUrl} className="bg-fg text-bg mt-3 inline-block rounded-full px-3.5 py-1.5 text-xs font-medium transition hover:bg-fg/85">
            Start for free
          </a>
        </div>
        <nav className="mt-10 grid gap-3 border-t border-line pt-6 sm:grid-cols-2" aria-label="More guides">
          {prev ? (
            <Link href={`/blog/${prev.slug}`} className="rounded-lg border border-line px-4 py-3 transition hover:border-line-strong">
              <span className="text-faint block text-[11px]">Previous</span>
              <span className="text-[13px]">{prev.keyword[0].toUpperCase() + prev.keyword.slice(1)}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/blog/${next.slug}`} className="rounded-lg border border-line px-4 py-3 text-right transition hover:border-line-strong">
              <span className="text-faint block text-[11px]">Next</span>
              <span className="text-[13px]">{next.keyword[0].toUpperCase() + next.keyword.slice(1)}</span>
            </Link>
          )}
        </nav>
      </article>
      {a.faq.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: a.faq.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
          }}
        />
      )}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              headline: a.title,
              description: a.description,
              datePublished: a.published,
              dateModified: a.updated,
              mainEntityOfPage: url,
              author: { "@type": "Organization", name: site.name, url: site.url },
              publisher: { "@id": `${site.url}/#org` },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: site.url },
                { "@type": "ListItem", position: 2, name: "Guides", item: `${site.url}/blog` },
                { "@type": "ListItem", position: 3, name: a.title, item: url },
              ],
            },
          ],
        }}
      />
    </>
  );
}
