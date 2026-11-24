import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FinalCta } from "@/components/sections";
import { Band, Card, PageHero, Statement } from "@/components/page-kit";
import { BreadcrumbLd, ButtonLink } from "@/components/ui";
import { COMPARE_SHOT } from "@/content/page-shots";
import { comparisons } from "@/content/site-content";
import { signupUrl, site } from "@/site.config";

// The long-form guide that compares every alternative, for readers who want more than this one-on-one.
const GUIDES: Record<string, string> = {
  "calendly-alternative": "/blog/calendly-alternatives",
  "cal-com-alternative": "/blog/cal-com-alternatives",
};

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => comparisons.map((c) => ({ slug: c.slug }));

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const c = comparisons.find((x) => x.slug === slug);
  if (!c) return {};
  return {
    title: `${c.competitor} alternative: ${site.name} vs ${c.competitor}`,
    description: c.summary,
    alternates: { canonical: `/compare/${c.slug}`, types: { "text/markdown": `/compare/${c.slug}.md` } },
  };
}

export default async function ComparePage({ params }: Params) {
  const { slug } = await params;
  const c = comparisons.find((x) => x.slug === slug);
  if (!c) notFound();
  return (
    <>
      <BreadcrumbLd siteUrl={site.url} trail={[{ name: `${c.competitor} alternative`, path: `/compare/${c.slug}` }]} />
      <PageHero
        eyebrow={`${site.name} vs ${c.competitor}`}
        title={c.title}
        summary={c.summary}
        image={COMPARE_SHOT}
        actions={
          <>
            <ButtonLink href={signupUrl}>Switch for free</ButtonLink>
            <ButtonLink href="/pricing" variant="secondary">See pricing</ButtonLink>
          </>
        }
      />
      <Band title={`${site.name} and ${c.competitor}, side by side`}>
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[600px] text-left text-[17px]">
            <thead className="bg-surface">
              <tr>
                <th className="px-6 py-4 font-medium" scope="col"><span className="sr-only">Feature</span></th>
                <th className="px-6 py-4 font-medium" scope="col">{site.name}</th>
                <th className="text-fg/60 px-6 py-4 font-medium" scope="col">{c.competitor}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {c.rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row" className="px-6 py-5 font-normal">{row.label}</th>
                  <td className="px-6 py-5 font-medium">{row.us}</td>
                  <td className="text-fg/60 px-6 py-5">{row.them}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-faint mt-4 text-[14px]">Based on public information at the time of writing. Check each product for current details.</p>
      </Band>
      <Statement label="Our take">{c.verdict}</Statement>
      {GUIDES[c.slug] && (
        <Band title={`Comparing more than ${c.competitor}?`}>
          <Link href={GUIDES[c.slug]} className="group block max-w-xl">
            <Card className="transition group-hover:border-line-strong">
              <p className="text-[21px] leading-snug">Every {c.competitor} alternative compared, with prices and who each one suits</p>
              <span className="text-fg/60 mt-6 inline-block text-[15px] group-hover:text-fg">Read the full guide →</span>
            </Card>
          </Link>
        </Band>
      )}
      <FinalCta />
    </>
  );
}
