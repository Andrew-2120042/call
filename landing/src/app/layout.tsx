import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import type { ReactNode } from "react";
import { RevealObserver } from "@/components/reveal";
import { ThemeSwitch, themePreviewScript } from "@/components/theme-switch";
import { JsonLd } from "@/components/ui";

const showThemeSwitch = process.env.NODE_ENV === "development";
import { site } from "@/site.config";
import "./globals.css";

// Apollo's body and mono fonts (ABC Diatype, Söhne Mono) are paid; Geist is the closest free match.
const inter = Geist({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono-face", display: "swap" });
// Apollo sets its hero headline in Tiempos (paid); Newsreader is the closest free serif.
const serif = Newsreader({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-instrument-serif", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name}: ${site.tagline}`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: site.name, url: site.url, title: site.name, description: site.description },
  twitter: { card: "summary_large_image", title: site.name, description: site.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#0e0e0d", colorScheme: "dark" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // The reveal script tags <html> before React loads, so its class list is expected to differ.
    <html lang="en" data-theme="dark" className={`${inter.variable} ${serif.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* Marks the page before first paint so revealed sections don't flash in and out. */}
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static, first-party
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('reveal-ready')" }}
        />
        {showThemeSwitch && (
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static, first-party
          <script dangerouslySetInnerHTML={{ __html: themePreviewScript }} />
        )}
      </head>
      <body className="min-h-screen">
        <RevealObserver />
        {children}
        {showThemeSwitch && <ThemeSwitch />}
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              { "@type": "Organization", "@id": `${site.url}/#org`, name: site.name, url: site.url, email: site.supportEmail },
              { "@type": "WebSite", "@id": `${site.url}/#site`, name: site.name, url: site.url, publisher: { "@id": `${site.url}/#org` } },
            ],
          }}
        />
      </body>
    </html>
  );
}
