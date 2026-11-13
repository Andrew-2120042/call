// The short list of integrations Slotwise offers. The underlying app store has 100+ apps; most are
// noise for solo creators and coaches, so the Apps page only shows these, in this order.

export type CuratedGroupId = "calendars" | "video" | "automations" | "tracking" | "payments";

export type CuratedApp = {
  slug: string;
  /** i18n key for our own one-line description */
  descriptionKey: string;
  /** Apps that are not installable app-store apps (e.g. webhooks) link to their own settings page */
  href?: string;
  name?: string;
  logo?: string;
  /** Shown but not connectable yet (e.g. payments wait on the US entity). */
  comingSoon?: boolean;
};

export const CURATED_APP_GROUPS: {
  id: CuratedGroupId;
  titleKey: string;
  subtitleKey: string;
  apps: CuratedApp[];
}[] = [
  {
    id: "calendars",
    titleKey: "apps_group_calendars",
    subtitleKey: "apps_group_calendars_sub",
    apps: [
      { slug: "google-calendar", descriptionKey: "apps_desc_google_calendar" },
      { slug: "office365-calendar", descriptionKey: "apps_desc_outlook_calendar" },
      { slug: "apple-calendar", descriptionKey: "apps_desc_apple_calendar" },
      { slug: "caldav-calendar", descriptionKey: "apps_desc_caldav", name: "CalDAV" },
    ],
  },
  {
    id: "video",
    titleKey: "apps_group_video",
    subtitleKey: "apps_group_video_sub",
    apps: [
      { slug: "google-meet", descriptionKey: "apps_desc_google_meet" },
      { slug: "zoom", descriptionKey: "apps_desc_zoom" },
      { slug: "daily-video", descriptionKey: "apps_desc_daily" },
    ],
  },
  {
    id: "automations",
    titleKey: "apps_group_automations",
    subtitleKey: "apps_group_automations_sub",
    apps: [
      { slug: "zapier", descriptionKey: "apps_desc_zapier" },
      { slug: "make", descriptionKey: "apps_desc_make" },
      {
        slug: "webhooks",
        descriptionKey: "apps_desc_webhooks",
        href: "/settings/developer/webhooks",
        name: "Webhooks",
      },
    ],
  },
  {
    id: "tracking",
    titleKey: "apps_group_tracking",
    subtitleKey: "apps_group_tracking_sub",
    apps: [
      { slug: "ga4", descriptionKey: "apps_desc_ga4" },
      { slug: "metapixel", descriptionKey: "apps_desc_metapixel" },
    ],
  },
  {
    id: "payments",
    titleKey: "apps_group_payments",
    subtitleKey: "apps_group_payments_sub",
    apps: [{ slug: "stripe", descriptionKey: "apps_desc_stripe", comingSoon: true }],
  },
];

export const CURATED_APP_SLUGS = CURATED_APP_GROUPS.flatMap((group) => group.apps.map((app) => app.slug));
