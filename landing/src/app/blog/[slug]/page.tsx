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
    alternates: { canonical: `/blog/${a.slug}` },
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
        <h1 className="text-lg font-medium leading-snug tracking-tight">{a.title}</h1>
        <p className="text-faint mt-1.5 text-[11px]">
          Updated <time dateTime={a.updated}>{formatDate(a.updated)}</time>
        </p>
        <p className="text-faint mt-8 text-[10px] font-medium uppercase tracking-[0.16em]">Guide</p>
        <div className="mt-3 rounded-lg border border-line bg-surface px-4 py-3">
          <p className="text-faint text-[10px] font-medium uppercase tracking-[0.14em]">Short answer</p>
          <p className="mt-1.5 text-[13px] leading-relaxed">{a.answer}</p>
        </div>
        <div className="text-muted text-[13px] leading-[1.7]">
          {a.sections.map((s) => (
            <section key={s.heading}>
              <h2 id={docSlug(s.heading)} className="text-fg mt-9 scroll-mt-6 text-sm font-semibold">
                {s.heading}
              </h2>
              {s.paragraphs?.map((p) => <p key={p} className="mt-3">{p}</p>)}
              {s.bullets && (
                <ul className="mt-3 list-disc space-y-1.5 ps-5 marker:text-line-strong">
                  {s.bullets.map((b) => <li key={b} className="ps-1">{b}</li>)}
                </ul>
              )}
              {s.table && (
                <div className="mt-4 overflow-x-auto rounded-lg border border-line">
                  <table className="w-full min-w-[520px] text-left text-xs">
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
              <h2 id="questions" className="text-fg mt-9 scroll-mt-6 text-sm font-semibold">Questions</h2>
              {a.faq.map((f) => (
                <div key={f.q}>
                  <h3 className="text-fg mt-5 text-[13px] font-medium">{f.q}</h3>
                  <p className="mt-1">{f.a}</p>
                </div>
              ))}
            </section>
          )}
          {a.sources.length > 0 && (
            <section className="mt-10 border-t border-line pt-5">
              <h2 className="text-faint text-[10px] font-medium uppercase tracking-[0.14em]">Sources</h2>
              <ul className="mt-2 space-y-1 text-xs">
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
