import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { _generateMetadata, getTranslate } from "app/_utils";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import TeamsListView from "~/teams/teams-list-view";
import { ShellMainAppDir } from "../ShellMainAppDir";

export const generateMetadata = async () =>
  await _generateMetadata(
    (t) => t("teams"),
    (t) => t("teams_page_subtitle"),
    undefined,
    undefined,
    "/teams"
  );

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) {
    // Invite links must survive the login round trip.
    const token = (await searchParams).token;
    const callbackUrl = typeof token === "string" ? `/teams?token=${encodeURIComponent(token)}` : "/teams";
    return redirect(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  const t = await getTranslate();
  return (
    <ShellMainAppDir heading={t("teams")} subtitle={t("teams_page_subtitle")}>
      <TeamsListView />
    </ShellMainAppDir>
  );
};

export default Page;
