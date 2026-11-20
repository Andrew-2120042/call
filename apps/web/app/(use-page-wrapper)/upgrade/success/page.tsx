import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { _generateMetadata } from "app/_utils";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import UpgradeSuccessView from "~/upgrade/upgrade-success-view";

export const generateMetadata = async () =>
  await _generateMetadata(
    (t) => t("upgrade_success_title"),
    (t) => t("upgrade_success_body"),
    undefined,
    undefined,
    "/upgrade/success"
  );

const ServerPage = async () => {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) return redirect("/auth/login?callbackUrl=/upgrade/success");
  return <UpgradeSuccessView />;
};

export default ServerPage;
