import type { ReactNode } from "react";
import { SideNav } from "@/components/docs/side-nav";
import { docs } from "@/content/docs";
import { site } from "@/site.config";

const navPages = docs.map((d) => ({
  href: d.slug === "introduction" ? "/docs" : `/docs/${d.slug}`,
  title: d.title,
  icon: d.icon,
  headings: d.blocks.flatMap((b) => (b.type === "h2" ? [b.text] : [])),
  // Lower-cased page text so the sidebar search can match words inside pages, not just titles.
  text: JSON.stringify(d.blocks).toLowerCase(),
}));

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="lg:flex">
      <SideNav pages={navPages} label="docs" homeHref="/docs" siteName={site.name} supportEmail={site.supportEmail} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
