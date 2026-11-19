"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import slugify from "@calcom/lib/slugify";
import { trpc } from "@calcom/trpc/react";
import { Button } from "@calcom/ui/components/button";
import { Dialog, DialogContent, DialogFooter } from "@calcom/ui/components/dialog";
import { TextAreaField, TextField } from "@calcom/ui/components/form";
import { Icon } from "@calcom/ui/components/icon";
import { showToast } from "@calcom/ui/components/toast";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ListSkeleton } from "~/shell/skeletons";
import { TeamLogo } from "./components/TeamLogo";
import { TeamRoleBadge } from "./components/TeamRoleBadge";

export default function TeamsListView() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") ?? null;
  const [createOpen, setCreateOpen] = useState(false);
  const list = trpc.viewer.teams.list.useQuery();

  if (list.isPending) return <ListSkeleton rows={3} />;
  if (list.error) {
    return <p className="text-error text-sm">{t(list.error.message)}</p>;
  }
  const { teams, invites, canCreate } = list.data;

  return (
    <div className="flex flex-col gap-6" data-testid="teams-page">
      {token && <JoinByLinkCard token={token} />}

      {invites.length > 0 && (
        <section>
          <h2 className="text-emphasis mb-2 text-sm font-medium">{t("teams_pending_invites")}</h2>
          <div className="border-subtle divide-subtle divide-y rounded-lg border">
            {invites.map((invite) => (
              <PendingInviteRow
                key={invite.id}
                teamId={invite.id}
                name={invite.name}
                logoUrl={invite.logoUrl}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="text-emphasis text-sm font-medium">{t("teams_your_teams")}</h2>
          {teams.length > 0 && canCreate && (
            <Button
              size="sm"
              StartIcon="plus"
              onClick={() => setCreateOpen(true)}
              data-testid="new-team-button">
              {t("teams_new_team")}
            </Button>
          )}
        </div>

        {teams.length === 0 ? (
          <EmptyTeams canCreate={canCreate} onCreate={() => setCreateOpen(true)} />
        ) : (
          <div className="border-subtle divide-subtle divide-y rounded-lg border">
            {teams.map((team) => (
              <Link
                key={team.id}
                href={`/teams/${team.id}`}
                className="hover:bg-cal-muted flex items-center gap-3 px-4 py-3 transition"
                data-testid="team-row">
                <TeamLogo size="md" name={team.name} logoUrl={team.logoUrl} />
                <div className="min-w-0 flex-1">
                  <div className="text-emphasis truncate text-sm font-medium">{team.name}</div>
                  <div className="text-subtle truncate text-xs">
                    {t("teams_member_count", { count: team.memberCount })}
                    {team.slug ? ` · /team/${team.slug}` : ""}
                  </div>
                </div>
                <TeamRoleBadge role={team.role} />
                <Icon name="chevron-right" className="text-muted h-4 w-4" />
              </Link>
            ))}
          </div>
        )}
      </section>

      <CreateTeamDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

function EmptyTeams({ canCreate, onCreate }: { canCreate: boolean; onCreate: () => void }) {
  const { t } = useLocale();
  return (
    <div className="border-subtle rounded-lg border border-dashed px-6 py-10 text-center">
      <span className="bg-subtle mx-auto grid h-10 w-10 place-items-center rounded-lg">
        <Icon name="users" className="text-emphasis h-5 w-5" />
      </span>
      <p className="text-emphasis mt-3 text-sm font-medium">{t("teams_empty_title")}</p>
      <p className="text-subtle mx-auto mt-1 max-w-[44ch] text-sm">{t("teams_empty_body")}</p>
      <div className="mt-4 flex justify-center">
        {canCreate ? (
          <Button StartIcon="plus" onClick={onCreate} data-testid="create-first-team">
            {t("teams_new_team")}
          </Button>
        ) : (
          <Button href="/upgrade" color="secondary" data-testid="teams-upgrade">
            {t("teams_upgrade_to_create")}
          </Button>
        )}
      </div>
    </div>
  );
}

function PendingInviteRow({
  teamId,
  name,
  logoUrl,
}: {
  teamId: number;
  name: string;
  logoUrl: string | null;
}) {
  const { t } = useLocale();
  const utils = trpc.useUtils();
  const onDone = async () => {
    await utils.viewer.teams.list.invalidate();
  };
  const accept = trpc.viewer.teams.acceptInvite.useMutation({
    onSuccess: async () => {
      showToast(t("teams_joined", { team: name }), "success");
      await onDone();
    },
    onError: (error) => showToast(t(error.message), "error"),
  });
  const decline = trpc.viewer.teams.declineInvite.useMutation({
    onSuccess: onDone,
    onError: (error) => showToast(t(error.message), "error"),
  });
  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3" data-testid="team-invite-row">
      <TeamLogo size="md" name={name} logoUrl={logoUrl} />
      <div className="min-w-0 flex-1">
        <div className="text-emphasis truncate text-sm font-medium">{name}</div>
        <div className="text-subtle text-xs">{t("teams_invited_you")}</div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          color="secondary"
          loading={decline.isPending}
          onClick={() => decline.mutate({ teamId })}>
          {t("decline")}
        </Button>
        <Button size="sm" loading={accept.isPending} onClick={() => accept.mutate({ teamId })}>
          {t("accept")}
        </Button>
      </div>
    </div>
  );
}

function JoinByLinkCard({ token }: { token: string }) {
  const { t } = useLocale();
  const router = useRouter();
  const utils = trpc.useUtils();
  const preview = trpc.viewer.teams.previewInvite.useQuery({ token }, { retry: false });
  const join = trpc.viewer.teams.join.useMutation({
    onSuccess: async ({ teamId }) => {
      showToast(t("teams_joined", { team: preview.data?.team.name ?? "" }), "success");
      await utils.viewer.teams.list.invalidate();
      router.replace(`/teams/${teamId}`);
    },
    onError: (error) => showToast(t(error.message), "error"),
  });

  if (preview.isPending) return <ListSkeleton rows={1} />;
  if (!preview.data) {
    return (
      <div className="border-subtle rounded-lg border px-4 py-3 text-sm" role="alert">
        <span className="text-emphasis font-medium">{t("invite_link_expired")}</span>
        <span className="text-subtle ms-1">{t("teams_ask_for_new_link")}</span>
      </div>
    );
  }
  const { team } = preview.data;
  return (
    <div className="border-subtle bg-cal-muted flex flex-wrap items-center gap-3 rounded-lg border px-4 py-4">
      <TeamLogo size="mdLg" name={team.name} logoUrl={team.logoUrl} />
      <div className="min-w-0 flex-1">
        <div className="text-emphasis text-sm font-medium">{t("teams_join_title", { team: team.name })}</div>
        <div className="text-subtle text-xs">{t("teams_join_body")}</div>
      </div>
      <Button loading={join.isPending} onClick={() => join.mutate({ token })} data-testid="join-team-button">
        {t("teams_join_button")}
      </Button>
    </div>
  );
}

function CreateTeamDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useLocale();
  const router = useRouter();
  const utils = trpc.useUtils();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [bio, setBio] = useState("");
  const create = trpc.viewer.teams.create.useMutation({
    onSuccess: async (team) => {
      await utils.viewer.teams.list.invalidate();
      onOpenChange(false);
      router.push(`/teams/${team.id}?invite=1`);
    },
    onError: (error) => showToast(t(error.message), "error"),
  });
  const shownSlug = slugEdited ? slug : slugify(name);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        type="creation"
        title={t("teams_create_title")}
        description={t("teams_create_body")}
        // We navigate to the new team and open its invite dialog; handing focus back here would close that dialog.
        onCloseAutoFocus={(event) => event.preventDefault()}>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            create.mutate({ name, slug: shownSlug, bio: bio || null });
          }}>
          <TextField
            name="name"
            label={t("team_name")}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("teams_name_placeholder")}
            required
            autoFocus
            data-testid="team-name-input"
          />
          <TextField
            name="slug"
            label={t("team_url")}
            addOnLeading="/team/"
            value={shownSlug}
            onChange={(event) => {
              setSlugEdited(true);
              setSlug(slugify(event.target.value, true));
            }}
            required
            data-testid="team-slug-input"
          />
          <TextAreaField
            name="bio"
            label={t("about")}
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder={t("teams_bio_placeholder")}
            rows={3}
          />
          <DialogFooter noSticky>
            <Button type="button" color="secondary" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              loading={create.isPending}
              disabled={!name.trim()}
              data-testid="create-team-submit">
              {t("continue")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
