// The one place to set domains and brand details. Replace the placeholder domains before launch
// (or set NEXT_PUBLIC_SITE_URL / NEXT_PUBLIC_APP_URL in the hosting provider).
// Copied from /brand.json (the one place to rename the product) by `npm run brand` before dev and build.
import BRAND from "./brand.json";

export const site = {
  name: BRAND.name,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? `https://${BRAND.domain}`,
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? `https://app.${BRAND.domain}`,
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? `support@${BRAND.domain}`,
  tagline: "The booking link that fills its own cancellations",
  description:
    `${BRAND.name} is a booking link for professionals. Free scheduling with approvals, plus a waitlist that refills cancelled slots, confirm-or-release for no-shows, and simple team pricing.`,
};

export const signupUrl = `${site.appUrl}/signup`;
export const loginUrl = `${site.appUrl}/auth/login`;
