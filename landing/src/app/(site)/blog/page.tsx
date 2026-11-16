import type { Metadata } from "next";
import Link from "next/link";
import { FinalCta } from "@/components/sections";
import { Container, Eyebrow } from "@/components/ui";
import { articles } from "@/content/articles";

export const metadata: Metadata = {
  title: "Guides: scheduling, Calendly vs Cal.com, no-shows and waitlists",
  description: "Practical guides on online scheduling: comparisons, pricing explained, round robin, filling cancellations and reducing no-shows.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  return (
    <>
      <Container className="max-w-3xl pt-20">
        <Eyebrow>Guides</Eyebrow>
        <h1 className="mt-4 text-4xl font-medium tracking-tight sm:text-5xl">Guides and comparisons</h1>
        <p className="text-muted mt-4 text-lg">Straight answers about scheduling tools and running a full calendar.</p>
      </Container>
      <Container className="max-w-3xl py-12">
        <div className="divide-y divide-line border-y border-line">
          {articles.map((a) => (
            <Link key={a.slug} href={`/blog/${a.slug}`} className="group block py-6">
              <h2 className="text-lg font-medium transition group-hover:text-white">{a.title}</h2>
              <p className="text-muted mt-2 text-sm leading-relaxed">{a.description}</p>
            </Link>
          ))}
        </div>
      </Container>
      <FinalCta />
    </>
  );
}
