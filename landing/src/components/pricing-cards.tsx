import { pricing, pricingCompare } from "@/content/site-content";
import { signupUrl } from "@/site.config";

function Check({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className={`shrink-0 ${className}`}>
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Apollo-style plan columns: one bordered row, the popular plan lifted out with its own frame. */
export function PricingCards() {
  return (
    <div className="grid gap-4 lg:grid-cols-3 lg:gap-0">
      {pricing.map((plan, i) => (
        <div
          key={plan.name}
          className={`flex flex-col rounded-2xl p-6 lg:rounded-none ${
            plan.highlight ? "border border-brand/50 bg-brand/[0.04] lg:rounded-2xl" : `border border-line lg:border-0 ${i > 0 ? "lg:border-l lg:border-line" : ""}`
          }`}>
          {/* Every column keeps the badge row so names and prices line up across plans. */}
          <div className="h-5">
            {plan.highlight && (
              <span className="bg-brand inline-block rounded px-1.5 py-0.5 font-mono text-[10px] tracking-[0.12em] text-black uppercase">
                Most popular
              </span>
            )}
          </div>
          <h3 className="mt-3 text-[24px] leading-none">{plan.name}</h3>
          <p className="text-muted mt-2 min-h-[2.5em] text-[13px] leading-snug">{plan.blurb}</p>
          <p className="mt-4 flex items-baseline gap-2">
            <span className="font-serif text-[36px] leading-none tracking-[-0.02em]">{plan.price}</span>
          </p>
          <p className="text-muted mt-1.5 min-h-[2.5em] text-[12px] leading-snug">{plan.period}</p>
          <a
            href={signupUrl}
            className={`mt-4 inline-flex h-10 items-center justify-center rounded-md text-[14px] transition ${
              plan.highlight ? "bg-fg text-bg hover:bg-fg/85" : "bg-brand text-black hover:brightness-95"
            }`}>
            {plan.cta}
          </a>
          <ul className="mt-6 space-y-2 border-t border-line pt-5 text-[13px]">
            {plan.items.map((item) => (
              <li key={item} className="flex gap-2.5">
                <Check className="text-fg/70 mt-0.5" />
                <span className="text-fg/85">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Cell({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="text-fg mx-auto" />;
  if (value === false) return <span className="text-faint">–</span>;
  return <span className="text-fg/85">{value}</span>;
}

export function PricingCompare() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-[14px]">
        <thead>
          <tr className="border-b border-line">
            <th className="w-[40%] py-4 text-left font-normal" />
            {pricing.map((plan) => (
              <th key={plan.name} className="py-4 text-center font-serif text-[22px] font-normal">
                {plan.name}
                <span className="text-muted block font-sans text-[12px]">{plan.price} {plan.name === "Free" ? "forever" : "a month"}</span>
              </th>
            ))}
          </tr>
        </thead>
        {pricingCompare.map((group) => (
          <tbody key={group.group}>
            <tr>
              <th colSpan={4} className="text-faint pt-10 pb-3 text-left font-mono text-[11px] font-normal tracking-[0.16em] uppercase">
                {group.group}
              </th>
            </tr>
            {group.rows.map((row) => (
              <tr key={row.label} className="border-t border-line">
                <td className="text-muted py-3.5 pr-4">{row.label}</td>
                {row.values.map((value, i) => (
                  <td key={pricing[i].name} className="py-3.5 text-center">
                    <Cell value={value} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}
