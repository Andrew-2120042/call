import { type Article, articles } from "@/content/articles";
import { type DocBlock, type DocPage, docs } from "@/content/docs";
import {
  type Audience,
  audiences,
  type Comparison,
  comparisons,
  type Feature,
  features,
  homeFaq,
  pricing,
  pricingCompare,
} from "@/content/site-content";
import { type TemplatePage, templates } from "@/content/templates";
import { site } from "@/site.config";

// Plain Markdown copies of every page, built from the same content as the HTML pages, so AI assistants and
// answer engines can read the site without parsing layout. Served at <page>.md, /llms.txt and /llms-full.txt.

const abs = (path: string) => `${site.url}${path}`;
const table = (head: string[], rows: string[][]) =>
  [`| ${head.join(" | ")} |`, `| ${head.map(() => "---").join(" | ")} |`, ...rows.map((r) => `| ${r.join(" | ")} |`)].join(
    "\n"
  );
const faq = (items: { q: string; a: string }[]) => items.map((i) => `### ${i.q}\n\n${i.a}`).join("\n\n");
const cell = (value: string | boolean) => (value === true ? "Yes" : value === false ? "No" : value);

export const docPath = (d: DocPage) => (d.slug === "introduction" ? "/docs" : `/docs/${d.slug}`);

function pricingSummary() {
  return pricing
    .map((p) => `### ${p.name}: ${p.price}\n\n${p.period}. ${p.blurb}\n\n${p.items.map((i) => `- ${i}`).join("\n")}`)
    .join("\n\n");
}

export function homeMd() {
  return [
    `# ${site.name}: ${site.tagline}`,
    site.description,
    "## What it does",
    features.map((f) => `- **${f.name}** (${f.plan}): ${f.summary} [More](${abs(`/features/${f.slug}`)})`).join("\n"),
    "## Pricing",
    pricingSummary(),
    `Full plan comparison: ${abs("/pricing")}`,
    "## Who it's for",
    audiences.map((a) => `- [${a.plural}](${abs(`/for/${a.slug}`)}): ${a.summary}`).join("\n"),
    "## Questions",
    faq(homeFaq),
    `Sign up free: ${site.appUrl}/signup`,
  ].join("\n\n");
}

export function pricingMd() {
  const head = ["", ...pricing.map((p) => `${p.name} (${p.price})`)];
  return [
    `# ${site.name} pricing`,
    "Free for one person with unlimited services and bookings. Pro is $12 a month. Team is $69 a month for up to 10 people, then $10 per extra person. Prices in US dollars, excluding taxes. No credit card needed to start.",
    pricingSummary(),
    "## Compare all plans",
    pricingCompare
      .map((g) => `### ${g.group}\n\n${table(head, g.rows.map((r) => [r.label, ...r.values.map(cell)]))}`)
      .join("\n\n"),
    "## Pricing questions",
    faq(homeFaq),
  ].join("\n\n");
}

export function featureMd(f: Feature) {
  return [
    `# ${f.title}`,
    `Plan: ${f.plan}. ${f.summary}`,
    "## The problem",
    f.problem,
    "## How it works",
    f.how.map((h, i) => `${i + 1}. **${h.title}.** ${h.body}`).join("\n"),
    "## Questions",
    faq(f.faq),
  ].join("\n\n");
}

export function comparisonMd(c: Comparison) {
  return [
    `# ${site.name} vs ${c.competitor}: ${c.title}`,
    c.summary,
    table(["", site.name, c.competitor], c.rows.map((r) => [r.label, r.us, r.them])),
    "## Verdict",
    c.verdict,
  ].join("\n\n");
}

export function audienceMd(a: Audience) {
  const highlighted = a.highlights.map((slug) => features.find((f) => f.slug === slug)).filter((f) => !!f);
  return [
    `# ${a.title}`,
    a.summary,
    "## What gets in the way",
    a.pains.map((p) => `- ${p}`).join("\n"),
    `## What ${site.name} does about it`,
    highlighted.map((f) => `- **${f.name}** (${f.plan}): ${f.summary}`).join("\n"),
    "## Example",
    a.example,
  ].join("\n\n");
}

