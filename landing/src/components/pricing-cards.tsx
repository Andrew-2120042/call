import { pricing } from "@/content/site-content";
import { signupUrl } from "@/site.config";
import { ButtonLink } from "./ui";

export function PricingCards() {
  return (
    <div className="mt-10 grid gap-4 lg:grid-cols-3">
      {pricing.map((plan) => (
        <div
          key={plan.name}
          className={`flex flex-col rounded-2xl border p-6 ${plan.highlight ? "border-accent/60 bg-accent-soft/40" : "border-line bg-surface"}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{plan.name}</h3>
            {plan.highlight && <span className="text-accent text-xs font-medium">Most popular</span>}
          </div>
          <p className="mt-4">
            <span className="text-4xl font-medium tracking-tight">{plan.price}</span>
            <span className="text-muted ms-1.5 text-sm">{plan.period}</span>
          </p>
          <p className="text-muted mt-2 text-sm">{plan.blurb}</p>
          <ul className="mt-6 flex-1 space-y-2.5 text-sm">
            {plan.items.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-emerald-400">✓</span>
                <span className="text-muted">{item}</span>
              </li>
            ))}
          </ul>
          <ButtonLink href={signupUrl} variant={plan.highlight ? "primary" : "secondary"} className="mt-8 w-full">
            {plan.cta}
          </ButtonLink>
        </div>
      ))}
    </div>
  );
}
