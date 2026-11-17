// The one place to set domains and brand details. Replace the placeholder domains before launch
// (or set NEXT_PUBLIC_SITE_URL / NEXT_PUBLIC_APP_URL in the hosting provider).
export const site = {
  name: "Nodslot",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://nodslot.site",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://app.nodslot.site",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@nodslot.site",
  tagline: "The booking link that fills its own cancellations",
  description:
    "Nodslot is a booking link for professionals. Free scheduling with approvals, plus a waitlist that refills cancelled slots, confirm-or-release for no-shows, and team scheduling at a flat price.",
};

export const signupUrl = `${site.appUrl}/signup`;
export const loginUrl = `${site.appUrl}/auth/login`;
