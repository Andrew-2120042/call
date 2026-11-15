import Link from "next/link";
import { audiences, comparisons, features } from "@/content/site-content";
import { loginUrl, signupUrl, site } from "@/site.config";
import { ButtonLink, Container } from "./ui";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight" aria-label={`${site.name} home`}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="2" y="2" width="20" height="20" rx="6" fill="currentColor" />
        <path d="M7.5 12.5l3 3 6-6.5" stroke="var(--color-bg)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {site.name}
    </Link>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur">
      <Container className="flex h-14 items-center justify-between gap-4">
        <Logo />
        <nav className="text-muted hidden items-center gap-6 text-sm md:flex" aria-label="Main">
          <Link href="/#features" className="hover:text-fg transition">Features</Link>
          <Link href="/features/team-scheduling" className="hover:text-fg transition">Teams</Link>
          <Link href="/pricing" className="hover:text-fg transition">Pricing</Link>
          <Link href="/compare/calendly-alternative" className="hover:text-fg transition">Compare</Link>
        </nav>
        <div className="flex items-center gap-2">
          <a href={loginUrl} className="text-muted hover:text-fg hidden px-3 text-sm transition sm:inline">Log in</a>
          <ButtonLink href={signupUrl} className="h-9 px-4">Sign up free</ButtonLink>
          <details className="group relative md:hidden">
            <summary className="text-muted hover:text-fg grid h-9 w-9 cursor-pointer list-none place-items-center rounded-full border border-line" aria-label="Menu">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M2 5h12M2 11h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            </summary>
            <nav className="absolute right-0 mt-2 w-48 rounded-2xl border border-line bg-surface p-2 shadow-xl" aria-label="Mobile">
              {[
                { href: "/#features", label: "Features" },
                { href: "/features/team-scheduling", label: "Teams" },
                { href: "/pricing", label: "Pricing" },
                { href: "/compare/calendly-alternative", label: "Compare" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="text-muted hover:text-fg hover:bg-raised block rounded-lg px-3 py-2 text-sm">{l.label}</Link>
              ))}
              <a href={loginUrl} className="text-muted hover:text-fg hover:bg-raised block rounded-lg px-3 py-2 text-sm">Log in</a>
            </nav>
          </details>
        </div>
      </Container>
    </header>
  );
}

export function Footer() {
  const columns = [
    { title: "Features", links: features.map((f) => ({ href: `/features/${f.slug}`, label: f.name })) },
    { title: "For", links: audiences.map((a) => ({ href: `/for/${a.slug}`, label: a.plural[0].toUpperCase() + a.plural.slice(1) })) },
    {
      title: "Compare",
      links: [
        ...comparisons.map((c) => ({ href: `/compare/${c.slug}`, label: `${c.competitor} alternative` })),
        { href: "/pricing", label: "Pricing" },
      ],
    },
    {
      title: "Company",
      links: [
        { href: `mailto:${site.supportEmail}`, label: "Contact" },
        { href: "/privacy", label: "Privacy" },
        { href: "/terms", label: "Terms" },
      ],
    },
  ];
  return (
    <footer className="border-t border-line mt-24">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <Logo />
          <p className="text-faint mt-3 max-w-[28ch] text-sm">{site.tagline}.</p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-medium">{col.title}</p>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-muted hover:text-fg text-sm transition">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <Container className="text-faint border-t border-line py-6 text-xs">© {new Date().getFullYear()} {site.name}</Container>
    </footer>
  );
}
