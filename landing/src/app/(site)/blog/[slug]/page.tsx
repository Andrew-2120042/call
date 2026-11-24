import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PromoBanner, PromoNote, pitchFor } from "@/components/blog-promo";
import { ReleaseShot } from "@/components/release-shot";
import { FinalCta } from "@/components/sections";
import { JsonLd } from "@/components/ui";
import { type Article, articles, type ToolReview } from "@/content/articles";
import { categoryOf, readingMinutes } from "@/lib/blog";
import { docSlug } from "@/content/docs";
import { signupUrl, site } from "@/site.config";

// Posts where a blueprint drawing (scripts/anatomy/blog-figures.mjs) says more than an app screenshot.
// Bump when the drawings are rebuilt, so browsers fetch the new files instead of a cached copy.
const FIGURE_VERSION = "dd8ded1e";
const BLOG_FIGURES: Record<string, string> = {
  "free-meeting-scheduler": "calendar",
  "is-calendly-free": "calendar",
  "how-to-get-more-leads": "calendar",
  "how-to-get-clients-on-calls": "calendar",
  "best-scheduling-software-2027": "compare",
  "calendly-vs-cal-com": "compare",
  "calendly-alternatives": "compare",
  "cal-com-alternatives": "compare",
  "acuity-scheduling-alternatives": "compare",
  "youcanbookme-alternatives": "compare",
  "savvycal-alternatives": "compare",
  "tidycal-alternatives": "compare",
  "doodle-alternatives": "compare",
  "setmore-alternatives": "compare",
  "zoho-bookings-alternatives": "compare",
  "square-appointments-alternatives": "compare",
  "microsoft-bookings-alternatives": "compare",
  "google-calendar-appointment-schedule-alternatives": "compare",
  "round-robin-scheduling": "rotation",
  "team-scheduling-without-per-seat-pricing": "rotation",
};

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

/** Our own row leads every comparison table, above the tool the post is about. */
const calbeeFirst = (rows: string[][]) => [...rows.filter((r) => r[0] === site.name), ...rows.filter((r) => r[0] !== site.name)];

function ToolCard({ tool }: { tool: ToolReview }) {
  const ours = tool.name === site.name;
  const rows = Math.max(tool.pros.length, tool.cons.length);
  const label = "bg-surface px-5 py-4 text-left align-top font-medium text-fg";
  const cell = "px-5 py-4 align-top text-fg/85";
  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[560px] table-fixed border-collapse text-left text-[16px] leading-snug">
        <caption className="sr-only">{tool.name} at a glance</caption>
        <colgroup>
          <col className="w-[28%]" />
          <col />
        </colgroup>
        <thead>
          <tr className="border-b border-line bg-surface">
            <th scope="colgroup" colSpan={2} className="px-5 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-serif text-[24px] font-normal">
                  {tool.name} <span className="text-faint font-sans text-[14px]">({tool.platforms})</span>
                </span>
                <a
                  href={tool.url}
                  rel={ours ? undefined : "nofollow noopener"}
                  target={ours ? undefined : "_blank"}
                  className="text-[14px] font-normal underline underline-offset-[3px]">
                  {ours ? `Try ${site.name} free` : `Visit ${tool.name}`} ↗
                </a>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          <tr>
            <th scope="row" className={`${label} border-r border-line`}>Best for</th>
            <td className={cell}>{tool.bestFor}</td>
          </tr>
          <tr>
            <th scope="row" className={`${label} border-r border-line`}>Pricing</th>
            <td className={cell}>{tool.pricing}</td>
          </tr>
        </tbody>
      </table>
      <table className="w-full min-w-[560px] table-fixed border-collapse border-t border-line text-left text-[16px] leading-snug">
        <caption className="sr-only">{tool.name} pros and cons</caption>
        <thead>
          <tr className="border-b border-line bg-surface">
            <th scope="col" className="w-1/2 border-r border-line px-5 py-3.5 font-medium">
              <span className="text-emerald-400" aria-hidden>✓ </span>Pros
            </th>
            <th scope="col" className="w-1/2 px-5 py-3.5 font-medium">
              <span className="text-red-400" aria-hidden>✕ </span>Cons
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {Array.from({ length: rows }, (_, i) => (
            <tr key={i}>
              <td className={`${cell} border-r border-line`}>{tool.pros[i] ?? ""}</td>
              <td className={cell}>{tool.cons[i] ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
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

  const pitch = pitchFor(a.slug);
  // One banner early, one small note further down, like a magazine's in-article ads; never on the first section.
  const bannerAt = Math.min(2, a.sections.length - 1);
  const noteAt = a.sections.findIndex((s, i) => i > bannerAt && !s.tool && (s.paragraphs?.length ?? 0) > 0);

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
        </header>

        <div className="mx-auto mt-12 max-w-[1000px]">
          {BLOG_FIGURES[a.slug] ? (
            <figure className="mx-auto max-w-[720px] overflow-hidden rounded-2xl border border-line bg-[#131313]">
              {/* eslint-disable-next-line @next/next/no-img-element -- a static SVG drawing, nothing to optimise */}
              <img src={`/blog-figures/${BLOG_FIGURES[a.slug]}.svg?v=${FIGURE_VERSION}`} alt="" className="block h-auto w-full" />
            </figure>
          ) : (
            <ReleaseShot image={pitchFor(a.slug).shot} priority />
          )}
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
                <section key={s.heading} className="flow-root">
                  {i === bannerAt && <PromoBanner pitch={pitch} />}
                  <h2 id={docSlug(s.heading)} className="text-fg mt-14 scroll-mt-24 text-[30px] leading-tight tracking-[-0.02em]">
                    {s.heading}
                  </h2>
                  {s.tool && <ToolCard tool={s.tool} />}
                  {i === noteAt && s.paragraphs?.length ? <PromoNote /> : null}
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
                          {calbeeFirst(s.table.rows).map((row) => (
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
              <div className="rounded-xl bg-[#cdbdff] p-6 text-black">
                <p className="font-serif text-[26px] leading-[1.12]">{pitch.title}</p>
                <p className="mt-3 text-[15px] leading-relaxed text-black/75">{pitch.body}</p>
                <a
                  href={signupUrl}
                  className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-md bg-black px-4 text-[14px] font-medium text-white transition hover:bg-black/85">
                  Get started
                </a>
                <p className="mt-2 text-center text-[12px] text-black/60">Free forever. No credit card.</p>
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
