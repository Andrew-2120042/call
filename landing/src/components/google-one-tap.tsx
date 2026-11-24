"use client";

import { useEffect } from "react";
import { site } from "@/site.config";

type GoogleId = {
  initialize: (config: Record<string, unknown>) => void;
  prompt: () => void;
};
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
// Once per page load: Google warns (and FedCM refuses) when the prompt is set up twice.
let started = false;

/** Reads the email from Google's credential. Only used as a hint; the app re-verifies everything through Google. */
function emailFrom(credential: string): string | null {
  try {
    const payload = credential.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const data = JSON.parse(atob(payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), "=")));
    return typeof data.email === "string" ? data.email : null;
  } catch {
    return null;
  }
}

/**
 * Google's "Sign in with Google" prompt in the top-right corner. Picking an account hands off to the app's normal
 * Google sign-in with that account pre-selected, so new accounts, two-factor and every other check run as usual.
 */
export function GoogleOneTap() {
  useEffect(() => {
    if (!CLIENT_ID || started) return;
    started = true;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: CLIENT_ID,
        context: "signup",
        auto_select: false,
        cancel_on_tap_outside: true,
        itp_support: true,
        use_fedcm_for_prompt: true,
        callback: ({ credential }: { credential: string }) => {
          const hint = emailFrom(credential);
          const url = new URL(`${site.appUrl}/auth/google`);
          if (hint) url.searchParams.set("hint", hint);
          window.location.href = url.toString();
        },
      });
      window.google?.accounts.id.prompt();
    };
    document.head.appendChild(script);
  }, []);
  return null;
}
