import Link from "next/link";
import type { ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`}>{children}</div>;
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const styles =
    variant === "primary"
      ? "bg-fg text-bg hover:bg-white"
      : "border border-line-strong text-fg hover:bg-raised";
  const external = href.startsWith("http");
  const cls = `inline-flex h-10 items-center justify-center rounded-md px-5 text-sm font-medium transition ${styles} ${className}`;
  return external ? (
    <a href={href} className={cls}>
      {children}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-faint text-xs font-medium uppercase tracking-[0.14em]">{children}</p>;
}

export function PlanBadge({ plan }: { plan: string }) {
  const color = plan === "Free" ? "text-emerald-400 bg-emerald-400/10" : "text-accent bg-accent-soft";
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${color}`}>{plan}</span>;
}

/** Renders schema.org data for search engines. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
