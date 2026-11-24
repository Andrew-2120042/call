import type { Metadata } from "next";
import Link from "next/link";
import { ReleaseCollage } from "@/components/release-collage";
import { Container } from "@/components/ui";
import { releases } from "@/content/releases";
import { site } from "@/site.config";

export const metadata: Metadata = {
  title: `Changelog: what's new in ${site.name}`,
  description: `Every ${site.name} release, newest first: new features, improvements and fixes.`,
  alternates: { canonical: "/changelog" },
};

export const releaseDate = (iso: string, label?: string) =>
  label ?? new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

export default function ChangelogIndex() {
  return (
    <Container className="max-w-4xl pt-16 pb-24">
      <p className="text-muted text-[13px] font-medium uppercase tracking-[0.14em]">Changelog</p>
      <h1 className="mt-3 text-[44px] leading-[1.05] tracking-[-0.025em] sm:text-[60px]">What's new in {site.name}</h1>
      <p className="text-fg/75 mt-4 text-[18px]">Every release, newest first.</p>
      <div className="mt-12 space-y-14">
        {releases.map((r) => (
          <article key={r.slug} className="border-t border-line pt-10">
            <p className="text-faint text-[13px]">
              <span className="text-fg font-mono">{r.version}</span> · {releaseDate(r.date, r.dateLabel)}
            </p>
            <Link href={`/changelog/${r.slug}`} className="group">
              <h2 className="mt-2 text-[30px] leading-tight tracking-[-0.02em] group-hover:underline">{r.title}</h2>
            </Link>
            <p className="text-fg/80 mt-3 text-[17px] leading-relaxed">{r.intro}</p>
            <div className="mt-6"><ReleaseCollage release={r} compact /></div>
            <Link href={`/changelog/${r.slug}`} className="mt-5 inline-block text-[15px] underline underline-offset-[3px]">Read the {r.version} notes →</Link>
          </article>
        ))}
      </div>
    </Container>
  );
}
