"use client";

import { WEBAPP_URL } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import slugify from "@calcom/lib/slugify";
import { MembershipRole } from "@calcom/prisma/enums";
import type { RouterOutputs } from "@calcom/trpc/react";
import { trpc } from "@calcom/trpc/react";
import { Avatar } from "@calcom/ui/components/avatar";
import { Button } from "@calcom/ui/components/button";
import { ConfirmationDialogContent, Dialog } from "@calcom/ui/components/dialog";
import { Select, Switch, TextAreaField, TextField } from "@calcom/ui/components/form";
import { ImageUploader } from "@calcom/ui/components/image-uploader";
import { showToast } from "@calcom/ui/components/toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SettingsCardSkeleton } from "~/shell/skeletons";
import { InviteMembersDialog } from "./components/InviteMembersDialog";
import { TeamLogo } from "./components/TeamLogo";
import { TeamRoleBadge } from "./components/TeamRoleBadge";

type TeamDetail = RouterOutputs["viewer"]["teams"]["get"];
type Member = TeamDetail["members"][number];

export default function TeamDetailView({ teamId }: { teamId: number }) {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);
  const query = trpc.viewer.teams.get.useQuery({ teamId }, { retry: false });

  // A brand-new team lands here with ?invite=1 so the owner can add people straight away.
  useEffect(() => {
    if (searchParams?.get("invite") !== "1") return;
    setInviteOpen(true);
    router.replace(`/teams/${teamId}`, { scroll: false });
  }, [searchParams, router, teamId]);

  if (query.isPending) {
    return (
      <div className="flex flex-col gap-6">
        <SettingsCardSkeleton />
        <SettingsCardSkeleton />
      </div>
    );
  }
  if (query.error) {
    return (
      <div className="border-subtle rounded-lg border p-6 text-sm" role="alert">
        <p className="text-emphasis font-medium">{t("teams_not_found")}</p>
        <Button href="/teams" color="secondary" className="mt-3" size="sm">
          {t("teams_back")}
        </Button>
      </div>
    );
  }

  const { team, members, myRole } = query.data;
  const canManage = myRole === MembershipRole.OWNER || myRole === MembershipRole.ADMIN;

  return (
    <div className="flex flex-col gap-6" data-testid="team-detail">
      <TeamHeader team={team} canManage={canManage} onInvite={() => setInviteOpen(true)} />
      {canManage && <TeamProfileCard team={team} />}
      <MembersCard teamId={team.id} members={members} myRole={myRole} canManage={canManage} />
      <DangerZone teamId={team.id} teamName={team.name} isOwner={myRole === MembershipRole.OWNER} />
      {canManage && (
        <InviteMembersDialog
          teamId={team.id}
          teamName={team.name}
          open={inviteOpen}
          onOpenChange={setInviteOpen}
        />
      )}
    </div>
  );
}

