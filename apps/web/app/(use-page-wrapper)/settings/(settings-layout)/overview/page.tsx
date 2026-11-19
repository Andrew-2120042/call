import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import SettingsHeader from "@calcom/features/settings/appDir/SettingsHeader";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { _generateMetadata, getTranslate } from "app/_utils";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import SettingsOverviewView from "~/settings/overview/settings-overview-view";

export const generateMetadata = async () =>
  await _generateMetadata(
    (t) => t("settings_overview"),
    (t) => t("settings_overview_description"),
    undefined,
    undefined,
    "/settings/overview"
  );

const Page = async () => {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) redirect("/auth/login");
  const t = await getTranslate();
  return (
    <SettingsHeader title={t("settings_overview")} description={t("settings_overview_description")}>
      <SettingsOverviewView />
    </SettingsHeader>
  );
};

export default Page;
