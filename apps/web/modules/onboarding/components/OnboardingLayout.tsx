"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Logo } from "@calcom/ui/components/logo";
import { signOut } from "next-auth/react";
import { Children, type ReactNode, Suspense } from "react";
import { Toaster } from "sonner";
import { OnboardingDebugNav } from "./OnboardingDebugNav";

// Setup is four screens: how you'll use it, your details, a few questions, your calendar.
export const ONBOARDING_STEPS = 4;

type OnboardingLayoutProps = {
  userEmail: string;
  currentStep?: number;
  totalSteps?: number;
  /** 0 to 1; overrides currentStep/totalSteps when a screen has steps of its own (the questions). */
  progress?: number;
  children: ReactNode;
};

/**
 * One card over a quiet landscape: the step on the left, a live preview of what it builds on the right,
 * and a thin progress line across the top of the card.
 */
export const OnboardingLayout = ({ currentStep, totalSteps, progress, children }: OnboardingLayoutProps) => {
  const { t } = useLocale();
  const [column1, column2] = Children.toArray(children);
  const done =
    progress ??
    (currentStep && totalSteps ? currentStep / totalSteps : currentStep ? currentStep / ONBOARDING_STEPS : 0);

  return (
    <div
      className="bg-default relative flex min-h-screen w-full flex-col overflow-hidden"
      data-testid="onboarding-frame">
      <Landscape />
      <header className="relative z-10 flex h-14 items-center justify-between px-5 md:px-8">
        <Logo small />
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/auth/logout" })}
          className="text-subtle hover:text-emphasis text-[12px]">
          {t("sign_out")}
        </button>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-3 pb-10 pt-2 md:px-6">
        <div className="border-subtle bg-default w-full max-w-[1040px] overflow-hidden rounded-2xl border shadow-[0_40px_120px_-40px_rgba(0,0,0,0.6)]">
          <div className="bg-subtle h-[3px] w-full" aria-hidden>
            <div
              className="bg-inverted h-full transition-[width] duration-500 ease-out"
              style={{ width: `${Math.max(0.04, Math.min(1, done)) * 100}%` }}
            />
          </div>
          <div className="grid min-h-[600px] grid-cols-1 lg:h-[640px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div className="flex min-h-0 flex-col px-6 py-7 sm:px-10 sm:py-9">{column1}</div>
            {column2 && (
              <div className="border-subtle bg-muted relative hidden min-h-0 overflow-hidden border-l lg:flex lg:flex-col lg:p-8">
                {column2}
              </div>
            )}
          </div>
        </div>
      </main>
      <Toaster position="bottom-right" />
      {process.env.NODE_ENV === "development" && (
        <Suspense fallback={null}>
          <OnboardingDebugNav />
        </Suspense>
      )}
    </div>
  );
};

/** Layered hills under a soft glow, drawn in the text colour at low strength so it suits light and dark. */
function Landscape() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div className="absolute inset-x-0 top-0 h-[70%] bg-[radial-gradient(ellipse_at_50%_0%,rgba(125,160,255,0.12),transparent_65%)]" />
      <svg
        className="text-emphasis absolute inset-x-0 bottom-0 h-[55%] w-full"
        viewBox="0 0 1440 500"
        preserveAspectRatio="none">
        <path
          d="M0 260 C 180 170 320 210 480 190 C 660 168 760 90 960 120 C 1140 148 1260 210 1440 170 L1440 500 L0 500 Z"
          fill="currentColor"
          opacity="0.035"
        />
        <path
          d="M0 330 C 220 260 380 300 560 280 C 760 258 880 200 1080 230 C 1240 254 1340 300 1440 280 L1440 500 L0 500 Z"
          fill="currentColor"
          opacity="0.05"
        />
        <path
          d="M0 410 C 240 360 420 390 640 372 C 860 354 1020 330 1200 352 C 1320 366 1390 380 1440 376 L1440 500 L0 500 Z"
          fill="currentColor"
          opacity="0.07"
        />
      </svg>
    </div>
  );
}
