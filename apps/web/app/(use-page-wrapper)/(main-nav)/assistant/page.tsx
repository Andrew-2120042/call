import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { _generateMetadata } from "app/_utils";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import AssistantView from "~/assistant/assistant-view";
import { ShellMainAppDir } from "../ShellMainAppDir";

export const generateMetadata = async () =>
  await _generateMetadata(
    (t) => t("assistant_page_title"),
    (t) => t("assistant_subtitle"),
    undefined,
    undefined,
    "/assistant"
  );

const Page = async () => {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) return redirect("/auth/login");
  return (
    <ShellMainAppDir>
      <AssistantView />
    </ShellMainAppDir>
  );
};

export default Page;
