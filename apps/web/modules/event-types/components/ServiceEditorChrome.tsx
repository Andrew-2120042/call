"use client";

import type { VerticalTabItemProps } from "@calcom/ui/components/navigation";
import { PhoneFrame } from "./PhoneFrame";
import classNames from "classnames";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** Pill tab bar for the service editor. Active state follows ?tabName= (updated in-browser on click). */
export function ServiceTabs({ tabs }: { tabs: VerticalTabItemProps[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams?.get("tabName") ?? "setup";
  return (
    <nav
      className="no-scrollbar bg-subtle -mx-1 flex gap-1 overflow-x-auto rounded-full p-1"
      aria-label="Service settings"
      data-testid="service-tabs">
      {tabs
        .filter((tab) => !tab.hidden)
        .map((tab) => {
          const tabName = new URL(tab.href, "http://x").searchParams.get("tabName") ?? "setup";
          const active = tabName === current;
          return (
            <button
              key={tab.href}
              type="button"
              aria-current={active ? "page" : undefined}
              data-testid={`vertical-tab-${tab["data-testid"]}`}
              onClick={() => (tab.onClick ? tab.onClick(tab.name) : router.push(tab.href))}
              className={classNames(
                "flex-none whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors",
                active
                  ? "bg-default text-emphasis font-semibold shadow-[0_1px_2px_rgba(0,0,0,.08)]"
                  : "text-subtle hover:text-emphasis font-medium"
              )}>
              {tab.name}
            </button>
          );
        })}
    </nav>
  );
}

/**
 * The service's real booking page inside a phone. Reloads after each save so changes show up.
 */
export function ServicePhonePreview({ url, saving }: { url: string; saving: boolean }) {
  const [version, setVersion] = useState(0);
  const wasSaving = useRef(saving);
  useEffect(() => {
    if (wasSaving.current && !saving) setVersion((v) => v + 1);
    wasSaving.current = saving;
  }, [saving]);

  return (
    <div data-testid="service-phone-preview">
      <div className="flex items-center justify-between pb-3">
        <p className="text-subtle text-sm">Live preview</p>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-emphasis text-sm font-medium underline">
          Open
        </a>
      </div>
      <PhoneFrame screenBg="#ffffff" inkColor="#121212" fill>
        <iframe
          key={version}
          src={url}
          title="Booking page preview"
          className="h-full w-full border-0"
          loading="lazy"
        />
      </PhoneFrame>
    </div>
  );
}
