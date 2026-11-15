"use client";

import { MANAGED_MEMBER_EDITABLE_FIELDS } from "./lockedFields";
import { Icon } from "@calcom/ui/components/icon";
import { createContext, type ReactElement, type ReactNode, useContext } from "react";

type LockState = { isManagedCopy: boolean; teamName: string | null };

const ManagedFieldLockContext = createContext<LockState>({ isManagedCopy: false, teamName: null });

export function ManagedFieldLockProvider({ value, children }: { value: LockState; children: ReactNode }) {
  return <ManagedFieldLockContext.Provider value={value}>{children}</ManagedFieldLockContext.Provider>;
}

const lockedIcon = (
  <Icon name="lock" className="text-subtle ms-1 inline h-3 w-3" aria-label="Set by your team" />
);

/**
 * On a member's copy of a managed service, everything except location, schedule and calendar is set by the
 * team's template, so those inputs are shown read-only.
 */
export function useManagedFieldLock() {
  const { isManagedCopy, teamName } = useContext(ManagedFieldLockContext);
  const isLocked = (field: string) => isManagedCopy && !MANAGED_MEMBER_EDITABLE_FIELDS.has(field);
  return {
    isManagedCopy,
    teamName,
    isLocked,
    shouldLockDisableProps: (field: string, _opts?: { simple: boolean }) => {
      const locked = isLocked(field);
      const props = { disabled: locked, LockedIcon: locked ? lockedIcon : (false as const) } as {
        disabled: boolean;
        LockedIcon: false | ReactElement;
        isLocked: boolean;
      };
      // Callers spread these props onto inputs; keeping isLocked non-enumerable stops it reaching the DOM.
      Object.defineProperty(props, "isLocked", { value: locked, enumerable: false });
      return props;
    },
  };
}
