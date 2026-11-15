"use client";

import type { ChildrenEventType } from "@calcom/features/eventtypes/lib/childrenEventType";
import type { FormValues, Host } from "@calcom/features/eventtypes/lib/types";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { MembershipRole, SchedulingType } from "@calcom/prisma/enums";
import { Avatar } from "@calcom/ui/components/avatar";
import { Button } from "@calcom/ui/components/button";
import { Checkbox, Switch } from "@calcom/ui/components/form";
import { Icon } from "@calcom/ui/components/icon";
import classNames from "classnames";
import { useFormContext } from "react-hook-form";

type AssignableMember = {
  id: number;
  name: string | null;
  email: string;
  avatar: string;
  username?: string | null;
  membership?: MembershipRole;
  profile?: ChildrenEventType["owner"]["profile"];
};

const ASSIGNMENT_OPTIONS = [
  {
    value: SchedulingType.ROUND_ROBIN,
    title: "round_robin",
    body: "round_robin_description",
    icon: "refresh-cw",
  },
  { value: SchedulingType.COLLECTIVE, title: "collective", body: "collective_description", icon: "users" },
] as const;

const newHost = (userId: number, isFixed: boolean): Host => ({
  userId,
  isFixed,
  priority: 2,
  weight: 100,
  scheduleId: null,
  groupId: null,
});

export default function EventTeamAssignmentTab({ teamMembers }: { teamMembers: AssignableMember[] }) {
  const form = useFormContext<FormValues>();
  if (form.watch("schedulingType") === SchedulingType.MANAGED) {
    return <ManagedAssignment teamMembers={teamMembers} />;
  }
  return <SharedAssignment teamMembers={teamMembers} />;
}

