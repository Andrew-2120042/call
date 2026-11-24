import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Band, Card, PageHero, Statement, Steps } from "@/components/page-kit";
import { Faq, FinalCta } from "@/components/sections";
import { BreadcrumbLd, ButtonLink, PlanBadge } from "@/components/ui";
import { FEATURE_SHOTS } from "@/content/page-shots";
import { features } from "@/content/site-content";
import { signupUrl, site } from "@/site.config";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => features.map((f) => ({ slug: f.slug }));

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const feature = features.find((f) => f.slug === slug);
  if (!feature) return {};
  return {
    title: feature.keyword,
    description: feature.summary,
    alternates: { canonical: `/features/${feature.slug}`, types: { "text/markdown": `/features/${feature.slug}.md` } },
    openGraph: { title: feature.title, description: feature.summary },
  };
}

export default async function FeaturePage({ params }: Params) {
  const { slug } = await params;
  const feature = features.find((f) => f.slug === slug);
  if (!feature) notFound();
  const others = features.filter((f) => f.slug !== feature.slug).slice(0, 3);
  return (
    <>
      <BreadcrumbLd siteUrl={site.url} trail={[{ name: "Features", path: "/features" }, { name: feature.name, path: `/features/${feature.slug}` }]} />
      <PageHero
        eyebrow={feature.name}
        badge={<PlanBadge plan={feature.plan} />}
        title={feature.title}
        summary={feature.summary}
        image={FEATURE_SHOTS[feature.slug]}
        actions={
          <>
            <ButtonLink href={signupUrl}>Try it free</ButtonLink>
            <ButtonLink href="/pricing" variant="secondary">See pricing</ButtonLink>
          </>
        }
      />
      <Statement label="The problem">{feature.problem}</Statement>
      <Band title="How it works">
        <Steps steps={feature.how} />
      </Band>
      <Faq items={feature.faq} />
      <Band title="More features">
        <div className="grid gap-5 md:grid-cols-3">
          {others.map((f) => (
            <Link key={f.slug} href={`/features/${f.slug}`} className="group">
              <Card className="h-full transition group-hover:border-line-strong">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted text-[13px] font-medium uppercase tracking-[0.14em]">{f.name}</span>
                  <PlanBadge plan={f.plan} />
                </div>
                <p className="mt-4 text-[21px] leading-snug">{f.title}</p>
                <span className="text-fg/60 mt-6 inline-block text-[15px] group-hover:text-fg">Learn more →</span>
              </Card>
            </Link>
          ))}
        </div>
      </Band>
      <FinalCta />
    </>
  );
}
