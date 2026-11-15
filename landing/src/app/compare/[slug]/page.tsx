import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FinalCta } from "@/components/sections";
import { ButtonLink, Container, Eyebrow } from "@/components/ui";
import { comparisons } from "@/content/site-content";
import { signupUrl, site } from "@/site.config";

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
    alternates: { canonical: `/compare/${c.slug}` },
  };
}

export default async function ComparePage({ params }: Params) {
  const { slug } = await params;
  const c = comparisons.find((x) => x.slug === slug);
  if (!c) notFound();
  return (
    <>
      <Container className="max-w-3xl pt-20">
        <Eyebrow>{site.name} vs {c.competitor}</Eyebrow>
        <h1 className="mt-4 text-4xl font-medium tracking-tight sm:text-5xl">{c.title}</h1>
        <p className="text-muted mt-5 text-lg leading-relaxed">{c.summary}</p>
      </Container>
      <Container className="max-w-3xl py-14">
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-surface">
              <tr>
                <th className="px-5 py-3 font-medium" scope="col"> </th>
                <th className="px-5 py-3 font-medium" scope="col">{site.name}</th>
                <th className="text-muted px-5 py-3 font-medium" scope="col">{c.competitor}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {c.rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row" className="px-5 py-3.5 font-normal">{row.label}</th>
                  <td className="px-5 py-3.5">{row.us}</td>
                  <td className="text-muted px-5 py-3.5">{row.them}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-faint mt-3 text-xs">Based on public information at the time of writing. Check each product for current details.</p>
        <p className="mt-10 leading-relaxed">{c.verdict}</p>
        <div className="mt-8 flex gap-3">
          <ButtonLink href={signupUrl}>Switch for free</ButtonLink>
          <ButtonLink href="/pricing" variant="secondary">Pricing</ButtonLink>
        </div>
      </Container>
      <FinalCta />
    </>
  );
}
