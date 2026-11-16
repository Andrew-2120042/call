import type { ReactNode } from "react";
import { type NavPage, SideNav } from "@/components/docs/side-nav";
import { articles } from "@/content/articles";
import { site } from "@/site.config";

const navPages: NavPage[] = [
  { href: "/blog", title: "All guides", icon: "list", headings: [], text: "" },
  ...articles.map((a) => ({
    href: `/blog/${a.slug}`,
    title: a.keyword[0].toUpperCase() + a.keyword.slice(1),
    icon: "book" as const,
    headings: a.sections.map((s) => s.heading),
    text: JSON.stringify(a).toLowerCase(),
  })),
];

export default function GuidesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="lg:flex">
      <SideNav pages={navPages} label="guides" homeHref="/blog" siteName={site.name} supportEmail={site.supportEmail} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
