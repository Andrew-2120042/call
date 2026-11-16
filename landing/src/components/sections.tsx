import { signupUrl, site } from "@/site.config";
import { ButtonLink, Container, JsonLd } from "./ui";

export function Faq({ items, title = "Questions & answers" }: { items: { q: string; a: string }[]; title?: string }) {
  return (
    <section className="border-t border-line py-24">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.7fr]">
        <div>
          <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">{title}</h2>
          <p className="text-muted mt-3 max-w-[30ch] text-sm leading-relaxed">
            Anything else? Email{" "}
            <a href={`mailto:${site.supportEmail}`} className="text-fg underline decoration-line-strong underline-offset-4 hover:decoration-fg">
              {site.supportEmail}
            </a>{" "}
            and a person will reply.
          </p>
        </div>
        <div className="divide-y divide-line border-y border-line">
          {items.map((item) => (
            <details key={item.q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-medium transition hover:text-fg [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="text-faint grid h-5 w-5 flex-none place-items-center rounded-full border border-line-strong text-xs transition group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="text-muted max-w-[62ch] pb-5 text-sm leading-relaxed">{item.a}</p>
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
        <div data-reveal className="rounded-3xl border border-line bg-surface px-6 py-14 text-center">
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
