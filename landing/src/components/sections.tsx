import { signupUrl, site } from "@/site.config";
import { ButtonLink, Container, JsonLd } from "./ui";

export function Faq({ items, title = "Questions & answers" }: { items: { q: string; a: string }[]; title?: string }) {
  return (
    <section className="border-t border-line py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.7fr]">
        <div>
          <h2 className="text-[34px] leading-[1.1] tracking-[-0.02em] sm:text-[44px]">{title}</h2>
          <p className="text-muted mt-4 max-w-[30ch] text-[16px] leading-relaxed">
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
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[18px] font-medium transition hover:text-fg [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="text-faint grid h-7 w-7 flex-none place-items-center rounded-full border border-line-strong text-xs transition group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="text-fg/70 max-w-[62ch] pb-6 text-[17px] leading-relaxed">{item.a}</p>
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
    <section className="py-20">
      <Container>
        <div data-reveal className="rounded-3xl border border-line bg-surface px-6 py-20 text-center">
          <h2 className="mx-auto max-w-[22ch] text-[34px] leading-[1.1] tracking-[-0.02em] sm:text-[48px]">{title}</h2>
          <p className="text-fg/70 mx-auto mt-5 max-w-[48ch] text-[18px] leading-relaxed">
            Free forever for one person. Upgrade only when you want the waitlist, no-show protection or a team.
          </p>
          <div className="mt-9 flex justify-center gap-3">
            <ButtonLink href={signupUrl}>Sign up free</ButtonLink>
            <ButtonLink href="/pricing" variant="secondary">See pricing</ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
