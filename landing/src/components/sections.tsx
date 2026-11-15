import { signupUrl } from "@/site.config";
import { ButtonLink, Container, JsonLd } from "./ui";

export function Faq({ items, title = "Questions" }: { items: { q: string; a: string }[]; title?: string }) {
  return (
    <section className="py-20">
      <Container className="max-w-3xl">
        <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">{title}</h2>
        <div className="mt-8 divide-y divide-line border-y border-line">
          {items.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium">
                {item.q}
                <span className="text-faint transition group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <p className="text-muted mt-3 text-sm leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </Container>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
        }}
      />
    </section>
  );
}

export function FinalCta({ title = "Get your booking link in two minutes" }: { title?: string }) {
  return (
    <section className="py-16">
      <Container>
        <div className="rounded-3xl border border-line bg-surface px-6 py-14 text-center">
          <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">{title}</h2>
          <p className="text-muted mx-auto mt-3 max-w-[48ch] text-sm sm:text-base">
            Free forever for one person. Upgrade only when you want the waitlist, no-show protection or a team.
          </p>
          <div className="mt-7 flex justify-center gap-3">
            <ButtonLink href={signupUrl}>Sign up free</ButtonLink>
            <ButtonLink href="/pricing" variant="secondary">See pricing</ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
