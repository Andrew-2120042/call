import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { _generateMetadata } from "app/_utils";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import PageStudio from "~/booking-page/page-studio-view";

export const generateMetadata = async () =>
  await _generateMetadata(
    (t) => t("page_editor_title"),
    (t) => t("page_editor_subtitle"),
    undefined,
    undefined,
    "/page-editor"
  );

// Full-screen editor (no app sidebar), modelled on the Linktree editor.
const Page = async () => {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) return redirect("/auth/login?callbackUrl=/page-editor");
  return <PageStudio />;
};

export default Page;
