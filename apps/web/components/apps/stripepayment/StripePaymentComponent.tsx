"use client";

import getStripe from "@calcom/app-store/stripepayment/lib/client";
import { WEBAPP_URL } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button } from "@calcom/ui/components/button";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";

type Props = {
  clientSecret: string;
  /** The owner's own Stripe publishable key (Stripe Connect). */
  publishableKey?: string;
  bookingUid: string;
  /** "HOLD" saves the card for a no-show fee; anything else charges now. */
  paymentOption: string | null;
};

function Form({ bookingUid, paymentOption }: Pick<Props, "bookingUid" | "paymentOption">) {
  const { t } = useLocale();
  const stripe = useStripe();
  const elements = useElements();
  const [status, setStatus] = useState<"idle" | "processing">("idle");
  const [error, setError] = useState<string | null>(null);
  const isHold = paymentOption === "HOLD";
  const returnUrl = `${WEBAPP_URL}/booking/${bookingUid}`;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements || status === "processing") return;
    setStatus("processing");
    setError(null);
    // Stripe redirects to return_url only when the card needs an extra step (e.g. 3-D Secure).
    const result = isHold
      ? await stripe.confirmSetup({
          elements,
          redirect: "if_required",
          confirmParams: { return_url: returnUrl },
        })
      : await stripe.confirmPayment({
          elements,
          redirect: "if_required",
          confirmParams: { return_url: returnUrl },
        });
    if (result.error) {
      setError(result.error.message ?? t("something_went_wrong"));
      setStatus("idle");
      return;
    }
    // The webhook marks the booking paid; the booking page shows the result.
    window.location.assign(returnUrl);
  };

  return (
    <form onSubmit={submit} className="mt-4" data-testid="stripe-payment-form">
      <PaymentElement onChange={() => setError(null)} />
      {error && (
        <p className="text-error mt-3 text-sm" role="alert">
          {error}
        </p>
      )}
      <div className="mt-5 flex justify-end">
        <Button type="submit" loading={status === "processing"} disabled={!stripe || !elements}>
          {isHold ? t("submit_card") : t("pay_now")}
        </Button>
      </div>
    </form>
  );
}

export function StripePaymentComponent(props: Props) {
  const [theme, setTheme] = useState<"stripe" | "night">("night");

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "night" : "stripe");
  }, []);

  return (
    <Elements
      stripe={getStripe(props.publishableKey)}
      options={{ clientSecret: props.clientSecret, appearance: { theme } }}>
      <Form bookingUid={props.bookingUid} paymentOption={props.paymentOption} />
    </Elements>
  );
}
