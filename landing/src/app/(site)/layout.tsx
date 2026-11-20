import type { ReactNode } from "react";
import { Footer, Header } from "@/components/site-chrome";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    // Most sizes are fixed px utilities, so zoom is the one switch that scales type, spacing and the nav together.
    <div className="[--site-zoom:1.03] md:[--site-zoom:1.07] [zoom:var(--site-zoom)]">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