/** Managed services: each ticked member gets their own copy on their personal page. */
function ManagedAssignment({ teamMembers }: { teamMembers: AssignableMember[] }) {
  const { t } = useLocale();
  const form = useFormContext<FormValues>();
  const children = form.watch("children") ?? [];
  const slug = form.watch("slug");
  const assigned = new Map(children.map((child) => [child.owner.id, child]));

  const toChild = (member: AssignableMember): ChildrenEventType => ({
    value: String(member.id),
    label: member.name || member.email,
    created: false,
    slug,
    hidden: false,
    owner: {
      id: member.id,
      name: member.name ?? "",
      email: member.email,
      avatar: member.avatar,
      username: member.username ?? "",
      membership: member.membership ?? MembershipRole.MEMBER,
      eventTypeSlugs: [],
      profile: member.profile as ChildrenEventType["owner"]["profile"],
    },
  });
  const setChildren = (next: ChildrenEventType[]) =>
    form.setValue("children", next, { shouldDirty: true, shouldTouch: true });
  const allAssigned = teamMembers.length > 0 && teamMembers.every((m) => assigned.has(m.id));

  return (
    <section className="border-subtle rounded-lg border" data-testid="managed-assignment">
      <header className="border-subtle flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div>
          <h3 className="text-emphasis text-sm font-medium">{t("managed_service_members")}</h3>
          <p className="text-subtle mt-0.5 max-w-[60ch] text-xs">{t("managed_service_members_body")}</p>
        </div>
        {teamMembers.length > 1 && (
          <Button
            size="sm"
            color="secondary"
            onClick={() => setChildren(allAssigned ? [] : teamMembers.map((m) => assigned.get(m.id) ?? toChild(m)))}
            data-testid="toggle-all-managed">
            {allAssigned ? t("team_hosts_clear") : t("team_hosts_add_all")}
          </Button>
        )}
      </header>
      <ul className="divide-subtle divide-y">
        {teamMembers.map((member) => {
          const label = member.name || member.email;
          const child = assigned.get(member.id);
          return (
            <li key={member.id} className="flex items-center gap-3 px-5 py-3" data-testid="managed-member-row">
              <Checkbox
                id={`managed-${member.id}`}
                checked={!!child}
                onCheckedChange={(checked) =>
                  setChildren(
                    checked === true
                      ? [...children, toChild(member)]
                      : children.filter((c) => c.owner.id !== member.id)
                  )
                }
                aria-label={label}
              />
              <label htmlFor={`managed-${member.id}`} className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                <Avatar size="sm" imageSrc={member.avatar} alt={label} />
                <span className="min-w-0">
                  <span className="text-emphasis block truncate text-sm">{label}</span>
                  {member.username && (
                    <span className="text-subtle block truncate text-xs">/{member.username}/{slug}</span>
                  )}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function SharedAssignment({ teamMembers }: { teamMembers: AssignableMember[] }) {
  const { t } = useLocale();
  const form = useFormContext<FormValues>();
  const schedulingType = form.watch("schedulingType") ?? SchedulingType.ROUND_ROBIN;
  const hosts = form.watch("hosts") ?? [];
  const isCollective = schedulingType === SchedulingType.COLLECTIVE;
  const hostById = new Map(hosts.map((host) => [host.userId, host]));

  const setHosts = (next: Host[]) => form.setValue("hosts", next, { shouldDirty: true, shouldTouch: true });

  const setSchedulingType = (value: SchedulingType) => {
    if (value === schedulingType) return;
    form.setValue("schedulingType", value, { shouldDirty: true });
    // Everyone attends a collective meeting, so every host is fixed there.
    setHosts(hosts.map((host) => ({ ...host, isFixed: value === SchedulingType.COLLECTIVE })));
  };

  const toggleHost = (userId: number, selected: boolean) => {
    if (selected) setHosts([...hosts, newHost(userId, isCollective)]);
    else setHosts(hosts.filter((host) => host.userId !== userId));
  };

  const allSelected = teamMembers.length > 0 && teamMembers.every((member) => hostById.has(member.id));

  return (
    <div className="flex flex-col gap-6" data-testid="team-assignment-tab">
      <section className="border-subtle rounded-lg border">
        <header className="border-subtle border-b px-5 py-4">
          <h3 className="text-emphasis text-sm font-medium">{t("assignment")}</h3>
          <p className="text-subtle mt-0.5 text-xs">{t("team_assignment_body")}</p>
        </header>
        <div className="grid gap-3 p-5 sm:grid-cols-2" role="radiogroup">
          {ASSIGNMENT_OPTIONS.map((option) => {
            const active = schedulingType === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSchedulingType(option.value)}
                data-testid={`assignment-${option.value.toLowerCase()}`}
                className={classNames(
                  "flex items-start gap-3 rounded-lg border px-4 py-3 text-left transition",
                  active ? "border-emphasis bg-cal-muted" : "border-subtle hover:bg-cal-muted"
                )}>
                <Icon name={option.icon} className="text-emphasis mt-0.5 h-4 w-4 flex-none" />
                <span>
                  <span className="text-emphasis block text-sm font-medium">{t(option.title)}</span>
                  <span className="text-subtle block text-xs">{t(option.body)}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="border-subtle rounded-lg border">
        <header className="border-subtle flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
          <div>
            <h3 className="text-emphasis text-sm font-medium">{t("hosts")}</h3>
            <p className="text-subtle mt-0.5 text-xs">
              {isCollective ? t("team_hosts_collective_body") : t("team_hosts_round_robin_body")}
            </p>
          </div>
          {teamMembers.length > 1 && (
            <Button
              size="sm"
              color="secondary"
              onClick={() =>
                setHosts(
                  allSelected
                    ? []
                    : teamMembers.map((member) => hostById.get(member.id) ?? newHost(member.id, isCollective))
                )
              }
              data-testid="toggle-all-hosts">
              {allSelected ? t("team_hosts_clear") : t("team_hosts_add_all")}
            </Button>
          )}
        </header>

        {hosts.length === 0 && (
          <p className="text-attention flex items-center gap-2 px-5 pt-4 text-xs" role="alert">
            <Icon name="info" className="h-3.5 w-3.5" />
            {t("team_hosts_none")}
          </p>
        )}

        <ul className="divide-subtle divide-y">
          {teamMembers.map((member) => {
            const host = hostById.get(member.id);
            const label = member.name || member.email;
            return (
              <li key={member.id} className="flex items-center gap-3 px-5 py-3" data-testid="host-row">
                <Checkbox
                  id={`host-${member.id}`}
                  checked={!!host}
                  onCheckedChange={(checked) => toggleHost(member.id, checked === true)}
                  aria-label={label}
                />
                <label
                  htmlFor={`host-${member.id}`}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                  <Avatar size="sm" imageSrc={member.avatar} alt={label} />
                  <span className="min-w-0">
                    <span className="text-emphasis block truncate text-sm">{label}</span>
                    {member.name && (
                      <span className="text-subtle block truncate text-xs">{member.email}</span>
                    )}
                  </span>
                </label>
                {host && !isCollective && (
                  <span className="flex items-center gap-2">
                    <span className="text-subtle text-xs">{t("team_host_always_attends")}</span>
                    <Switch
                      size="sm"
                      checked={host.isFixed}
                      onCheckedChange={(isFixed) =>
                        setHosts(hosts.map((h) => (h.userId === member.id ? { ...h, isFixed } : h)))
                      }
                    />
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
