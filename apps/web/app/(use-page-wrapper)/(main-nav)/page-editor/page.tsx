import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { _generateMetadata, getTranslate } from "app/_utils";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import PageEditorView from "~/booking-page/page-editor-view";
import { ShellMainAppDir } from "../ShellMainAppDir";

export const generateMetadata = async () =>
  await _generateMetadata(
    (t) => t("page_editor_title"),
    (t) => t("page_editor_subtitle"),
    undefined,
    undefined,
    "/page-editor"
  );

const Page = async () => {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) return redirect("/auth/login");
  const t = await getTranslate();
  return (
    <ShellMainAppDir heading={t("page_editor_title")} subtitle={t("page_editor_subtitle")}>
      <PageEditorView />
    </ShellMainAppDir>
  );
};

export default Page;
