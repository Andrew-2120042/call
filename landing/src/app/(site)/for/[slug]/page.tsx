import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Band, Card, PageHero, Statement } from "@/components/page-kit";
import { Faq, FinalCta } from "@/components/sections";
import { BreadcrumbLd, ButtonLink, PlanBadge } from "@/components/ui";
import { FEATURE_SHOTS } from "@/content/page-shots";
import { audiences, features } from "@/content/site-content";
import { signupUrl, site } from "@/site.config";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => audiences.map((a) => ({ slug: a.slug }));

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const a = audiences.find((x) => x.slug === slug);
  if (!a) return {};
  return { title: a.title, description: a.summary, alternates: { canonical: `/for/${a.slug}`, types: { "text/markdown": `/for/${a.slug}.md` } } };
}

export default async function AudiencePage({ params }: Params) {
  const { slug } = await params;
  const a = audiences.find((x) => x.slug === slug);
  if (!a) notFound();
  const picked = a.highlights.map((s) => features.find((f) => f.slug === s)).filter((f) => f !== undefined);
  return (
    <>
      <BreadcrumbLd siteUrl={site.url} trail={[{ name: `For ${a.plural}`, path: `/for/${a.slug}` }]} />
      <PageHero
        eyebrow={`For ${a.plural}`}
        title={a.title}
        summary={a.summary}
        image={FEATURE_SHOTS[a.highlights[0]]}
        actions={
          <>
            <ButtonLink href={signupUrl}>Sign up free</ButtonLink>
            <ButtonLink href="/pricing" variant="secondary">See pricing</ButtonLink>
          </>
        }
      />

      <Band title="Sound familiar?">
        <div className="grid gap-5 md:grid-cols-3">
          {a.pains.map((p) => (
            <Card key={p}><p className="text-[21px] leading-snug">{p}</p></Card>
          ))}
        </div>
      </Band>

      <Band title="What helps most" intro={`The three ${site.name} features ${a.plural} use most.`}>
        <div className="grid gap-5 md:grid-cols-3">
          {picked.map((f) => (
            <Link key={f.slug} href={`/features/${f.slug}`} className="group">
              <Card className="h-full transition group-hover:border-line-strong">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-sans text-[21px] font-medium">{f.name}</h3>
                  <PlanBadge plan={f.plan} />
                </div>
                <p className="text-fg/70 mt-4 text-[17px] leading-relaxed">{f.summary}</p>
                <span className="text-fg/60 mt-6 inline-block text-[15px] group-hover:text-fg">How it works →</span>
              </Card>
            </Link>
          ))}
        </div>
      </Band>

      <Statement label="In practice">{a.example}</Statement>

      {a.services && (
        <Band title="Services to set up first" intro="A starting point you can change in a minute.">
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[560px] text-left text-[17px]">
              <thead className="bg-surface">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">Service</th>
                  <th scope="col" className="px-6 py-4 font-medium">Length</th>
                  <th scope="col" className="px-6 py-4 font-medium">How to set it up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {a.services.map((sv) => (
                  <tr key={sv.name}>
                    <th scope="row" className="px-6 py-5 font-medium">{sv.name}</th>
                    <td className="text-fg/70 whitespace-nowrap px-6 py-5">{sv.length}</td>
                    <td className="text-fg/70 px-6 py-5 leading-relaxed">{sv.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Band>
      )}

      {a.faq && <Faq items={a.faq} title={`Questions from ${a.plural}`} />}
      <FinalCta title={`A booking link made for ${a.plural}`} />
    </>
  );
}
