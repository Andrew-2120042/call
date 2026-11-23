import type { Article, BlogCategory } from "@/content/articles";

export const BLOG_CATEGORIES: BlogCategory[] = ["Best apps", "Alternatives", "Comparisons", "Grow your practice", "How-to"];

export const categoryOf = (a: Article): BlogCategory => a.category ?? "How-to";

/** Rough reading time at 230 words a minute, counting every visible bit of text. */
export function readingMinutes(a: Article) {
  const text = [
    a.answer,
    ...a.sections.flatMap((s) => [
      ...(s.paragraphs ?? []),
      ...(s.bullets ?? []),
      ...(s.table?.rows.flat() ?? []),
      ...(s.tool ? [s.tool.bestFor, s.tool.pricing, ...s.tool.pros, ...s.tool.cons] : []),
    ]),
    ...a.faq.flatMap((f) => [f.q, f.a]),
  ].join(" ");
  return Math.max(3, Math.round(text.split(/\s+/).length / 230));
}
