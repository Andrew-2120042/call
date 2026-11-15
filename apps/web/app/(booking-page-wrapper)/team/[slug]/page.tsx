import { getTeamService } from "@calcom/features/teams/lib/getTeamService";
import { APP_NAME } from "@calcom/lib/constants";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import TeamPublicView from "~/teams/team-public-view";

const loadTeamPage = cache((slug: string) => getTeamService().getPublicPage(slug));

type Params = { params: Promise<{ slug: string }> };

export const generateMetadata = async ({ params }: Params): Promise<Metadata> => {
  const page = await loadTeamPage((await params).slug);
  if (!page) return { title: APP_NAME };
  return { title: `${page.team.name} | ${APP_NAME}`, description: page.team.bio ?? undefined };
};

const Page = async ({ params }: Params) => {
  const page = await loadTeamPage((await params).slug);
  if (!page) return notFound();
  return <TeamPublicView team={page.team} services={page.services} members={page.members} />;
};

export default Page;
