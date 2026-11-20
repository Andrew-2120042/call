import Link from "next/link";
import { DocBlocks } from "@/components/docs/doc-blocks";
import { JsonLd } from "@/components/ui";
import { type DocPage, docs } from "@/content/docs";
import { site } from "@/site.config";

export function DocView({ page }: { page: DocPage }) {
  const index = docs.findIndex((d) => d.slug === page.slug);
  const prev = docs[index - 1];
  const next = docs[index + 1];
  const href = (d: DocPage) => (d.slug === "introduction" ? "/docs" : `/docs/${d.slug}`);
  return (
    <article className="mx-auto max-w-[760px] px-5 pt-10 pb-16 sm:px-10 lg:pt-14">
      <h1 className="text-[34px] font-normal leading-tight tracking-[-0.02em]">{page.title}</h1>
      <p className="text-muted mt-1.5 text-[13px]">{page.description}</p>
      <p className="text-faint mt-8 text-[10px] font-medium uppercase tracking-[0.16em]">{page.eyebrow}</p>
      <DocBlocks blocks={page.blocks} />
      <nav className="mt-14 grid gap-3 border-t border-line pt-6 sm:grid-cols-2" aria-label="More docs">
        {prev ? (
          <Link href={href(prev)} className="rounded-lg border border-line px-4 py-3 transition hover:border-line-strong">
            <span className="text-faint block text-[11px]">Previous</span>
            <span className="text-[13px]">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={href(next)} className="rounded-lg border border-line px-4 py-3 text-right transition hover:border-line-strong">
            <span className="text-faint block text-[11px]">Next</span>
            <span className="text-[13px]">{next.title}</span>
          </Link>
        )}
      </nav>
      <p className="text-faint mt-10 text-[11px]">© {new Date().getFullYear()} {site.name}</p>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: `${page.title} | ${site.name} docs`,
          description: page.description,
          url: `${site.url}${href(page)}`,
          publisher: { "@id": `${site.url}/#org` },
        }}
      />
    </article>
  );
}
