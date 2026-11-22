import type { MetadataRoute } from "next";
import { articles } from "@/content/articles";
import { docs } from "@/content/docs";
import { audiences, comparisons, features } from "@/content/site-content";
import { site } from "@/site.config";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number) => ({ url: `${site.url}${path}`, lastModified: now, priority });
  return [
    page("", 1),
    page("/pricing", 0.9),
    page("/ai", 0.6),
    ...features.map((f) => page(`/features/${f.slug}`, 0.8)),
    ...comparisons.map((c) => page(`/compare/${c.slug}`, 0.8)),
    ...audiences.map((a) => page(`/for/${a.slug}`, 0.7)),
    page("/blog", 0.7),
    ...articles.map((a) => ({ url: `${site.url}/blog/${a.slug}`, lastModified: new Date(`${a.updated}T00:00:00Z`), priority: 0.8 })),
    ...docs.map((d) => page(d.slug === "introduction" ? "/docs" : `/docs/${d.slug}`, 0.6)),
    page("/privacy", 0.2),
    page("/terms", 0.2),
  ];
}
