"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

// Only accept a plain email as the hint; anything else is dropped rather than passed on to Google.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function GoogleHandoff() {
  const { t } = useLocale();
  const params = useSearchParams();
  const { status } = useSession();
  const started = useRef(false);

  // Waits for the session check to finish first: starting sign-in while it runs races two CSRF cookies,
  // and NextAuth then bounces the request to the login page.
  useEffect(() => {
    if (status === "loading" || started.current) return;
    started.current = true;
    if (status === "authenticated") {
      window.location.href = "/home";
      return;
    }
    const hint = params?.get("hint") ?? "";
    void signIn("google", { callbackUrl: "/home" }, EMAIL.test(hint) ? { login_hint: hint } : undefined);
  }, [params, status]);

  return (
    <div className="bg-default flex min-h-screen items-center justify-center">
      <p className="text-subtle text-sm">{t("google_handoff_signing_in")}</p>
    </div>
  );
}
