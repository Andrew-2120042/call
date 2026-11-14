"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Icon } from "@calcom/ui/components/icon";
import classNames from "classnames";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** The assistant's own entry at the top of the sidebar, set apart from the regular menu. */
export function AssistantSidebarButton() {
  const { t } = useLocale();
  const pathname = usePathname();
  const active = pathname?.startsWith("/assistant") ?? false;
  return (
    <Link
      href="/assistant"
      aria-current={active ? "page" : undefined}
      data-testid="sidebar-assistant"
      className={classNames(
        "group mt-4 hidden items-center gap-2.5 rounded-2xl px-3 py-2.5 transition-colors lg:flex",
        active
          ? "bg-inverted text-inverted"
          : "bg-default text-emphasis border-subtle hover:border-emphasis border shadow-[0_1px_2px_rgba(0,0,0,.04)]"
      )}>
      <span
        className={classNames(
          "grid h-7 w-7 flex-none place-items-center rounded-xl",
          active ? "bg-white/15" : "bg-inverted text-inverted"
        )}>
        <Icon name="sparkles" className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold leading-tight">{t("assistant_page_title")}</span>
        <span
          className={classNames(
            "block truncate text-[11px] leading-tight",
            active ? "opacity-70" : "text-subtle"
          )}>
          {t("assistant_sidebar_hint")}
        </span>
      </span>
    </Link>
  );
}
