import type { ReactNode } from "react";
import type { ReleaseImage } from "@/content/releases";
import { ReleaseShot } from "./release-shot";
import { Container } from "./ui";

/** Shared building blocks for the feature, job and comparison pages, so they all have the same rhythm and type. */

export function PageHero({ eyebrow, badge, title, summary, actions, image }: { eyebrow: string; badge?: ReactNode; title: string; summary: string; actions: ReactNode; image?: ReleaseImage }) {
  return (
    <section className="pt-20 pb-20 sm:pt-28">
      <Container className="text-center">
        <div className="flex items-center justify-center gap-3">
          <p className="text-muted text-[13px] font-medium uppercase tracking-[0.16em]">{eyebrow}</p>
          {badge}
        </div>
        <h1 className="mx-auto mt-5 max-w-[18ch] text-[44px] leading-[1.04] tracking-[-0.03em] sm:text-[68px]">{title}</h1>
        <p className="text-fg/75 mx-auto mt-6 max-w-[56ch] text-[19px] leading-relaxed sm:text-[21px]">{summary}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">{actions}</div>
        {image && <div className="mx-auto mt-16 max-w-[1040px] text-left"><ReleaseShot image={image} priority /></div>}
      </Container>
    </section>
  );
}

export function Band({ title, intro, children, className = "" }: { title: string; intro?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`border-t border-line py-20 sm:py-28 ${className}`}>
      <Container>
        <div className="max-w-[46rem]">
          <h2 className="text-[34px] leading-[1.1] tracking-[-0.02em] sm:text-[44px]">{title}</h2>
          {intro && <p className="text-fg/70 mt-4 text-[18px] leading-relaxed">{intro}</p>}
        </div>
        <div className="mt-12">{children}</div>
      </Container>
    </section>
  );
}

/** A two-column statement: a small label on the left, one big sentence on the right. */
export function Statement({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="border-t border-line py-20 sm:py-28">
      <Container className="grid gap-6 lg:grid-cols-[260px_1fr] lg:gap-16">
        <p className="text-muted pt-2 text-[13px] font-medium uppercase tracking-[0.16em]">{label}</p>
        <p className="text-fg max-w-[34ch] font-serif text-[28px] leading-[1.3] tracking-[-0.015em] sm:text-[36px]">{children}</p>
      </Container>
    </section>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-surface p-7 sm:p-8 ${className}`}>{children}</div>;
}

export function Steps({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <ol className={`grid gap-5 ${steps.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
      {steps.map((s, i) => (
        <li key={s.title}>
          <Card className="h-full">
            <span className="bg-brand grid h-10 w-10 place-items-center rounded-full text-[16px] font-semibold text-black">{i + 1}</span>
            <h3 className="mt-6 font-sans text-[21px] font-medium leading-snug">{s.title}</h3>
            <p className="text-fg/70 mt-3 text-[17px] leading-relaxed">{s.body}</p>
          </Card>
        </li>
      ))}
    </ol>
  );
}
