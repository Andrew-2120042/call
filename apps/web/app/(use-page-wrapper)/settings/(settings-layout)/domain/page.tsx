import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import SettingsHeader from "@calcom/features/settings/appDir/SettingsHeader";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { _generateMetadata, getTranslate } from "app/_utils";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import CustomDomainView from "~/settings/domain/custom-domain-view";

export const generateMetadata = async () =>
  await _generateMetadata(
    (t) => t("custom_domain_page_title"),
    (t) => t("custom_domain_page_description"),
    undefined,
    undefined,
    "/settings/domain"
  );

const Page = async () => {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) redirect("/auth/login");
  const t = await getTranslate();
  return (
    <SettingsHeader
      title={t("custom_domain_page_title")}
      description={t("custom_domain_page_description")}
      borderInShellHeader>
      <CustomDomainView />
    </SettingsHeader>
  );
};

export default Page;
