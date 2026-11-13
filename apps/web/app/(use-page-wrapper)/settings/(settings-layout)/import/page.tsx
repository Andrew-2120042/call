import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import SettingsHeader from "@calcom/features/settings/appDir/SettingsHeader";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { _generateMetadata, getTranslate } from "app/_utils";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import CalendlyImportView from "~/settings/import/calendly-import-view";

export const generateMetadata = async () =>
  await _generateMetadata(
    (t) => t("calendly_import_page_title"),
    (t) => t("calendly_import_page_description"),
    undefined,
    undefined,
    "/settings/import"
  );

const Page = async () => {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) redirect("/auth/login");
  const t = await getTranslate();
  return (
    <SettingsHeader
      title={t("calendly_import_page_title")}
      description={t("calendly_import_page_description")}
      borderInShellHeader>
      <CalendlyImportView />
    </SettingsHeader>
  );
};

export default Page;
