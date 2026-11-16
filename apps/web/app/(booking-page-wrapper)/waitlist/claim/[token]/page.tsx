"use client";

import dayjs from "@calcom/dayjs";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import {
  BookingSummary,
  ClientHeader,
  ClientPageShell,
  LoadingCard,
  Notice,
  PrimaryButton,
} from "@calcom/web/modules/client-pages/ClientPage";
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

  if (state.kind === "loading") {
    return (
      <ClientPageShell testId="waitlist-claim-page">
        <LoadingCard />
      </ClientPageShell>
    );
  }

  if (state.kind === "error") {
    return (
      <ClientPageShell testId="waitlist-claim-page">
        <ClientHeader
          icon="circle-alert"
          tone="warning"
          title={t("waitlist_claim_unavailable_title")}
          subtitle={state.message}
        />
      </ClientPageShell>
    );
  }

  const { offer } = state;
  return (
    <ClientPageShell testId="waitlist-claim-page">
      <ClientHeader
        icon={offer.isClaimable ? "calendar" : "circle-alert"}
        tone={offer.isClaimable ? "success" : "warning"}
        title={offer.isClaimable ? t("waitlist_offer_title") : t("waitlist_claim_unavailable_title")}
        subtitle={
          offer.isClaimable
            ? undefined
            : offer.status === "CLAIMED"
              ? t("waitlist_claim_already_claimed")
              : t("waitlist_claim_expired")
        }
      />
      <BookingSummary
        title={offer.eventTitle}
        hostName={offer.hostName}
        startTime={offer.startTime}
        endTime={offer.endTime}
        timeZone={offer.timeZone}
      />
      {offer.isClaimable && (
        <div className="mt-6">
          <PrimaryButton onClick={claim} loading={claiming} testId="waitlist-claim-button">
            {t("waitlist_offer_cta")}
          </PrimaryButton>
          {offer.offerExpiresAt && (
            <Notice>
              {t("waitlist_claim_before", {
                expiresAt: dayjs(offer.offerExpiresAt).tz(offer.timeZone).format("ddd, MMM D, h:mma"),
                // React escapes text itself; letting i18next escape too would print "&#x2F;".
                interpolation: { escapeValue: false },
              })}
            </Notice>
          )}
        </div>
      )}
      {claimError && <Notice tone="error">{claimError}</Notice>}
    </ClientPageShell>
  );
}
