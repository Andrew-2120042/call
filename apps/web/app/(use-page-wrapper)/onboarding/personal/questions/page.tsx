import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { APP_NAME } from "@calcom/lib/constants";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { _generateMetadata } from "app/_utils";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { PersonalQuestionsView } from "~/onboarding/personal/questions/personal-questions-view";

export const generateMetadata = async () =>
  await _generateMetadata(
    (t) => `${APP_NAME} - ${t("setup_q_page_title")}`,
    () => "",
    true,
    undefined,
    "/onboarding/personal/questions"
  );

const ServerPage = async () => {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) return redirect("/auth/login");
  return <PersonalQuestionsView />;
};

export default ServerPage;
