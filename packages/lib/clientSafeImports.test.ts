import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

// These modules are loaded in the browser and in edge routes, where Node built-ins don't exist.
// Biome's auto-fix likes to add `import process from "node:process"`, which breaks the production
// build and stops Next.js from inlining NEXT_PUBLIC_* values, so keep them free of node: imports.
const CLIENT_OR_EDGE_FILES = [
  "packages/lib/constants.ts",
  "packages/ui/components/credits/Credits.tsx",
  "packages/ui/components/logo/Logo.tsx",
  "apps/web/modules/auth/login-view.tsx",
  "apps/web/modules/event-types/components/tabs/advanced/BookingRulesCard.tsx",
  "apps/web/modules/bookings/components/RequestInsightPanel.tsx",
  "apps/web/modules/bookings/components/AvailableTimeSlots.tsx",
  "apps/web/modules/settings/my-account/appearance-view.tsx",
  "apps/web/lib/csp.ts",
  "apps/web/lib/customDomainRouting.ts",
  "apps/web/modules/settings/domain/custom-domain-view.tsx",
  "apps/web/modules/settings/import/calendly-import-view.tsx",
  "apps/web/modules/settings/my-account/components/BookingPageLookCard.tsx",
  "apps/web/modules/users/views/users-public-view.tsx",
  "apps/web/modules/users/views/users-type-public-view.tsx",
  "packages/features/booking-page-theme/themes.ts",
  "apps/web/modules/home/home-view.tsx",
  "apps/web/modules/booking-page/BookingPageProfile.tsx",
  "apps/web/modules/booking-page/page-editor-view.tsx",
  "apps/web/modules/booking-page/PhoneFrame.tsx",
  "apps/web/modules/apps/curated-apps-view.tsx",
  "apps/web/modules/assistant/assistant-view.tsx",
  "apps/web/modules/home/SidebarSetupCard.tsx",
  "apps/web/modules/event-types/components/ServiceEditorChrome.tsx",
  "apps/web/components/ui/UsernameAvailability/index.tsx",
  "apps/web/modules/shell/SideBar.tsx",
  "apps/web/modules/shell/navigation/Navigation.tsx",
  "apps/web/modules/bookings/components/UnconfirmedBookingBadge.tsx",
  "apps/web/modules/data-table/components/DataTable.tsx",
  "apps/web/modules/settings/billing/billing-view.tsx",
  "apps/web/modules/waitlist/waitlist-view.tsx",
  "packages/features/bookings/lib/getOptionDisplayValue.ts",
  "packages/i18n/brand.js",
];

const repoRoot = join(__dirname, "../..");

describe("client and edge safe modules", () => {
  it.each(CLIENT_OR_EDGE_FILES)("%s does not import Node built-ins", (file) => {
    const source = readFileSync(join(repoRoot, file), "utf8");
    expect(source).not.toMatch(/from\s+["']node:/);
  });
});
