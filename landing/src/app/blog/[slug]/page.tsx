import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Faq, FinalCta } from "@/components/sections";
import { Container, Eyebrow, JsonLd } from "@/components/ui";
import { articles } from "@/content/articles";
import { site } from "@/site.config";

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
  return (
    <>
      <article>
        <Container className="max-w-3xl pt-16">
          <nav className="text-faint mb-6 text-xs" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-fg">Home</Link> / <Link href="/blog" className="hover:text-fg">Guides</Link>
          </nav>
          <Eyebrow>{a.keyword}</Eyebrow>
          <h1 className="mt-4 text-3xl font-medium tracking-tight sm:text-5xl">{a.title}</h1>
          <p className="text-faint mt-4 text-sm">Updated <time dateTime={a.updated}>{formatDate(a.updated)}</time></p>
          <div className="mt-8 rounded-2xl border border-accent/40 bg-accent-soft/40 p-5">
            <p className="text-faint text-xs font-medium uppercase tracking-[0.12em]">Short answer</p>
            <p className="mt-2 leading-relaxed">{a.answer}</p>
          </div>
        </Container>
        <Container className="max-w-3xl py-10">
          {a.sections.map((s) => (
            <section key={s.heading} className="mt-10 first:mt-0">
              <h2 className="text-2xl font-medium tracking-tight">{s.heading}</h2>
              {s.paragraphs?.map((p) => <p key={p} className="text-muted mt-4 leading-relaxed">{p}</p>)}
              {s.bullets && (
                <ul className="text-muted mt-4 space-y-2">
                  {s.bullets.map((b) => <li key={b} className="flex gap-3"><span className="text-faint">•</span>{b}</li>)}
                </ul>
              )}
              {s.table && (
                <div className="mt-5 overflow-x-auto rounded-2xl border border-line">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead className="bg-surface">
                      <tr>{s.table.head.map((h) => <th key={h} scope="col" className="px-4 py-3 font-medium">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {s.table.rows.map((row) => (
                        <tr key={row[0]}>
                          {row.map((cell, i) => i === 0
                            ? <th key={i} scope="row" className="px-4 py-3 font-normal">{cell}</th>
                            : <td key={i} className="text-muted px-4 py-3">{cell}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
          {a.sources.length > 0 && (
            <section className="mt-12 border-t border-line pt-6">
              <h2 className="text-sm font-medium">Sources</h2>
              <ul className="text-muted mt-3 space-y-1 text-sm">
                {a.sources.map((s) => <li key={s.url}><a href={s.url} rel="nofollow noopener" target="_blank" className="underline hover:text-fg">{s.label}</a></li>)}
              </ul>
            </section>
          )}
        </Container>
      </article>
      {a.faq.length > 0 && <Faq items={a.faq} />}
      <FinalCta />
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
