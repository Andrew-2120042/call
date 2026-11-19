"use client";

import type { VerticalTabItemProps } from "@calcom/ui/components/navigation";
import { PhoneFrame } from "./PhoneFrame";
import classNames from "classnames";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** Underlined tab bar for the service editor. Active state follows ?tabName= (updated in-browser on click). */
export function ServiceTabs({ tabs }: { tabs: VerticalTabItemProps[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams?.get("tabName") ?? "setup";
  return (
    <nav
      // Fits its tabs instead of stretching across the column.
      className="no-scrollbar border-subtle flex max-w-full gap-5 overflow-x-auto border-b"
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
                "-mb-px flex-none whitespace-nowrap border-b-2 pb-2 pt-1 text-[13px] transition-colors",
                active
                  ? "border-emphasis text-emphasis font-medium"
                  : "text-subtle hover:text-emphasis border-transparent"
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
