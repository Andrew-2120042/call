import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { _generateMetadata, getTranslate } from "app/_utils";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import WaitlistView from "~/waitlist/waitlist-view";

import { ShellMainAppDir } from "../ShellMainAppDir";

export const generateMetadata = async () =>
  await _generateMetadata(
    (t) => t("waitlist_page_title"),
    (t) => t("waitlist_page_subtitle"),
    undefined,
    undefined,
    "/waitlist"
  );

const Page = async () => {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) return redirect("/auth/login");
  const t = await getTranslate();
  return (
    <ShellMainAppDir heading={t("waitlist_page_title")} subtitle={t("waitlist_page_subtitle")}>
      <WaitlistView />
    </ShellMainAppDir>
  );
};

export default Page;
