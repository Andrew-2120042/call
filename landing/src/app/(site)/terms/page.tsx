import type { Metadata } from "next";
import { LegalPage } from "@/components/legal";
import { site } from "@/site.config";

export const metadata: Metadata = { title: "Terms of service", alternates: { canonical: "/terms" } };

export default function Terms() {
  return (
    <LegalPage title="Terms of service" updated="November 15, 2026">
      <p>By creating a {site.name} account you agree to these terms.</p>
      <h2>Your account</h2>
      <p>You&apos;re responsible for your account and for the bookings made through your links. Keep your password safe and tell us if you think someone else has access.</p>
      <h2>Acceptable use</h2>
      <p>Don&apos;t use {site.name} to send spam, collect data people haven&apos;t agreed to share, or break the law. We may suspend accounts that do.</p>
      <h2>Paid plans</h2>
      <p>Pro and Team are billed monthly in advance. You can cancel at any time and keep paid features until the end of the period. We don&apos;t offer refunds for partial months unless required by law.</p>
      <h2>Availability</h2>
      <p>We work hard to keep {site.name} running, but we can&apos;t promise it will never be interrupted. We&apos;re not liable for missed bookings caused by outages, calendar provider errors or email delivery problems.</p>
      <h2>Changes</h2>
      <p>We may update these terms. If a change matters, we&apos;ll tell you by email before it takes effect.</p>
      <h2>Contact</h2>
      <p><a className="text-fg underline" href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a></p>
    </LegalPage>
  );
}
