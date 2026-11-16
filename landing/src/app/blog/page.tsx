import type { Metadata } from "next";
import Link from "next/link";
import { articles } from "@/content/articles";
import { site } from "@/site.config";

export const metadata: Metadata = {
  title: "Guides: scheduling, Calendly vs Cal.com, no-shows and waitlists",
  description: "Practical guides on online scheduling: comparisons, pricing explained, round robin, filling cancellations and reducing no-shows.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  return (
    <div className="mx-auto max-w-[760px] px-5 pt-10 pb-16 sm:px-10 lg:pt-14">
      <h1 className="text-lg font-medium tracking-tight">Guides</h1>
      <p className="text-muted mt-1.5 text-[13px]">Straight answers about scheduling tools and running a full calendar.</p>
      <p className="text-faint mt-8 text-[10px] font-medium uppercase tracking-[0.16em]">All guides</p>
      <ul className="mt-3 divide-y divide-line border-y border-line">
        {articles.map((a) => (
          <li key={a.slug}>
            <Link href={`/blog/${a.slug}`} className="group block py-4">
              <p className="text-faint text-[11px]">{a.keyword[0].toUpperCase() + a.keyword.slice(1)}</p>
              <p className="mt-0.5 text-[13px] font-medium transition group-hover:text-white">{a.title}</p>
              <p className="text-muted mt-1 text-xs leading-relaxed">{a.description}</p>
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-faint mt-10 text-[11px]">© {new Date().getFullYear()} {site.name}</p>
    </div>
  );
}
