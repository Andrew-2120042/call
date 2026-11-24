import type { ReactNode } from "react";
import { GoogleOneTap } from "@/components/google-one-tap";
import { Footer, Header } from "@/components/site-chrome";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    // Most sizes are fixed px utilities, so zoom is the one switch that scales type, spacing and the nav together.
    <div className="[--site-zoom:1.06] md:[--site-zoom:1.12] [zoom:var(--site-zoom)]">
      <Header />
      <main>{children}</main>
      <Footer />
      <GoogleOneTap />
    </div>
  );
}
