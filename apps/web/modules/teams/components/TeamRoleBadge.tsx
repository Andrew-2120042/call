import { useLocale } from "@calcom/lib/hooks/useLocale";
import type { MembershipRole } from "@calcom/prisma/enums";
import { Badge } from "@calcom/ui/components/badge";

const ROLE_LABEL: Record<MembershipRole, string> = { OWNER: "owner", ADMIN: "admin", MEMBER: "member" };

export function TeamRoleBadge({ role, pending }: { role: MembershipRole; pending?: boolean }) {
  const { t } = useLocale();
  if (pending) {
    return (
      <Badge variant="orange" size="md">
        {t("pending")}
      </Badge>
    );
  }
  return (
    <Badge variant={role === "MEMBER" ? "gray" : "blue"} size="md">
      {t(ROLE_LABEL[role])}
    </Badge>
  );
}
