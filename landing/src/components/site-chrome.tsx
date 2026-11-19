import Link from "next/link";
import { articles } from "@/content/articles";
import { audiences, comparisons, features } from "@/content/site-content";
import { loginUrl, signupUrl, site } from "@/site.config";
import { Container } from "./ui";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 text-[15px] font-semibold tracking-tight ${className}`} aria-label={`${site.name} home`}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="2" y="2" width="20" height="20" rx="6" fill="currentColor" />
        <path d="M7.5 12.5l3 3 6-6.5" stroke="var(--color-bg)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {site.name}
    </Link>
  );
}

const productMenu = [
  ...features.map((f) => ({ href: `/features/${f.slug}`, label: f.name, hint: f.title })),
];
const resourcesMenu = [
  { href: "/docs", label: "Docs", hint: `How every part of ${site.name} works` },
  { href: "/docs/changelog", label: "Changelog", hint: "What's new, every week" },
  { href: "/blog", label: "Guides", hint: "Comparisons, pricing explained, how-tos" },
  ...comparisons.map((c) => ({ href: `/compare/${c.slug}`, label: `${c.competitor} alternative`, hint: c.title })),
  { href: "/blog/best-scheduling-software-2027", label: "Best scheduling software 2027", hint: "An honest shortlist" },
];

function Menu({ label, items }: { label: string; items: { href: string; label: string; hint: string }[] }) {
  return (
    <div className="group relative">
      <button type="button" className="text-muted group-hover:text-fg flex items-center gap-1 py-4 text-[13px] transition">
        {label}
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className="opacity-60">
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        </svg>
      </button>
      <div className="invisible absolute left-1/2 top-full z-50 w-80 -translate-x-1/2 pt-1 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
        <div className="rounded-2xl border border-line-strong bg-surface p-2 shadow-2xl shadow-black/60">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="hover:bg-raised block rounded-xl px-3 py-2.5 transition">
              <span className="block text-[13px] font-medium">{item.label}</span>
              <span className="text-faint mt-0.5 block truncate text-xs">{item.hint}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Header() {
  return (
    <>
      <div className="border-b border-line bg-bg">
        <Container className="flex h-9 items-center justify-center text-[12px]">
          <Link href="/features/team-scheduling" className="text-muted hover:text-fg transition">
            New: team waitlists, managed services and a weekly coverage view <span aria-hidden>→</span>
          </Link>
        </Container>
      </div>
      <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur-xl">
        <Container className="flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
              <Menu label="Product" items={productMenu} />
              <Menu label="Resources" items={resourcesMenu} />
              <Link href="/features/team-scheduling" className="text-muted hover:text-fg text-[13px] transition">Teams</Link>
              <Link href="/pricing" className="text-muted hover:text-fg text-[13px] transition">Pricing</Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <a href={loginUrl} className="text-muted hover:text-fg hidden px-2 py-1.5 text-[13px] transition sm:inline">
              Log in
            </a>
            <a href={signupUrl} className="hidden rounded-md border border-line-strong px-3 py-1.5 text-[13px] transition hover:bg-raised sm:inline">
              Sign up for free
            </a>
            <a href={signupUrl} className="bg-fg text-bg rounded-md px-3 py-1.5 text-[13px] font-medium transition hover:bg-white">
              Get started
            </a>
            <details className="group relative md:hidden">
              <summary className="text-muted hover:text-fg grid h-8 w-8 cursor-pointer list-none place-items-center rounded-full border border-line" aria-label="Menu">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M2 5h12M2 11h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
              </summary>
              <nav className="absolute right-0 mt-2 w-56 rounded-2xl border border-line bg-surface p-2 shadow-xl" aria-label="Mobile">
                {[
                  { href: "/#product", label: "Product" },
                  { href: "/features/team-scheduling", label: "Teams" },
                  { href: "/pricing", label: "Pricing" },
                  { href: "/docs", label: "Docs" },
                  { href: "/blog", label: "Guides" },
                  { href: "/compare/calendly-alternative", label: "Compare" },
                ].map((l) => (
                  <Link key={l.href} href={l.href} className="text-muted hover:text-fg hover:bg-raised block rounded-lg px-3 py-2 text-sm">{l.label}</Link>
                ))}
                <a href={loginUrl} className="text-muted hover:text-fg hover:bg-raised block rounded-lg px-3 py-2 text-sm">Sign in</a>
              </nav>
            </details>
          </div>
        </Container>
      </header>
    </>
  );
}

export function Footer() {
  const columns = [
    { title: "Product", links: [...features.map((f) => ({ href: `/features/${f.slug}`, label: f.name })), { href: "/pricing", label: "Pricing" }] },
    { title: "Built for", links: audiences.map((a) => ({ href: `/for/${a.slug}`, label: a.plural[0].toUpperCase() + a.plural.slice(1) })) },
    { title: "Compare", links: comparisons.map((c) => ({ href: `/compare/${c.slug}`, label: `${c.competitor} alternative` })) },
    { title: "Guides", links: articles.slice(0, 6).map((a) => ({ href: `/blog/${a.slug}`, label: a.keyword[0].toUpperCase() + a.keyword.slice(1) })) },
    {
      title: "Company",
      links: [
        { href: "/docs", label: "Docs" },
        { href: "/docs/changelog", label: "Changelog" },
        { href: `mailto:${site.supportEmail}`, label: "Contact" },
        { href: "/privacy", label: "Privacy" },
        { href: "/terms", label: "Terms" },
        { href: "/llms.txt", label: "llms.txt" },
      ],
    },
  ];
  return (
    <footer className="border-t border-line">
      <Container className="grid gap-12 py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)]">
        <div className="flex flex-col justify-between gap-10">
          <svg viewBox="0 0 24 24" className="h-36 w-36 sm:h-48 sm:w-48" fill="none" aria-hidden>
            <rect x="2" y="2" width="20" height="20" rx="6" fill="currentColor" />
            <path d="M7.5 12.5l3 3 6-6.5" stroke="var(--color-bg)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="text-faint space-y-1.5 text-xs">
            <p className="text-muted">{site.name} © {new Date().getFullYear()}</p>
            <Link href="/privacy" className="hover:text-fg block transition">Privacy</Link>
            <Link href="/terms" className="hover:text-fg block transition">Terms</Link>
          </div>
        </div>
        <div className="grid gap-10 sm:grid-cols-3 lg:grid-cols-5">
        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-faint text-xs">{col.title}</p>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-muted hover:text-fg text-[13px] transition">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        </div>
      </Container>
    </footer>
  );
}
