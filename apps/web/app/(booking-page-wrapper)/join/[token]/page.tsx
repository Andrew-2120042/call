import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { getTeamService } from "@calcom/features/teams/lib/getTeamService";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import JoinTeamView from "~/teams/join-team-view";

type Params = { params: Promise<{ token: string }> };

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Where a shared team invite link lands. Signed-in people go straight to the join card on Teams; everyone
// else picks "create an account" or "log in", and the invite travels with them either way.
const Page = async ({ params }: Params) => {
  const { token } = await params;
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (session?.user?.id) redirect(`/teams?token=${encodeURIComponent(token)}`);

  const preview = await getTeamService()
    .previewInviteToken(token)
    .catch(() => null);
  return (
    <JoinTeamView
      token={token}
      team={preview ? { name: preview.team.name, logoUrl: preview.team.logoUrl } : null}
    />
  );
};

export default Page;
