import type { Metadata } from "next";
import { LegalPage } from "@/components/legal";
import { site } from "@/site.config";

export const metadata: Metadata = { title: "Privacy policy", alternates: { canonical: "/privacy" } };

export default function Privacy() {
  return (
    <LegalPage title="Privacy policy" updated="November 15, 2026">
      <p>This policy explains what {site.name} collects, why, and what you can do about it.</p>
      <h2>What we collect</h2>
      <ul>
        <li>Account details: your name, email address and password (stored hashed).</li>
        <li>Calendar data: when you connect a calendar, we read busy times to prevent double bookings and add new bookings to it. We store access tokens encrypted.</li>
        <li>Booking details: the name, email and answers people give when they book, join a waitlist or confirm a booking.</li>
        <li>Billing: payments are handled by our payment provider. We don&apos;t store card numbers.</li>
      </ul>
      <h2>How we use it</h2>
      <p>To run the service: show your availability, create bookings, send booking emails and reminders, and support you. On Pro, booking request answers are sent to an AI provider to write a short summary that only you see.</p>
      <h2>Sharing</h2>
      <p>We share data only with providers that help us run the service (hosting, email delivery, payments, video and calendar providers you connect, and the AI provider for summaries). We don&apos;t sell personal data.</p>
      <h2>Your choices</h2>
      <p>You can export or delete your account at any time from your settings, or by emailing <a className="text-fg underline" href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.</p>
      <h2>Contact</h2>
      <p>Questions about privacy: <a className="text-fg underline" href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.</p>
    </LegalPage>
  );
}
