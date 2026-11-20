import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { getPlanService } from "@calcom/features/plans/lib/getPlanService";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { _generateMetadata, getTranslate } from "app/_utils";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { ProGate } from "~/plans/ProGate";
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
  const allowed = await getPlanService().hasFeature(session.user.id, "waitlist");
  return (
    <ShellMainAppDir heading={t("waitlist_page_title")} subtitle={t("waitlist_page_subtitle")}>
      {allowed ? (
        <WaitlistView />
      ) : (
        <ProGate
          titleKey="pro_gate_waitlist_title"
          bodyKey="pro_gate_waitlist_body"
          points={["pro_gate_waitlist_p1", "pro_gate_waitlist_p2", "pro_gate_waitlist_p3"]}
        />
      )}
    </ShellMainAppDir>
  );
};

export default Page;
