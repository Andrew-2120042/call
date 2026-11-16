"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { ClientHeader, ClientPageShell } from "@calcom/web/modules/client-pages/ClientPage";
import { TeamLogo } from "./components/TeamLogo";

export default function JoinTeamView({
  token,
  team,
}: {
  token: string;
  team: { name: string; logoUrl: string | null } | null;
}) {
  const { t } = useLocale();

  if (!team) {
    return (
      <ClientPageShell testId="join-team-page">
        <ClientHeader icon="circle-alert" tone="warning" title={t("join_team_link_invalid_title")} subtitle={t("join_team_link_invalid_body")} />
      </ClientPageShell>
    );
  }

  const afterJoin = `/teams?token=${encodeURIComponent(token)}`;
  return (
    <ClientPageShell testId="join-team-page">
      <div className="flex flex-col items-center text-center">
        <TeamLogo size="lg" name={team.name} logoUrl={team.logoUrl} />
        <h1 className="text-emphasis mt-4 text-xl font-semibold">{t("join_team_title", { team: team.name })}</h1>
        <p className="text-subtle mt-2 max-w-sm text-sm">{t("join_team_body")}</p>
      </div>
      <div className="mt-6 flex flex-col gap-3">
        <a
          href={`/signup?token=${encodeURIComponent(token)}&callbackUrl=${encodeURIComponent(afterJoin)}`}
          className="bg-inverted text-inverted flex h-[50px] items-center justify-center rounded-full text-sm font-semibold transition hover:opacity-90"
          data-testid="join-team-signup">
          {t("join_team_create_account")}
        </a>
        <a
          href={`/auth/login?callbackUrl=${encodeURIComponent(afterJoin)}`}
          className="border-default text-emphasis hover:border-emphasis flex h-[50px] items-center justify-center rounded-full border text-sm font-semibold transition"
          data-testid="join-team-login">
          {t("join_team_have_account")}
        </a>
      </div>
    </ClientPageShell>
  );
}
