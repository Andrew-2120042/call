import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FinalCta } from "@/components/sections";
import { BreadcrumbLd, ButtonLink, Container, Eyebrow, PlanBadge } from "@/components/ui";
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
  const picked = a.highlights.map((slug) => features.find((f) => f.slug === slug)).filter((f) => f !== undefined);
  return (
    <>
      <BreadcrumbLd siteUrl={site.url} trail={[{ name: `For ${a.plural}`, path: `/for/${a.slug}` }]} />
      <Container className="max-w-3xl pt-20">
        <Eyebrow>For {a.plural}</Eyebrow>
        <h1 className="mt-4 text-[40px] font-normal leading-[1.05] tracking-[-0.025em] sm:text-[60px]">{a.title}</h1>
        <p className="text-muted mt-5 text-lg leading-relaxed">{a.summary}</p>
        <div className="mt-8"><ButtonLink href={signupUrl}>Sign up free</ButtonLink></div>
      </Container>
      <Container className="max-w-3xl py-14">
        <h2 className="text-2xl font-normal tracking-[-0.02em]">Sound familiar?</h2>
        <ul className="mt-5 space-y-2">
          {a.pains.map((p) => (
            <li key={p} className="text-muted flex gap-3"><span className="text-faint">—</span>{p}</li>
          ))}
        </ul>
        <h2 className="mt-14 text-2xl font-normal tracking-[-0.02em]">What helps most</h2>
        <div className="mt-6 grid gap-3">
          {picked.map((f) => (
            <Link key={f.slug} href={`/features/${f.slug}`} className="rounded-2xl border border-line bg-surface p-5 transition hover:border-line-strong">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-sans font-medium">{f.name}</h3>
                <PlanBadge plan={f.plan} />
              </div>
              <p className="text-muted mt-2 text-sm leading-relaxed">{f.summary}</p>
            </Link>
          ))}
        </div>
        <div className="mt-14 rounded-2xl border border-line bg-surface p-6">
          <p className="text-faint text-xs font-medium uppercase tracking-[0.12em]">In practice</p>
          <p className="mt-3 leading-relaxed">{a.example}</p>
        </div>
      </Container>
      <FinalCta title={`A booking link made for ${a.plural}`} />
    </>
  );
}
