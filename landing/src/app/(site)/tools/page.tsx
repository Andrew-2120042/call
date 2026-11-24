import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { site } from "@/site.config";

export const metadata: Metadata = {
  title: `Free scheduling tools | ${site.name}`,
  description: "Free tools for scheduling across time zones: a time zone converter and a meeting planner. No sign-up.",
  alternates: { canonical: "/tools" },
};

const TOOLS = [
  { href: "/tools/time-zone-converter", name: "Time zone converter", body: "Convert a meeting time to any city, with daylight saving included." },
  { href: "/tools/meeting-planner", name: "Meeting planner", body: "Find the hours when people in up to six cities are all in working hours." },
];

export default function ToolsIndex() {
  return (
    <Container className="max-w-4xl pt-16 pb-24">
      <p className="text-muted text-[13px] font-medium uppercase tracking-[0.14em]">Tools</p>
      <h1 className="mt-3 text-[44px] leading-[1.05] tracking-[-0.025em] sm:text-[60px]">Free scheduling tools</h1>
      <p className="text-fg/75 mt-4 text-[18px]">Small tools for working across time zones. Free, no sign-up.</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {TOOLS.map((t) => (
          <Link key={t.href} href={t.href} className="group rounded-xl border border-line p-6 transition hover:border-line-strong">
            <p className="font-serif text-[26px] group-hover:underline">{t.name}</p>
            <p className="text-muted mt-2 text-[15px] leading-relaxed">{t.body}</p>
          </Link>
        ))}
      </div>
    </Container>
  );
}
