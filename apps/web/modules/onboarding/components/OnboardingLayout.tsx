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
 * One card on a plain background: the step on the left, a live preview of what it builds on the right,
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
