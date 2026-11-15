import type { MetadataRoute } from "next";
import { audiences, comparisons, features } from "@/content/site-content";
import { site } from "@/site.config";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number) => ({ url: `${site.url}${path}`, lastModified: now, priority });
  return [
    page("", 1),
    page("/pricing", 0.9),
    ...features.map((f) => page(`/features/${f.slug}`, 0.8)),
    ...comparisons.map((c) => page(`/compare/${c.slug}`, 0.8)),
    ...audiences.map((a) => page(`/for/${a.slug}`, 0.7)),
    page("/privacy", 0.2),
    page("/terms", 0.2),
  ];
}