export function articleMd(a: Article) {
  const sections = a.sections.map((s) =>
    [
      `## ${s.heading}`,
      s.tool &&
        [
          `**${s.tool.name}** (${s.tool.platforms}). Best for: ${s.tool.bestFor}.`,
          `Pros: ${s.tool.pros.join("; ")}.`,
          `Cons: ${s.tool.cons.join("; ")}.`,
          `Pricing: ${s.tool.pricing}`,
        ].join("\n\n"),
      ...(s.paragraphs ?? []),
      s.bullets?.map((b) => `- ${b}`).join("\n"),
      s.table && table(s.table.head, s.table.rows),
    ]
      .filter(Boolean)
      .join("\n\n")
  );
  return [
    `# ${a.title}`,
    `Updated ${a.updated}.`,
    a.answer,
    ...sections,
    "## Questions",
    faq(a.faq),
    "## Sources",
    a.sources.map((s) => `- [${s.label}](${s.url})`).join("\n"),
  ].join("\n\n");
}

function blockMd(b: DocBlock): string | null {
  switch (b.type) {
    case "p":
    case "note":
      return b.text;
    case "h2":
      return `## ${b.text}`;
    case "h3":
      return `### ${b.text}`;
    case "steps":
      return b.items.map((item, i) => `${i + 1}. ${item}`).join("\n");
    case "list":
      return b.items.map((item) => `- ${item}`).join("\n");
    case "table":
      return table(b.head, b.rows);
    case "code":
      return `\`\`\`\n${b.text}\n\`\`\``;
    case "changes":
      return b.items.map((c) => `- **${c.date}, ${c.title}:** ${c.body}`).join("\n");
    case "image":
      return null;
  }
}

export function docMd(d: DocPage) {
  return [`# ${d.title}`, d.description, ...d.blocks.map(blockMd).filter((b) => b !== null)].join("\n\n");
}

export function templateMd(t: TemplatePage) {
  return [
    `# ${t.title}`,
    t.answer,
    "## When to use it",
    t.whenToUse.map((w) => `- ${w}`).join("\n"),
    ...t.variants.map((v) => `## ${v.name}\n\n${v.note ? `${v.note}\n\n` : ""}\`\`\`\n${v.text}\n\`\`\``),
    "## Tips",
    t.tips.map((tip) => `- ${tip}`).join("\n"),
    "## Questions",
    faq(t.faq),
  ].join("\n\n");
}

/** Every public page as [path, markdown], in sitemap order. */
export function allPagesMd(): [string, string][] {
  return [
    ["/", homeMd()],
    ["/pricing", pricingMd()],
    ...features.map((f): [string, string] => [`/features/${f.slug}`, featureMd(f)]),
    ...comparisons.map((c): [string, string] => [`/compare/${c.slug}`, comparisonMd(c)]),
    ...audiences.map((a): [string, string] => [`/for/${a.slug}`, audienceMd(a)]),
    ...articles.map((a): [string, string] => [`/blog/${a.slug}`, articleMd(a)]),
    ...templates.map((t): [string, string] => [`/templates/${t.slug}`, templateMd(t)]),
    ...docs.map((d): [string, string] => [docPath(d), docMd(d)]),
  ];
}

/** Markdown for one page path (without the .md), or null if there is no such page. */
export function pageMd(path: string): string | null {
  const found = allPagesMd().find(([p]) => p === path);
  return found ? found[1] : null;
}

export const markdownResponse = (body: string) =>
  new Response(`${body.trim()}\n`, {
    headers: { "content-type": "text/markdown; charset=utf-8", "x-robots-tag": "noindex, follow" },
  });
