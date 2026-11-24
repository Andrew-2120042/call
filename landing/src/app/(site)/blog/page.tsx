import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { pitchFor } from "@/components/blog-promo";
import type { Article } from "@/content/articles";
import { articles } from "@/content/articles";
import { docSlug } from "@/content/docs";
import { BLOG_CATEGORIES, categoryOf, readingMinutes } from "@/lib/blog";
import { site } from "@/site.config";

export const metadata: Metadata = {
  title: `The ${site.name} blog: scheduling tools, booking more clients and fewer no-shows`,
  description:
    "Honest reviews of meeting schedulers, Calendly and Cal.com alternatives, and practical guides to getting more clients on calls and filling cancelled appointments.",
  alternates: { canonical: "/blog" },
};

function Card({ a, large = false }: { a: Article; large?: boolean }) {
  return (
    <Link
      href={`/blog/${a.slug}`}
      className={`group flex flex-col rounded-xl border border-line p-4 transition hover:border-line-strong ${large ? "bg-surface sm:grid sm:grid-cols-[1.1fr_1fr] sm:items-center sm:gap-10 sm:p-6" : ""}`}>
      <div className="aspect-[16/9] overflow-hidden rounded-lg border border-line bg-surface">
        <Image src={pitchFor(a.slug).shot.src} alt={pitchFor(a.slug).shot.alt} width={800} height={450} sizes="(min-width: 1024px) 400px, 100vw" className="h-full w-full object-cover object-left-top" />
      </div>
      <div className={large ? "mt-5 sm:mt-0" : "mt-4 flex flex-1 flex-col px-1 pb-1"}>
      <p className="text-faint text-[11px] font-medium uppercase tracking-[0.12em]">{categoryOf(a)}</p>
      <p className={`mt-3 font-serif leading-[1.12] tracking-[-0.015em] group-hover:underline ${large ? "text-[34px] sm:text-[44px]" : "text-[22px]"}`}>
        {a.title}
      </p>
      <p className={`text-muted mt-3 leading-relaxed ${large ? "max-w-[60ch] text-[16px]" : "text-[14px]"}`}>{a.description}</p>
      <p className="text-faint mt-auto pt-5 text-[12px]">{readingMinutes(a)} min read</p>
      </div>
    </Link>
  );
}

export default function BlogIndex() {
  const [featured, ...rest] = articles;
  return (
    <div className="mx-auto max-w-[1160px] px-5 pt-14 pb-24 sm:px-8">
      <header className="max-w-[720px]">
        <p className="text-muted text-[12px] font-medium uppercase tracking-[0.14em]">Blog</p>
        <h1 className="mt-3 text-[44px] leading-[1.04] tracking-[-0.025em] sm:text-[60px]">The {site.name} blog</h1>
        <p className="text-fg/75 mt-4 text-[18px] leading-relaxed">
          Honest reviews of scheduling tools, and practical ways to get more clients on calls and keep your calendar full.
        </p>
      </header>

      <nav aria-label="Categories" className="mt-8 flex flex-wrap gap-2 text-[13px]">
        {BLOG_CATEGORIES.filter((c) => articles.some((a) => categoryOf(a) === c)).map((c) => (
          <a key={c} href={`#${docSlug(c)}`} className="rounded-full border border-line px-3.5 py-1.5 hover:border-line-strong">
            {c}
          </a>
        ))}
      </nav>

      <div className="mt-10">
        <Card a={featured} large />
      </div>

      {BLOG_CATEGORIES.map((c) => {
        const inCategory = rest.filter((a) => categoryOf(a) === c);
        if (!inCategory.length) return null;
        return (
          <section key={c} id={docSlug(c)} className="mt-16 scroll-mt-24">
            <h2 className="text-[28px] tracking-[-0.02em]">{c}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {inCategory.map((a) => (
                <Card key={a.slug} a={a} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
