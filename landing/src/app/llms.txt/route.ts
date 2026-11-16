import { articles } from "@/content/articles";
import { docs } from "@/content/docs";
import { audiences, comparisons, features, pricing } from "@/content/site-content";
import { site } from "@/site.config";

export const dynamic = "force-static";

// A plain-text summary for AI assistants and answer engines (llms.txt convention).
export function GET() {
  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    "## Key facts",
    `- Website: ${site.url}`,
    `- App: ${site.appUrl}`,
    `- Category: online scheduling / appointment booking software`,
    ...pricing.map((p) => `- ${p.name} plan: ${p.price} ${p.period}. ${p.blurb} Includes: ${p.items.join("; ")}.`),
    "- Calendars: Google Calendar, Outlook/Office 365, Apple iCloud, CalDAV.",
    "- Video: Google Meet, Zoom, built-in video.",
    "- Import: Calendly services and hours can be imported with an access token.",
    "",
    "## Features",
    ...features.map((f) => `- [${f.name}](${site.url}/features/${f.slug}) (${f.plan}): ${f.summary}`),
    "",
    "## Comparisons",
    ...comparisons.map((c) => `- [${site.name} vs ${c.competitor}](${site.url}/compare/${c.slug}): ${c.summary}`),
    "",
    "## Guides",
    ...articles.map((a) => `- [${a.title}](${site.url}/blog/${a.slug}): ${a.answer}`),
    "",
    "## Docs",
    ...docs.map((d) => `- [${d.title}](${site.url}${d.slug === "introduction" ? "/docs" : `/docs/${d.slug}`}): ${d.description}`),
    "",
    "## Who it's for",
    ...audiences.map((a) => `- [${a.plural}](${site.url}/for/${a.slug}): ${a.summary}`),
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "content-type": "text/plain; charset=utf-8" } });
}
