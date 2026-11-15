"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { MembershipRole } from "@calcom/prisma/enums";
import { trpc } from "@calcom/trpc/react";
import { Button } from "@calcom/ui/components/button";
import { Dialog, DialogContent, DialogFooter } from "@calcom/ui/components/dialog";
import { Label, TextAreaField, ToggleGroup } from "@calcom/ui/components/form";
import { showToast } from "@calcom/ui/components/toast";
import { useState } from "react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Splits pasted text (commas, spaces, new lines) into addresses. */
export function parseEmailList(text: string) {
  const parts = text
    .split(/[\s,;]+/)
    .map((part) => part.trim())
    .filter(Boolean);
  return {
    valid: parts.filter((part) => EMAIL_PATTERN.test(part)),
    invalid: parts.filter((part) => !EMAIL_PATTERN.test(part)),
  };
}

type InviteRole = typeof MembershipRole.MEMBER | typeof MembershipRole.ADMIN;

export function InviteMembersDialog({
  teamId,
  teamName,
  open,
  onOpenChange,
}: {
  teamId: number;
  teamName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useLocale();
  const utils = trpc.useUtils();
  const [emailsText, setEmailsText] = useState("");
  const [role, setRole] = useState<InviteRole>(MembershipRole.MEMBER);
  const { valid, invalid } = parseEmailList(emailsText);

  const invite = trpc.viewer.teams.invite.useMutation({
    onSuccess: async (result) => {
      if (result.invited.length) {
        showToast(t("teams_invites_sent", { count: result.invited.length }), "success");
      }
      if (result.alreadyMembers.length) {
        showToast(t("teams_already_members", { emails: result.alreadyMembers.join(", ") }), "warning");
      }
      await utils.viewer.teams.get.invalidate({ teamId });
      setEmailsText("");
      onOpenChange(false);
    },
    onError: (error) => showToast(t(error.message), "error"),
  });

  const inviteLink = trpc.viewer.teams.inviteLink.useMutation({
    onSuccess: async ({ link }, variables) => {
      try {
        await navigator.clipboard.writeText(link);
        showToast(variables.regenerate ? t("teams_link_reset") : t("link_copied"), "success");
      } catch {
        showToast(link, "success");
      }
    },
    onError: (error) => showToast(t(error.message), "error"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        type="creation"
        title={t("teams_invite_title", { team: teamName })}
        description={t("teams_invite_body")}>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!valid.length || invalid.length) return;
            invite.mutate({ teamId, emails: valid, role });
          }}>
          <TextAreaField
            name="emails"
            label={t("email_addresses")}
            value={emailsText}
            onChange={(event) => setEmailsText(event.target.value)}
            placeholder="sam@company.com, alex@company.com"
            rows={3}
            autoFocus
            data-testid="invite-emails-input"
          />
          {invalid.length > 0 && (
            <p className="text-error -mt-2 text-xs" role="alert">
              {t("teams_invalid_emails", { emails: invalid.join(", ") })}
            </p>
          )}
          <div>
            <Label>{t("role")}</Label>
            <ToggleGroup
              value={role}
              onValueChange={(value) => value && setRole(value as InviteRole)}
              options={[
                { value: MembershipRole.MEMBER, label: t("member") },
                { value: MembershipRole.ADMIN, label: t("admin") },
              ]}
            />
            <p className="text-subtle mt-1.5 text-xs">
              {role === MembershipRole.ADMIN ? t("teams_admin_explained") : t("teams_member_explained")}
            </p>
          </div>

          <div className="border-subtle flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2.5">
            <div className="min-w-0">
              <div className="text-emphasis text-sm font-medium">{t("teams_invite_link_title")}</div>
              <div className="text-subtle text-xs">{t("teams_invite_link_body")}</div>
            </div>
            <div className="flex gap-1.5">
              <Button
                type="button"
                size="sm"
                color="minimal"
                StartIcon="refresh-cw"
                loading={inviteLink.isPending && !!inviteLink.variables?.regenerate}
                onClick={() => inviteLink.mutate({ teamId, regenerate: true })}>
                {t("teams_reset_link")}
              </Button>
              <Button
                type="button"
                size="sm"
                color="secondary"
                StartIcon="link"
                loading={inviteLink.isPending && !inviteLink.variables?.regenerate}
                onClick={() => inviteLink.mutate({ teamId })}
                data-testid="copy-invite-link">
                {t("copy_invite_link")}
              </Button>
            </div>
          </div>

          <DialogFooter noSticky>
            <Button type="button" color="secondary" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              loading={invite.isPending}
              disabled={!valid.length || invalid.length > 0}
              data-testid="send-invites">
              {valid.length > 1 ? t("teams_send_invites", { count: valid.length }) : t("teams_send_invite")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
