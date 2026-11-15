import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { _generateMetadata, getTranslate } from "app/_utils";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import TeamDetailView from "~/teams/team-detail-view";
import { ShellMainAppDir } from "../../ShellMainAppDir";

export const generateMetadata = async () =>
  await _generateMetadata(
    (t) => t("team"),
    (t) => t("teams_page_subtitle"),
    undefined,
    undefined,
    "/teams"
  );

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const teamId = Number(id);
  if (!Number.isInteger(teamId) || teamId <= 0) return notFound();
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id)
    return redirect(`/auth/login?callbackUrl=${encodeURIComponent(`/teams/${teamId}`)}`);
  const t = await getTranslate();
  return (
    <ShellMainAppDir heading={t("team")} backPath="/teams">
      <TeamDetailView teamId={teamId} />
    </ShellMainAppDir>
  );
};

export default Page;
