import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogArt } from "@/components/blog-art";
import { SectionFigure } from "@/components/section-figure";
import { stickerFor } from "@/lib/section-sticker";
import { CopyLinkButton } from "@/components/copy-link-button";
import { FinalCta } from "@/components/sections";
import { JsonLd } from "@/components/ui";
import { type Article, articles, type ToolReview } from "@/content/articles";
import { categoryOf, readingMinutes } from "@/lib/blog";
import { BLOG_ART, DEFAULT_ART } from "@/content/blog-art";
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

// Review-style posts say how they were written; the reader should know Calbee is ours.
const isReview = (a: Article) => ["Best apps", "Alternatives", "Comparisons"].includes(categoryOf(a));

function ToolCard({ tool }: { tool: ToolReview }) {
  const ours = tool.name === site.name;
  return (
    <div className="mt-5 rounded-xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-serif text-[24px] leading-tight">
          {tool.name} <span className="text-faint font-sans text-[13px]">({tool.platforms})</span>
        </h3>
        <a
          href={tool.url}
          rel={ours ? undefined : "nofollow noopener"}
          target={ours ? undefined : "_blank"}
          className="text-[13px] underline underline-offset-[3px]">
          {ours ? `Try ${site.name} free` : `Visit ${tool.name}`} ↗
        </a>
      </div>
      <p className="mt-2 text-[15px]">
        <span className="font-medium">Best for:</span> <span className="text-fg/80">{tool.bestFor}</span>
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[13px] font-semibold">{tool.name} pros</p>
          <ul className="mt-2 space-y-1.5 text-[14px]">
            {tool.pros.map((pro) => (
              <li key={pro} className="flex gap-2">
                <span className="mt-0.5 text-emerald-400" aria-hidden>
                  ✓
                </span>
                <span className="text-fg/85">{pro}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[13px] font-semibold">{tool.name} cons</p>
          <ul className="mt-2 space-y-1.5 text-[14px]">
            {tool.cons.map((con) => (
              <li key={con} className="flex gap-2">
                <span className="mt-0.5 text-red-400" aria-hidden>
                  ✕
                </span>
                <span className="text-fg/85">{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-4 border-t border-line pt-3 text-[14px]">
        <span className="font-medium">{tool.name} pricing:</span> <span className="text-fg/80">{tool.pricing}</span>
      </p>
    </div>
  );
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const a = articles.find((x) => x.slug === slug);
  if (!a) notFound();
  const url = `${site.url}/blog/${a.slug}`;
  const category = categoryOf(a);
  const minutes = readingMinutes(a);
  const related = [
    ...articles.filter((x) => x.slug !== a.slug && categoryOf(x) === category),
    ...articles.filter((x) => x.slug !== a.slug && categoryOf(x) !== category),
  ].slice(0, 3);

  return (
    <>
      <div className="mx-auto max-w-[1480px] px-5 pt-8 sm:px-8">
        <nav aria-label="Breadcrumb" className="text-faint mx-auto flex max-w-[720px] flex-wrap items-center gap-1.5 text-[12px]">
          <Link href="/" className="hover:text-fg">Home</Link>
          <span aria-hidden>›</span>
          <Link href="/blog" className="hover:text-fg">Blog</Link>
          <span aria-hidden>›</span>
          <Link href={`/blog#${docSlug(category)}`} className="hover:text-fg">{category}</Link>
        </nav>

        <header className="mx-auto mt-10 max-w-[820px] text-center">
          <Link href={`/blog#${docSlug(category)}`} className="text-muted text-[12px] font-medium uppercase tracking-[0.14em] hover:text-fg">
            {category}
          </Link>
          <h1 className="mt-4 text-[38px] leading-[1.06] tracking-[-0.025em] sm:text-[54px]">{a.title}</h1>
          <p className="text-fg/75 mx-auto mt-5 max-w-[62ch] text-[18px] leading-relaxed">{a.description}</p>
          <p className="text-faint mt-6 text-[13px]">
            By the {site.name} team · <time dateTime={a.updated}>{formatDate(a.updated)}</time> · {minutes} min read
          </p>
          <div className="mt-4 flex justify-center gap-2 text-[12px]">
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(a.title)}`}
              target="_blank"
              rel="noopener"
              className="rounded-full border border-line px-3 py-1 hover:border-line-strong">
              Share on X
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener"
              className="rounded-full border border-line px-3 py-1 hover:border-line-strong">
              LinkedIn
            </a>
            <CopyLinkButton url={url} />
          </div>
        </header>

        <div className="mx-auto mt-12 max-w-[1000px]">
          <BlogArt art={BLOG_ART[a.slug] ?? DEFAULT_ART} />
        </div>

        {/* The article sits in the middle of the page; the call to action rides in the right-hand gutter. */}
        <div className="mt-14 grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,720px)_minmax(0,1fr)]">
          <article className="mx-auto w-full min-w-0 max-w-[720px] xl:col-start-2">
            {isReview(a) && (
              <p className="text-faint border-l-2 border-line pl-4 text-[13px] italic leading-relaxed">
                We test every tool we write about by setting it up and booking with it. {site.name} is our own product, so
                we say plainly where another tool is the better choice. Nobody pays to be included.
              </p>
            )}
            <div className="mt-6 rounded-xl border border-line bg-surface px-5 py-4">
              <p className="text-faint text-[11px] font-medium uppercase tracking-[0.14em]">The short answer</p>
              <p className="mt-2 text-[17px] leading-relaxed">{a.answer}</p>
            </div>

            <div className="text-fg/85 text-[18px] leading-[1.75]">
              {a.sections.map((s, i) => (
                <section key={s.heading}>
                  <h2 id={docSlug(s.heading)} className="text-fg mt-14 scroll-mt-24 text-[30px] leading-tight tracking-[-0.02em]">
                    {s.heading}
                  </h2>
                  {/* Every other section gets a picture of what it's about, so long guides don't read as a wall of text. */}
                  {!s.tool && i % 2 === 1 && (
                    <SectionFigure
                      sticker={stickerFor(`${s.heading} ${s.paragraphs?.[0] ?? ""}`, (BLOG_ART[a.slug] ?? DEFAULT_ART).stickers[i % 3])}
                      caption={s.heading}
                      palette={(BLOG_ART[a.slug] ?? DEFAULT_ART).palette}
                      offset={i * 25}
                    />
                  )}
                  {s.tool && <ToolCard tool={s.tool} />}
                  {s.paragraphs?.map((p) => <p key={p} className="mt-5">{p}</p>)}
                  {s.bullets && (
                    <ul className="mt-5 list-disc space-y-2.5 ps-6 marker:text-line-strong">
                      {s.bullets.map((b) => <li key={b} className="ps-1">{b}</li>)}
                    </ul>
                  )}
                  {s.table && (
                    <div className="mt-6 overflow-x-auto rounded-xl border border-line">
                      <table className="w-full min-w-[560px] text-left text-[14px] leading-snug">
                        <thead className="bg-surface">
                          <tr>{s.table.head.map((h) => <th key={h} scope="col" className="px-4 py-3 font-semibold">{h}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                          {s.table.rows.map((row) => (
                            <tr key={row[0]} className={row[0] === site.name ? "bg-surface" : undefined}>
                              {row.map((cell, i) =>
                                i === 0 ? (
                                  <th key={i} scope="row" className="text-fg px-4 py-3 text-left font-medium">{cell}</th>
                                ) : (
                                  <td key={i} className="text-fg/80 px-4 py-3 align-top">{cell}</td>
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
                  <h2 id="questions" className="text-fg mt-14 scroll-mt-24 text-[30px] leading-tight tracking-[-0.02em]">
                    Frequently asked questions
                  </h2>
                  <div className="mt-6 divide-y divide-line border-y border-line">
                    {a.faq.map((f) => (
                      <details key={f.q} className="group py-4">
                        <summary className="text-fg flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-medium">
                          {f.q}
                          <span className="text-faint transition group-open:rotate-45" aria-hidden>+</span>
                        </summary>
                        <p className="mt-3">{f.a}</p>
                      </details>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="mt-12 flex items-start gap-4 rounded-xl border border-line p-5">
              <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-fg text-bg text-[15px] font-semibold">
                {site.name[0]}
              </span>
              <div>
                <p className="font-medium">The {site.name} team</p>
                <p className="text-muted mt-1 text-[14px] leading-relaxed">
                  We build {site.name}, a booking link for coaches, therapists and consultants that refills cancelled times
                  from a waitlist and stops no-shows. We write about what we learn running and testing scheduling tools.
                </p>
              </div>
            </div>

            {a.sources.length > 0 && (
              <section className="mt-10 border-t border-line pt-5">
                <h2 className="text-faint font-sans text-[11px] font-medium uppercase tracking-[0.14em]">Sources</h2>
                <ul className="mt-3 space-y-1.5 text-[13px]">
                  {a.sources.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} rel="nofollow noopener" target="_blank" className="text-muted underline decoration-line-strong underline-offset-[3px] hover:text-fg">
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </article>

          <aside className="hidden xl:col-start-3 min-[1360px]:block">
            <div className="sticky top-24 max-w-[264px]">
              <div className="rounded-xl border border-line bg-surface p-5 2xl:p-6">
                <p className="font-serif text-[24px] leading-[1.15] 2xl:text-[27px]">Still comparing scheduling tools?</p>
                <p className="text-fg/75 mt-3 text-[15px] leading-relaxed">
                  {site.name} is a free booking link that refills cancelled times from a waitlist and asks clients to
                  confirm before the day.
                </p>
                <a
                  href={signupUrl}
                  className="bg-brand mt-5 inline-flex h-10 w-full items-center justify-center rounded-md px-4 text-[14px] font-medium text-black transition hover:brightness-95">
                  Try {site.name} free
                </a>
                <p className="text-faint mt-2 text-center text-[12px]">No credit card needed</p>
              </div>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mx-auto mt-20 max-w-[1160px] border-t border-line pt-12">
            <h2 className="text-[28px] tracking-[-0.02em]">Related articles</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {related.map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}`} className="group rounded-xl border border-line p-5 transition hover:border-line-strong">
                  <p className="text-faint text-[11px] font-medium uppercase tracking-[0.12em]">{categoryOf(r)}</p>
                  <p className="mt-2 font-serif text-[20px] leading-snug group-hover:underline">{r.title}</p>
                  <p className="text-muted mt-2 text-[13px] leading-relaxed">{r.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <FinalCta />

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
              "@type": "BlogPosting",
              headline: a.title,
              description: a.description,
              datePublished: a.published,
              dateModified: a.updated,
              mainEntityOfPage: url,
              articleSection: category,
              keywords: a.keyword,
              author: { "@type": "Organization", name: `${site.name} team`, url: site.url },
              publisher: { "@id": `${site.url}/#org` },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: site.url },
                { "@type": "ListItem", position: 2, name: "Blog", item: `${site.url}/blog` },
                { "@type": "ListItem", position: 3, name: a.title, item: url },
              ],
            },
          ],
        }}
      />
    </>
  );
}
