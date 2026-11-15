"use client";

import { APP_NAME, WEBSITE_URL } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import useTheme from "@calcom/lib/hooks/useTheme";
import { Avatar } from "@calcom/ui/components/avatar";
import { Icon } from "@calcom/ui/components/icon";
import classNames from "classnames";
import Link from "next/link";
import { TeamLogo } from "./components/TeamLogo";

type Props = {
  team: { name: string; slug: string | null; logoUrl: string | null; bio: string | null };
  services: { id: number; title: string; slug: string; length: number; schedulingType: string | null }[];
  members: { id: number; name: string | null; username: string | null; avatarUrl: string | null }[];
};

export default function TeamPublicView({ team, services, members }: Props) {
  const { t } = useLocale();
  useTheme("dark");

  return (
    <div className="bg-cal-muted text-default min-h-[100dvh] px-4 pb-14 pt-12">
      <main className="mx-auto w-full max-w-[560px]" data-testid="team-public-page">
        <header className="flex flex-col items-center text-center">
          <TeamLogo size="xl" name={team.name} logoUrl={team.logoUrl} />
          <h1 className="text-emphasis mt-4 text-[26px] font-semibold leading-tight tracking-[-0.02em]">
            {team.name}
          </h1>
          {team.bio && (
            <p className="text-subtle mt-2 max-w-[44ch] text-[15px] leading-relaxed">{team.bio}</p>
          )}
        </header>

        <div
          className="border-subtle bg-default mt-8 overflow-hidden rounded-2xl border"
          data-testid="team-services">
          {services.map((service, index) => (
            <Link
              key={service.id}
              prefetch={false}
              href={`/team/${team.slug}/${service.slug}`}
              className={classNames(
                "hover:bg-subtle group flex items-center justify-between gap-4 px-5 py-4 transition-colors",
                index > 0 && "border-subtle border-t"
              )}
              data-testid="team-service-link">
              <span className="min-w-0">
                <span className="text-emphasis block truncate text-[15px] font-semibold">
                  {service.title}
                </span>
                <span className="text-subtle mt-1 flex flex-wrap items-center gap-x-2 text-[13px]">
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="clock" className="h-3.5 w-3.5" />
                    {t("service_minutes", { count: service.length })}
                  </span>
                  {service.schedulingType === "COLLECTIVE" && (
                    <span>· {t("team_service_with_everyone")}</span>
                  )}
                </span>
              </span>
              <Icon
                name="arrow-right"
                className="text-subtle h-4 w-4 flex-none transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          ))}
          {services.length === 0 && (
            <p className="text-subtle px-5 py-8 text-center text-sm">{t("team_no_public_services")}</p>
          )}
        </div>

        {members.length > 0 && (
          <section className="mt-10">
            <h2 className="text-subtle mb-3 text-center text-xs font-medium uppercase tracking-[0.08em]">
              {t("team_book_a_member")}
            </h2>
            <div className="flex flex-wrap justify-center gap-2">
              {members.map((member) => (
                <Link
                  key={member.id}
                  prefetch={false}
                  href={`/${member.username}`}
                  className="border-subtle bg-default hover:bg-subtle flex items-center gap-2 rounded-full border py-1.5 pe-3.5 ps-1.5 text-sm transition"
                  data-testid="team-member-link">
                  <Avatar size="sm" imageSrc={member.avatarUrl} alt={member.name ?? member.username ?? ""} />
                  <span className="text-emphasis">{member.name ?? member.username}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <p className="mt-10 text-center">
          <a
            href={`${WEBSITE_URL}/?utm_source=team_page&utm_medium=badge`}
            target="_blank"
            rel="noreferrer"
            className="text-muted hover:text-subtle text-xs transition">
            {t("booked_with_app", { appName: APP_NAME })}
          </a>
        </p>
      </main>
    </div>
  );
}
