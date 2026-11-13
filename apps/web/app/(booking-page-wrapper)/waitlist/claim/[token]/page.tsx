"use client";

import dayjs from "@calcom/dayjs";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button } from "@calcom/ui/components/button";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Offer = {
  status: string;
  isClaimable: boolean;
  isExpired: boolean;
  startTime: string;
  endTime: string;
  timeZone: string;
  offerExpiresAt: string | null;
  eventTitle: string;
  hostName: string | null;
};

type LoadState = { kind: "loading" } | { kind: "error"; message: string } | { kind: "ready"; offer: Offer };

const formatInZone = (iso: string, timeZone: string) =>
  `${dayjs(iso).tz(timeZone).format("dddd, MMMM D, YYYY h:mma")} (${timeZone})`;

export default function WaitlistClaimPage() {
  const { t } = useLocale();
  const router = useRouter();
  const params = useParams();
  const token = typeof params?.token === "string" ? params.token : "";
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/waitlist/claim?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const body = await res.json();
        if (cancelled) return;
        if (!res.ok) setState({ kind: "error", message: body.message ?? t("waitlist_claim_invalid") });
        else setState({ kind: "ready", offer: body });
      })
      .catch(() => !cancelled && setState({ kind: "error", message: t("waitlist_claim_invalid") }));
    return () => {
      cancelled = true;
    };
  }, [token, t]);

  const claim = async () => {
    setClaiming(true);
    setClaimError(null);
    try {
      const res = await fetch("/api/waitlist/claim", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const body = await res.json();
      if (!res.ok) {
        setClaimError(body.message ?? t("something_went_wrong"));
        setClaiming(false);
        return;
      }
      router.push(`/booking/${body.bookingUid}`);
    } catch {
      setClaimError(t("something_went_wrong"));
      setClaiming(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-subtle px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-subtle bg-default p-8 text-center shadow-sm">
        {state.kind === "loading" && <p className="text-subtle">{t("loading")}</p>}

        {state.kind === "error" && (
          <>
            <h1 className="text-emphasis text-xl font-semibold">{t("waitlist_claim_unavailable_title")}</h1>
            <p className="text-subtle mt-2">{state.message}</p>
          </>
        )}

        {state.kind === "ready" && (
          <>
            <h1 className="text-emphasis text-xl font-semibold">
              {state.offer.isClaimable ? t("waitlist_offer_title") : t("waitlist_claim_unavailable_title")}
            </h1>
            <p className="text-emphasis mt-4 font-medium">{state.offer.eventTitle}</p>
            {state.offer.hostName && <p className="text-subtle">{state.offer.hostName}</p>}
            <p className="text-default mt-2">{formatInZone(state.offer.startTime, state.offer.timeZone)}</p>

            {state.offer.isClaimable ? (
              <>
                {state.offer.offerExpiresAt && (
                  <p className="text-subtle mt-4 text-sm">
                    {t("waitlist_claim_before", {
                      expiresAt: formatInZone(state.offer.offerExpiresAt, state.offer.timeZone),
                      // React escapes text itself; letting i18next escape too would print "&#x2F;".
                      interpolation: { escapeValue: false },
                    })}
                  </p>
                )}
                <Button className="mt-6 w-full justify-center" loading={claiming} onClick={claim}>
                  {t("waitlist_offer_cta")}
                </Button>
              </>
            ) : (
              <p className="text-subtle mt-4">
                {state.offer.status === "CLAIMED"
                  ? t("waitlist_claim_already_claimed")
                  : t("waitlist_claim_expired")}
              </p>
            )}
            {claimError && <p className="mt-4 text-sm text-red-600">{claimError}</p>}
          </>
        )}
      </div>
    </main>
  );
}
