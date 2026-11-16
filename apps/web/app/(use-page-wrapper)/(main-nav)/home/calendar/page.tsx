import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import HomeCalendarDemoView from "~/home/home-calendar-demo-view";
import { ShellMainAppDir } from "../../ShellMainAppDir";

// A preview of a calendar-first Home, kept beside the current one so the two can be compared.
const Page = async () => {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) return redirect("/auth/login");
  return (
    <ShellMainAppDir>
      <HomeCalendarDemoView />
    </ShellMainAppDir>
  );
};

export default Page;