function TeamHeader({
  team,
  canManage,
  onInvite,
}: {
  team: TeamDetail["team"];
  canManage: boolean;
  onInvite: () => void;
}) {
  const { t } = useLocale();
  const publicUrl = team.slug ? `${WEBAPP_URL}/team/${team.slug}` : null;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <TeamLogo size="lg" name={team.name} logoUrl={team.logoUrl} />
      <div className="min-w-0 flex-1 basis-48">
        <h2 className="text-emphasis truncate text-lg font-medium">{team.name}</h2>
        {publicUrl && (
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="text-subtle hover:text-emphasis truncate text-xs transition">
            {publicUrl.replace(/^https?:\/\//, "")}
          </a>
        )}
      </div>
      <div className="flex gap-2">
        <Button href={`/event-types?teamId=${team.id}`} color="secondary" size="sm" StartIcon="link">
          {t("teams_services")}
        </Button>
        {canManage && (
          <Button size="sm" StartIcon="user-plus" onClick={onInvite} data-testid="invite-members-button">
            {t("teams_invite_people")}
          </Button>
        )}
      </div>
    </div>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-subtle rounded-lg border">
      <header className="border-subtle border-b px-5 py-4">
        <h3 className="text-emphasis text-sm font-medium">{title}</h3>
        {description && <p className="text-subtle mt-0.5 text-xs">{description}</p>}
      </header>
      {children}
    </section>
  );
}

function TeamProfileCard({ team }: { team: TeamDetail["team"] }) {
  const { t } = useLocale();
  const utils = trpc.useUtils();
  const [name, setName] = useState(team.name);
  const [slug, setSlug] = useState(team.slug ?? "");
  const [bio, setBio] = useState(team.bio ?? "");
  const [hideBookATeamMember, setHideBookATeamMember] = useState(team.hideBookATeamMember);
  const update = trpc.viewer.teams.update.useMutation({
    onSuccess: async () => {
      showToast(t("teams_saved"), "success");
      await Promise.all([
        utils.viewer.teams.get.invalidate({ teamId: team.id }),
        utils.viewer.teams.list.invalidate(),
      ]);
    },
    onError: (error) => showToast(t(error.message), "error"),
  });
  const dirty =
    name !== team.name ||
    slug !== (team.slug ?? "") ||
    bio !== (team.bio ?? "") ||
    hideBookATeamMember !== team.hideBookATeamMember;

  return (
    <Card title={t("teams_profile")} description={t("teams_profile_body")}>
      <div className="flex flex-col gap-4 px-5 py-5">
        <div className="flex items-center gap-3">
          <TeamLogo size="lg" name={team.name} logoUrl={team.logoUrl} />
          <ImageUploader
            target="logo"
            id="team-logo-upload"
            buttonMsg={team.logoUrl ? t("teams_change_logo") : t("upload_logo")}
            handleAvatarChange={(logo) => update.mutate({ teamId: team.id, logo })}
            imageSrc={team.logoUrl ?? undefined}
          />
          {team.logoUrl && (
            <Button color="minimal" size="sm" onClick={() => update.mutate({ teamId: team.id, logo: null })}>
              {t("remove")}
            </Button>
          )}
        </div>
        <TextField
          name="name"
          label={t("team_name")}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <TextField
          name="slug"
          label={t("team_url")}
          addOnLeading="/team/"
          value={slug}
          onChange={(event) => setSlug(slugify(event.target.value, true))}
        />
        <TextAreaField
          name="bio"
          label={t("about")}
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          placeholder={t("teams_bio_placeholder")}
          rows={3}
        />
        <label className="flex items-start justify-between gap-4">
          <span>
            <span className="text-emphasis block text-sm font-medium">{t("teams_hide_book_member")}</span>
            <span className="text-subtle block text-xs">{t("teams_hide_book_member_body")}</span>
          </span>
          <Switch checked={hideBookATeamMember} onCheckedChange={setHideBookATeamMember} />
        </label>
      </div>
      <footer className="border-subtle flex justify-end border-t px-5 py-3">
        <Button
          size="sm"
          disabled={!dirty || !name.trim() || !slug}
          loading={update.isPending}
          onClick={() =>
            update.mutate({
              teamId: team.id,
              name,
              slug: slugify(slug),
              bio: bio || null,
              hideBookATeamMember,
            })
          }
          data-testid="save-team">
          {t("save")}
        </Button>
      </footer>
    </Card>
  );
}

function MembersCard({
  teamId,
  members,
  myRole,
  canManage,
}: {
  teamId: number;
  members: Member[];
  myRole: MembershipRole;
  canManage: boolean;
}) {
  const { t } = useLocale();
  const accepted = members.filter((member) => member.accepted).length;
  return (
    <Card
      title={t("members")}
      description={t("teams_members_summary", { count: accepted, pending: members.length - accepted })}>
      <ul className="divide-subtle divide-y">
        {members.map((member) => (
          <MemberRow
            key={member.membershipId}
            teamId={teamId}
            member={member}
            myRole={myRole}
            canManage={canManage}
          />
        ))}
      </ul>
    </Card>
  );
}

function MemberRow({
  teamId,
  member,
  myRole,
  canManage,
}: {
  teamId: number;
  member: Member;
  myRole: MembershipRole;
  canManage: boolean;
}) {
  const { t } = useLocale();
  const utils = trpc.useUtils();
  const [confirmRemove, setConfirmRemove] = useState(false);
  const refresh = () => utils.viewer.teams.get.invalidate({ teamId });
  const changeRole = trpc.viewer.teams.changeRole.useMutation({
    onSuccess: async () => {
      showToast(t("teams_role_updated"), "success");
      await refresh();
    },
    onError: (error) => showToast(t(error.message), "error"),
  });
  const remove = trpc.viewer.teams.removeMember.useMutation({
    onSuccess: async () => {
      showToast(member.accepted ? t("teams_member_removed") : t("teams_invite_withdrawn"), "success");
      setConfirmRemove(false);
      await refresh();
    },
    onError: (error) => showToast(t(error.message), "error"),
  });

  const isOwner = member.role === MembershipRole.OWNER;
  // Admins manage members; only the owner manages other admins.
  const canEdit =
    canManage && !isOwner && (member.role === MembershipRole.MEMBER || myRole === MembershipRole.OWNER);
  const roleOptions = [
    { value: MembershipRole.MEMBER, label: t("member") },
    { value: MembershipRole.ADMIN, label: t("admin") },
  ];
  const displayName = member.name || member.email;

  return (
    <li className="flex flex-wrap items-center gap-3 px-5 py-3" data-testid="team-member-row">
      <Avatar size="md" imageSrc={member.avatarUrl} alt={displayName} />
      <div className="min-w-0 flex-1">
        <div className="text-emphasis truncate text-sm font-medium">{displayName}</div>
        <div className="text-subtle truncate text-xs">
          {member.name ? member.email : null}
          {!member.accepted && (member.name ? " · " : "") + t("teams_invite_not_accepted")}
        </div>
      </div>
      {!member.accepted && <TeamRoleBadge role={member.role} pending />}
      {canEdit ? (
        <div className="w-32">
          <Select
            size="sm"
            isSearchable={false}
            value={roleOptions.find((option) => option.value === member.role)}
            options={roleOptions}
            isDisabled={changeRole.isPending}
            onChange={(option) => {
              if (!option || option.value === member.role) return;
              changeRole.mutate({
                membershipId: member.membershipId,
                role: option.value as typeof MembershipRole.MEMBER | typeof MembershipRole.ADMIN,
              });
            }}
          />
        </div>
      ) : (
        <TeamRoleBadge role={member.role} />
      )}
      {canEdit && (
        <Button
          color="minimal"
          size="sm"
          variant="icon"
          StartIcon="trash-2"
          aria-label={t("remove")}
          onClick={() => setConfirmRemove(true)}
        />
      )}
      <Dialog open={confirmRemove} onOpenChange={setConfirmRemove}>
        <ConfirmationDialogContent
          variety="danger"
          title={
            member.accepted
              ? t("teams_remove_member_title", { name: displayName })
              : t("teams_withdraw_invite_title")
          }
          confirmBtnText={t("remove")}
          isPending={remove.isPending}
          onConfirm={(event) => {
            event.preventDefault();
            remove.mutate({ membershipId: member.membershipId });
          }}>
          {member.accepted
            ? t("teams_remove_member_body")
            : t("teams_withdraw_invite_body", { email: member.email })}
        </ConfirmationDialogContent>
      </Dialog>
    </li>
  );
}

function DangerZone({ teamId, teamName, isOwner }: { teamId: number; teamName: string; isOwner: boolean }) {
  const { t } = useLocale();
  const router = useRouter();
  const utils = trpc.useUtils();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const onDone = async (message: string) => {
    showToast(message, "success");
    setConfirmOpen(false);
    await utils.viewer.teams.list.invalidate();
    router.push("/teams");
  };
  const deleteTeam = trpc.viewer.teams.delete.useMutation({
    onSuccess: () => onDone(t("teams_deleted", { team: teamName })),
    onError: (error) => showToast(t(error.message), "error"),
  });
  const leave = trpc.viewer.teams.leave.useMutation({
    onSuccess: () => onDone(t("teams_left", { team: teamName })),
    onError: (error) => showToast(t(error.message), "error"),
  });
  const pending = deleteTeam.isPending || leave.isPending;

  return (
    <section className="border-subtle flex flex-wrap items-center justify-between gap-3 rounded-lg border px-5 py-4">
      <div>
        <h3 className="text-emphasis text-sm font-medium">{isOwner ? t("delete_team") : t("leave_team")}</h3>
        <p className="text-subtle mt-0.5 text-xs">
          {isOwner ? t("teams_delete_body") : t("teams_leave_body")}
        </p>
      </div>
      <Button
        color="destructive"
        size="sm"
        onClick={() => setConfirmOpen(true)}
        data-testid="team-danger-button">
        {isOwner ? t("delete_team") : t("leave_team")}
      </Button>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <ConfirmationDialogContent
          variety="danger"
          title={
            isOwner
              ? t("teams_delete_confirm_title", { team: teamName })
              : t("teams_leave_confirm_title", { team: teamName })
          }
          confirmBtnText={isOwner ? t("delete_team") : t("leave_team")}
          isPending={pending}
          onConfirm={(event) => {
            event.preventDefault();
            if (isOwner) deleteTeam.mutate({ teamId });
            else leave.mutate({ teamId });
          }}>
          {isOwner ? t("teams_delete_body") : t("teams_leave_body")}
        </ConfirmationDialogContent>
      </Dialog>
    </section>
  );
}
