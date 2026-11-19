"use client";

import dayjs from "@calcom/dayjs";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import classNames from "@calcom/ui/classNames";
import { Icon } from "@calcom/ui/components/icon";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePeek } from "~/peek/peekStore";

const SEEN_KEY = "nodslot-notifications-seen-at";

const TONE = {
  request: { dot: "bg-amber-400", key: "notif_request" },
  booked: { dot: "bg-emerald-400", key: "notif_booked" },
  cancelled: { dot: "bg-red-400", key: "notif_cancelled" },
  waitlist: { dot: "bg-sky-400", key: "notif_waitlist" },
} as const;

function readSeenAt() {
  try {
    return Number(localStorage.getItem(SEEN_KEY) ?? 0);
  } catch {
    return 0;
  }
}

/** The top-bar bell: new requests, bookings, cancellations and waitlist joins, each opening its quick view. */
export function NotificationsBell() {
  const { t } = useLocale();
  const openPeek = usePeek((state) => state.open);
  const [open, setOpen] = useState(false);
  const [seenAt, setSeenAt] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { data } = trpc.viewer.home.notifications.useQuery(undefined, {
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  // The open list keeps its "new" marks; they clear once it's closed.
  useEffect(() => {
    if (!open) setSeenAt(readSeenAt());
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items = data?.items ?? [];
  const unread = items.filter((item) => new Date(item.at).getTime() > seenAt).length;

  const toggle = () => {
    if (!open) {
      try {
        localStorage.setItem(SEEN_KEY, String(Date.now()));
      } catch {
        // Without storage the dot just comes back on reload.
      }
    }
    setOpen((value) => !value);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label={t("notif_title")}
        data-testid="topbar-notifications"
        className="text-subtle hover:text-emphasis hover:bg-subtle relative grid h-7 w-7 place-items-center rounded-md transition">
        <Icon name="bell" className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div
          className="bg-default border-subtle absolute right-0 top-full z-50 mt-1.5 w-[360px] overflow-hidden rounded-lg border shadow-2xl"
          data-testid="notifications-panel">
          <div className="border-subtle flex items-center justify-between border-b px-4 py-2.5">
            <p className="text-emphasis text-[13px] font-medium">{t("notif_title")}</p>
            {!!data?.pendingCount && (
              <Link
                href="/bookings/unconfirmed"
                onClick={() => setOpen(false)}
                className="text-[12px] text-amber-300 hover:text-amber-200">
                {t("notif_pending", { count: data.pendingCount })}
              </Link>
            )}
          </div>
          {items.length === 0 ? (
            <p className="text-subtle px-4 py-8 text-center text-[13px]">{t("notif_empty")}</p>
          ) : (
            <ul className="max-h-[420px] overflow-y-auto py-1">
              {items.map((item) => {
                const isNew = new Date(item.at).getTime() > seenAt;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        openPeek(item.target);
                      }}
                      className="hover:bg-subtle flex w-full items-start gap-3 px-4 py-2.5 text-left">
                      <span
                        className={classNames("mt-1.5 h-2 w-2 shrink-0 rounded-full", TONE[item.kind].dot)}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="text-emphasis block text-[13px]">
                          {t(TONE[item.kind].key, { name: item.name || t("notif_someone") })}
                        </span>
                        <span className="text-subtle block truncate text-[12px]">
                          {item.service} · {dayjs(item.startTime).format("ddd D MMM, h:mma")}
                        </span>
                      </span>
                      <span
                        className={classNames(
                          "shrink-0 text-[11px]",
                          isNew ? "text-emphasis" : "text-muted"
                        )}>
                        {dayjs(item.at).fromNow(true)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
