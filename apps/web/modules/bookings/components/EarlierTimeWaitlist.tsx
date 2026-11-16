"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Icon } from "@calcom/ui/components/icon";
import { useState } from "react";

/** On a client's upcoming booking: get an email if an earlier time opens, and move there in one click. */
export function EarlierTimeWaitlist({ bookingUid }: { bookingUid: string }) {
  const { t, i18n } = useLocale();
  const [state, setState] = useState<"idle" | "saving" | "joined" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const join = async () => {
    setState("saving");
    setError(null);
    try {
      const res = await fetch("/api/waitlist/join-earlier", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ bookingUid, language: i18n.language || "en" }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.message ?? t("something_went_wrong"));
        setState("error");
        return;
      }
      setState("joined");
    } catch {
      setError(t("something_went_wrong"));
      setState("error");
    }
  };

  return (
    <div className="border-subtle bg-muted mt-6 rounded-xl border p-4 text-left" data-testid="earlier-waitlist">
      <p className="text-emphasis text-sm font-semibold">{t("waitlist_earlier_title")}</p>
      {state === "joined" ? (
        <p className="text-default mt-1 flex items-center gap-2 text-sm">
          <Icon name="check" className="h-4 w-4 flex-none" />
          {t("waitlist_earlier_joined")}
        </p>
      ) : (
        <>
          <p className="text-subtle mt-1 text-sm">{t("waitlist_earlier_body")}</p>
          <button
            type="button"
            onClick={join}
            disabled={state === "saving"}
            className="border-default text-emphasis hover:border-emphasis mt-3 inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-medium transition disabled:opacity-50"
            data-testid="earlier-waitlist-join">
            {state === "saving" && <Icon name="loader" className="h-4 w-4 animate-spin" />}
            {t("waitlist_earlier_button")}
          </button>
          {error && (
            <p className="text-error mt-2 text-sm" role="alert">
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}
