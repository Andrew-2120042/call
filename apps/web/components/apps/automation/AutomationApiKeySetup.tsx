import { useState } from "react";
import { Toaster } from "sonner";

import AppNotInstalledMessage from "@calcom/app-store/_components/AppNotInstalledMessage";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { MembershipRole } from "@calcom/prisma/enums";
import { trpc } from "@calcom/trpc/react";
import { Button } from "@calcom/ui/components/button";
import { showToast } from "@calcom/ui/components/toast";

export type AutomationApiKeySetupProps = {
  appId: "zapier" | "make";
  appName: string;
  credentialType: string;
  inviteLink: string;
  /** i18n keys for the numbered steps after "open the invite link". */
  stepKeys: string[];
};

/**
 * Zapier and Make sign in to Nodslot with an API key tied to that app. Each key covers either the user's own
 * services or one team's; generating a new one replaces the old one so a leaked key can be rotated here.
 */
export function AutomationApiKeySetup({
  appId,
  appName,
  credentialType,
  inviteLink,
  stepKeys,
}: AutomationApiKeySetupProps) {
  const { t } = useLocale();
  const utils = trpc.useUtils();
  const [newKeys, setNewKeys] = useState<Record<string, string>>({});
  const integrations = trpc.viewer.apps.integrations.useQuery({ variant: "automation" });
  const existingKeys = trpc.viewer.apiKeys.findKeyOfType.useQuery({ appId });
  const teams = trpc.viewer.teams.list.useQuery();
  const createKey = trpc.viewer.apiKeys.create.useMutation();
  const deleteKey = trpc.viewer.apiKeys.delete.useMutation();

  const installed = integrations.data?.items.find((item: { type: string }) => item.type === credentialType) as
    | { userCredentialIds: number[] }
    | undefined;
  const adminTeams = (teams.data?.teams ?? []).filter(
    (team) => team.role === MembershipRole.OWNER || team.role === MembershipRole.ADMIN
  );

  async function generate(teamId?: number) {
    try {
      const previous =
        existingKeys.data?.filter((key) => (teamId ? key.teamId === teamId : !key.teamId)) ?? [];
      for (const key of previous) await deleteKey.mutateAsync({ id: key.id });
      const apiKey = await createKey.mutateAsync({ note: appName, neverExpires: true, appId, teamId });
      setNewKeys((keys) => ({ ...keys, [teamId ?? "me"]: apiKey }));
      await utils.viewer.apiKeys.findKeyOfType.invalidate({ appId });
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("something_went_wrong"), "error");
    }
  }

  if (integrations.isPending) return <div className="bg-default h-screen" />;
  if (!installed?.userCredentialIds?.length) return <AppNotInstalledMessage appName={appId} />;

  const rows = [
    { key: "me", label: t("automation_key_personal"), teamId: undefined as number | undefined },
    ...adminTeams.map((team) => ({ key: String(team.id), label: team.name, teamId: team.id })),
  ];
  const busy = createKey.isPending || deleteKey.isPending;

  return (
    <div className="bg-default flex min-h-screen items-start justify-center px-4 py-12">
      <div className="border-subtle bg-muted w-full max-w-xl rounded-2xl border p-6 md:p-8">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="h-9 w-9" src={`/api/app-store/${appId}/icon.svg`} alt="" />
          <div>
            <h1 className="text-emphasis text-lg font-semibold">
              {t("automation_setup_title", { appName })}
            </h1>
            <p className="text-subtle text-sm">{t("automation_setup_subtitle", { appName })}</p>
          </div>
        </div>

        <ol className="text-default mt-6 list-decimal space-y-2 pl-5 text-sm">
          <li>
            {inviteLink ? (
              <a href={inviteLink} target="_blank" rel="noreferrer" className="text-emphasis underline">
                {t("automation_setup_open_invite", { appName })}
              </a>
            ) : (
              t("automation_setup_invite_pending", { appName })
            )}
          </li>
          {stepKeys.map((key) => (
            <li key={key}>{t(key, { appName })}</li>
          ))}
        </ol>

        <div className="mt-6 space-y-4">
          {rows.map((row) => {
            const hasKey =
              !!newKeys[row.key] ||
              existingKeys.data?.some((key) => (row.teamId ? key.teamId === row.teamId : !key.teamId));
            return (
              <div key={row.key} className="border-subtle rounded-xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-emphasis text-sm font-medium">{row.label}</p>
                    <p className="text-subtle text-xs">
                      {hasKey ? t("automation_key_exists") : t("automation_key_none")}
                    </p>
                  </div>
                  <Button color="secondary" size="sm" loading={busy} onClick={() => generate(row.teamId)}>
                    {hasKey ? t("automation_key_regenerate") : t("generate_api_key")}
                  </Button>
                </div>
                {newKeys[row.key] ? <CopyApiKey apiKey={newKeys[row.key]} /> : null}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <Button href={`/apps/installed/automation?hl=${appId}`} color="secondary">
            {t("done")}
          </Button>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}

function CopyApiKey({ apiKey }: { apiKey: string }) {
  const { t } = useLocale();
  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2 sm:flex-nowrap">
        <code className="bg-default border-subtle text-emphasis w-full break-all rounded-lg border px-3 py-2 text-xs">
          {apiKey}
        </code>
        <Button
          type="button"
          size="sm"
          StartIcon="clipboard"
          onClick={() => {
            navigator.clipboard.writeText(apiKey);
            showToast(t("api_key_copied"), "success");
          }}>
          {t("copy")}
        </Button>
      </div>
      <p className="text-subtle mt-2 text-xs">{t("copy_somewhere_safe")}</p>
    </div>
  );
}
