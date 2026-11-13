import { _generateMetadata, getTranslate } from "app/_utils";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import SettingsHeader from "@calcom/features/settings/appDir/SettingsHeader";

import { buildLegacyRequest } from "@lib/buildLegacyCtx";

import BillingView from "~/settings/billing/billing-view";

export const generateMetadata = async () =>
  await _generateMetadata(
    (t) => t("billing_page_title"),
    (t) => t("billing_page_description"),
    undefined,
    undefined,
    "/settings/billing"
  );

const Page = async () => {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) redirect("/auth/login");
  const t = await getTranslate();
  return (
    <SettingsHeader title={t("billing_page_title")} description={t("billing_page_description")} borderInShellHeader>
      <BillingView />
    </SettingsHeader>
  );
};

export default Page;
