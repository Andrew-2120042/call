// The one place to set domains and brand details. Replace the placeholder domains before launch
// (or set NEXT_PUBLIC_SITE_URL / NEXT_PUBLIC_APP_URL in the hosting provider).
export const site = {
  name: "Slotwise",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://slotwise.example",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://app.slotwise.example",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@slotwise.example",
  tagline: "The booking link that fills its own cancellations",
  description:
    "Slotwise is a booking link for professionals. Free scheduling with approvals, plus a waitlist that refills cancelled slots, confirm-or-release for no-shows, and team scheduling at a flat price.",
};

export const signupUrl = `${site.appUrl}/signup`;
export const loginUrl = `${site.appUrl}/auth/login`;
