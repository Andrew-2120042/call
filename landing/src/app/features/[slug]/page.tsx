import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Faq, FinalCta } from "@/components/sections";
import { ButtonLink, Container, Eyebrow, PlanBadge } from "@/components/ui";
import { features } from "@/content/site-content";
import { signupUrl } from "@/site.config";

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
    alternates: { canonical: `/features/${feature.slug}` },
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
      <Container className="max-w-3xl pt-20">
        <div className="flex items-center gap-3">
          <Eyebrow>{feature.name}</Eyebrow>
          <PlanBadge plan={feature.plan} />
        </div>
        <h1 className="mt-4 text-4xl font-medium tracking-tight sm:text-5xl">{feature.title}</h1>
        <p className="text-muted mt-5 text-lg leading-relaxed">{feature.summary}</p>
        <div className="mt-8 flex gap-3">
          <ButtonLink href={signupUrl}>Try it free</ButtonLink>
          <ButtonLink href="/pricing" variant="secondary">Pricing</ButtonLink>
        </div>
      </Container>

      <Container className="max-w-3xl py-16">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <p className="text-faint text-xs font-medium uppercase tracking-[0.12em]">The problem</p>
          <p className="mt-3 leading-relaxed">{feature.problem}</p>
        </div>
        <h2 className="mt-14 text-2xl font-medium tracking-tight">How it works</h2>
        <ol className="mt-6 space-y-6">
          {feature.how.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="grid h-7 w-7 flex-none place-items-center rounded-full border border-line-strong text-xs">{i + 1}</span>
              <div>
                <h3 className="font-medium">{step.title}</h3>
                <p className="text-muted mt-1 text-sm leading-relaxed">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>

      <Faq items={feature.faq} />

      <Container className="py-8">
        <h2 className="text-lg font-medium">More features</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {others.map((f) => (
            <Link key={f.slug} href={`/features/${f.slug}`} className="rounded-xl border border-line bg-surface p-4 text-sm transition hover:border-line-strong">
              <span className="font-medium">{f.name}</span>
              <span className="text-muted mt-1 block">{f.title}</span>
            </Link>
          ))}
        </div>
      </Container>
      <FinalCta />
    </>
  );
}
