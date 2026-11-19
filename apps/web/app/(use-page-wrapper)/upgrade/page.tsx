import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { _generateMetadata } from "app/_utils";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import UpgradeView from "~/upgrade/upgrade-view";

export const generateMetadata = async () =>
  await _generateMetadata(
    (t) => t("upgrade"),
    (t) => t("upgrade_page_subtitle"),
    undefined,
    undefined,
    "/upgrade"
  );

const ServerPage = async () => {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) return redirect("/auth/login?callbackUrl=/upgrade");
  return <UpgradeView />;
};

export default ServerPage;
