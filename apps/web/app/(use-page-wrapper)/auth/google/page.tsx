import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import GoogleHandoff from "~/auth/google-handoff-view";

/** Landing for the website's Google prompt: already signed in goes Home, otherwise continue with Google. */
const Page = async () => {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (session?.user?.id) return redirect("/home");
  return <GoogleHandoff />;
};

export default Page;
