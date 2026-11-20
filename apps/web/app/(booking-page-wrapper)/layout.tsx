import { headers } from "next/headers";

import PageWrapper from "@components/PageWrapperAppDir";

export default async function BookingPageWrapperLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const nonce = h.get("x-csp-nonce") ?? undefined;

  return (
    <>
      <PageWrapper isBookingPage={true} requiresLicense={false} nonce={nonce}>
        {/* Marks client-facing pages so brand-tokens.css can give them a softer dark palette than the dashboard. */}
        <div data-booking-page className="contents">
          {children}
        </div>
      </PageWrapper>
    </>
  );
}
