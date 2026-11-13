import { useLocale } from "@calcom/lib/hooks/useLocale";
import type { RouterOutputs } from "@calcom/trpc/react";
import { TopBanner } from "@calcom/ui/components/top-banner";
import Link from "next/link";

export type CalendarCredentialBannerProps = {
  data: RouterOutputs["viewer"]["me"]["getUserTopBanners"]["calendarCredentialBanner"];
};

function CalendarCredentialBanner({ data }: CalendarCredentialBannerProps) {
  const { t } = useLocale();

  if (!data) return null;

  return (
    <>
      <TopBanner
        text={t("calendar_health_banner", { apps: data })}
        variant="error"
        actions={
          <Link href="/apps/installed/calendar" className="border-b border-b-black">
            {t("calendar_health_banner_action")}
          </Link>
        }
      />
    </>
  );
}

export default CalendarCredentialBanner;
