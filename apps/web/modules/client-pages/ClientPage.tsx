"use client";

import dayjs from "@calcom/dayjs";
import { APP_NAME } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import type { IconName } from "@calcom/ui/components/icon";
import { Icon } from "@calcom/ui/components/icon";
import classNames from "classnames";
import type { ReactNode } from "react";

// Shared look for the pages clients land on from emails (waitlist, claim, confirm attendance), so they feel
// like the booking page they came from rather than a bare form.

export function ClientPageShell(props: { children: ReactNode; wide?: boolean; testId?: string }) {
  const { t } = useLocale();
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-[#f6f5f2] px-4 py-10 text-[#121212]"
      style={{ fontFamily: "var(--font-sans)" }}
      data-testid={props.testId}>
      <main
        className="w-full bg-white"
        style={{
          maxWidth: props.wide ? 560 : 460,
          padding: "36px 28px 30px",
          borderRadius: 28,
          boxShadow: "0 0 0 1px rgba(0,0,0,.05), 0 24px 60px -36px rgba(0,0,0,.35)",
        }}>
        {props.children}
      </main>
      <p className="mt-6 text-[12px] text-[#9b9a95]">{t("booked_with_app", { appName: APP_NAME })}</p>
    </div>
  );
}

type Tone = "neutral" | "success" | "warning";

const TONES: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: "#f3f2ef", fg: "#121212" },
  success: { bg: "#e3f4e8", fg: "#1f7a3f" },
  warning: { bg: "#fbeee0", fg: "#9a4a12" },
};

export function ClientHeader(props: { icon: IconName; tone?: Tone; title: string; subtitle?: ReactNode }) {
  const tone = TONES[props.tone ?? "neutral"];
  return (
    <header className="text-center">
      <span
        className="mx-auto grid place-items-center"
        style={{ width: 52, height: 52, borderRadius: 16, background: tone.bg, color: tone.fg }}>
        <Icon name={props.icon} className="h-[22px] w-[22px]" />
      </span>
      <h1 className="mt-4 text-[24px] font-bold leading-tight tracking-[-0.02em]">{props.title}</h1>
      {props.subtitle && (
        <p className="mx-auto mt-1.5 max-w-[36ch] text-[14.5px] leading-relaxed text-[#6b6a66]">
          {props.subtitle}
        </p>
      )}
    </header>
  );
}

/** What the client is booking: service, host, and the time in their own timezone. */
export function BookingSummary(props: {
  title: string;
  hostName: string | null;
  startTime?: string;
  endTime?: string;
  timeZone?: string;
}) {
  const start = props.startTime && props.timeZone ? dayjs(props.startTime).tz(props.timeZone) : null;
  const end = props.endTime && props.timeZone ? dayjs(props.endTime).tz(props.timeZone) : null;
  return (
    <div className="mt-6 bg-[#f6f5f2] text-left" style={{ borderRadius: 18, padding: "16px 18px" }}>
      <div className="text-[15.5px] font-semibold">{props.title}</div>
      {props.hostName && <div className="mt-0.5 text-[13.5px] text-[#6b6a66]">{props.hostName}</div>}
      {start && (
        <div className="mt-3 flex flex-col text-[14px]" style={{ rowGap: 6 }}>
          <span className="flex items-center" style={{ columnGap: 10 }}>
            <Icon name="calendar" className="h-4 w-4 flex-none text-[#6b6a66]" />
            {start.format("dddd, MMMM D, YYYY")}
          </span>
          <span className="flex items-center" style={{ columnGap: 10 }}>
            <Icon name="clock" className="h-4 w-4 flex-none text-[#6b6a66]" />
            {start.format("h:mma")}
            {end ? ` – ${end.format("h:mma")}` : ""}
          </span>
          <span className="flex items-center text-[13px] text-[#6b6a66]" style={{ columnGap: 10 }}>
            <Icon name="globe" className="h-4 w-4 flex-none" />
            {props.timeZone}
          </span>
        </div>
      )}
    </div>
  );
}

export function PrimaryButton(props: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  loading?: boolean;
  disabled?: boolean;
  testId?: string;
}) {
  return (
    <button
      type={props.type ?? "button"}
      onClick={props.onClick}
      disabled={props.disabled || props.loading}
      data-testid={props.testId}
      className="flex w-full items-center justify-center bg-[#121212] font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
      style={{ height: 50, borderRadius: 999, fontSize: 15, columnGap: 8 }}>
      {props.loading && <Icon name="loader" className="h-4 w-4 animate-spin" />}
      {props.children}
    </button>
  );
}

export function Notice(props: { children: ReactNode; tone?: "muted" | "error" }) {
  return (
    <p
      className={classNames(
        "mt-4 text-center text-[13.5px] leading-relaxed",
        props.tone === "error" ? "text-[#b42318]" : "text-[#6b6a66]"
      )}
      role={props.tone === "error" ? "alert" : undefined}>
      {props.children}
    </p>
  );
}

export function LoadingCard() {
  return (
    <div className="flex flex-col items-center py-6" aria-busy>
      <Icon name="loader" className="h-5 w-5 animate-spin text-[#9b9a95]" />
    </div>
  );
}

export const fieldClass =
  "block w-full border border-[#e4e3df] bg-white px-3.5 text-[14.5px] text-[#121212] transition focus:border-[#121212] focus:outline-none";
