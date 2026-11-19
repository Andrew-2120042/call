import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import type { ReactNode } from "react";
import { RevealObserver } from "@/components/reveal";
import { JsonLd } from "@/components/ui";
import { site } from "@/site.config";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-instrument-serif", display: "swap" });

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

export const viewport: Viewport = { themeColor: "#fbfbf8", colorScheme: "light" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // The reveal script tags <html> before React loads, so its class list is expected to differ.
    <html lang="en" className={`${inter.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        {/* Marks the page before first paint so revealed sections don't flash in and out. */}
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static, first-party
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('reveal-ready')" }}
        />
      </head>
      <body className="min-h-screen">
        <RevealObserver />
        {children}
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
