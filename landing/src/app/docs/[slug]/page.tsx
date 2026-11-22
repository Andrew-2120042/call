import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { docs, findDoc } from "@/content/docs";
import { DocView } from "../doc-view";

export const dynamicParams = false;

export function generateStaticParams() {
  return docs.filter((d) => d.slug !== "introduction").map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = findDoc((await params).slug);
  if (!page) return {};
  return { title: `${page.title} · Docs`, description: page.description, alternates: { canonical: `/docs/${page.slug}`, types: { "text/markdown": `/docs/${page.slug}.md` } } };
}

export default async function DocPageRoute({ params }: { params: Promise<{ slug: string }> }) {
  const page = findDoc((await params).slug);
  if (!page || page.slug === "introduction") notFound();
  return <DocView page={page} />;
}
