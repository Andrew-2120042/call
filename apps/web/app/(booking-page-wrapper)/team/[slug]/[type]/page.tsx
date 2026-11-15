import { loadTranslations } from "@calcom/i18n/server";
import { APP_NAME } from "@calcom/lib/constants";
import { buildLegacyCtx } from "@lib/buildLegacyCtx";
import { getTeamTypeServerSideProps } from "@server/lib/[user]/[type]/getServerSideProps";
import type { PageProps } from "app/_types";
import { CustomI18nProvider } from "app/CustomI18nProvider";
import { withAppDirSsr } from "app/WithAppDirSsr";
import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import type { PageProps as LegacyPageProps } from "~/users/views/users-type-public-view";
import LegacyPage from "~/users/views/users-type-public-view";

const getData = withAppDirSsr<LegacyPageProps>(getTeamTypeServerSideProps);

const ServerPage = async ({ params, searchParams }: PageProps) => {
  const props = await getData(
    buildLegacyCtx(await headers(), await cookies(), await params, await searchParams)
  );
  const locale = props.eventData?.interfaceLanguage;
  if (locale) {
    const translations = await loadTranslations(locale, "common");
    return (
      <CustomI18nProvider translations={translations} locale={locale} ns="common">
        <LegacyPage {...props} />
      </CustomI18nProvider>
    );
  }
  return <LegacyPage {...props} />;
};

export const generateMetadata = async ({ params, searchParams }: PageProps): Promise<Metadata> => {
  const props = await getData(
    buildLegacyCtx(await headers(), await cookies(), await params, await searchParams)
  );
  const title = props.eventData?.title ?? "";
  const teamName = props.eventData?.profile?.name ?? "";
  return { title: `${title} | ${teamName || APP_NAME}` };
};

export default ServerPage;
