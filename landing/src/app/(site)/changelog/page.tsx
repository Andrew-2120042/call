import type { Metadata } from "next";
import Link from "next/link";
import { ReleaseShot } from "@/components/release-shot";
import { Container } from "@/components/ui";
import { releases } from "@/content/releases";
import { site } from "@/site.config";
import { releaseDate } from "./date";

export const metadata: Metadata = {
  title: `Changelog: what's new in ${site.name}`,
  description: `Every ${site.name} release, newest first: new features, improvements and fixes.`,
  alternates: { canonical: "/changelog" },
};

export default function ChangelogIndex() {
  return (
    <Container className="max-w-[880px] pt-16 pb-24">
      <p className="text-muted text-[13px] font-medium uppercase tracking-[0.14em]">Changelog</p>
      <h1 className="mt-3 text-[44px] leading-[1.05] tracking-[-0.025em] sm:text-[60px]">What's new in {site.name}</h1>
      <p className="text-fg/75 mt-4 text-[18px]">Every release, newest first.</p>
      <div className="mt-12 space-y-16">
        {releases.map((r, i) => (
          <article key={r.slug} className="border-t border-line pt-10">
            <p className="text-faint text-[13px]">
              {r.version && <><span className="text-fg font-mono">{r.version}</span> · </>}{releaseDate(r.date, r.dateLabel)}
            </p>
            <Link href={`/changelog/${r.slug}`} className="group block">
              <h2 className="mt-2 text-[30px] leading-tight tracking-[-0.02em] group-hover:underline">{r.title}</h2>
            </Link>
            <p className="text-fg/80 mt-3 text-[17px] leading-relaxed">{r.summary}</p>
            {r.image && (
              <Link href={`/changelog/${r.slug}`} className="mt-6 block">
                <ReleaseShot image={r.image} priority={i === 0} />
              </Link>
            )}
            <Link href={`/changelog/${r.slug}`} className="mt-5 inline-block text-[15px] underline underline-offset-[3px]">
              Read the full notes →
            </Link>
          </article>
        ))}
      </div>
    </Container>
  );
}
