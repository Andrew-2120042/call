"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import classNames from "@calcom/ui/classNames";
import { Button } from "@calcom/ui/components/button";
import { LoaderIcon } from "@coss/ui/icons";
import type React from "react";
import { Suspense } from "react";

type HeaderPropsBase = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  CTA?: React.ReactNode;
  ctaClassName?: string;
  borderInShellHeader?: boolean;
};

type HeaderPropsWithBackButton = HeaderPropsBase & {
  backButton: true;
  onBackButtonClick: () => void;
};

type HeaderPropsWithoutBackButton = HeaderPropsBase & {
  backButton?: false;
  onBackButtonClick?: never;
};

type HeaderProps = HeaderPropsWithBackButton | HeaderPropsWithoutBackButton;

export default function Header({
  children,
  title,
  description,
  CTA,
  ctaClassName,
  borderInShellHeader,
  backButton,
  onBackButtonClick,
}: HeaderProps) {
  const { t } = useLocale();

  return (
    <div>
      <header
        className={classNames(
          "border-subtle mx-auto flex justify-between",
          borderInShellHeader && "pb-6",
          borderInShellHeader === undefined && "pb-6"
        )}>
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex items-center">
            {backButton && onBackButtonClick && (
              <Button
                variant="icon"
                size="sm"
                color="minimal"
                onClick={onBackButtonClick}
                className="rounded-md ltr:mr-2 rtl:ml-2"
                StartIcon="arrow-left"
                aria-label={t("go_back")}
              />
            )}
            <div>
              {title ? (
                <h1 className="text-emphasis mb-1 text-[26px] font-semibold leading-tight tracking-[-0.02em]">
                  {title}
                </h1>
              ) : (
                <div className="bg-emphasis mb-1 h-5 w-24 animate-pulse rounded-lg" />
              )}
              {description ? (
                <p className="text-subtle text-sm ltr:mr-4 rtl:ml-4">{description}</p>
              ) : (
                <div className="bg-emphasis h-5 w-32 animate-pulse rounded-lg" />
              )}
            </div>
          </div>
          <div className={classNames("shrink-0", ctaClassName)}>{CTA}</div>
        </div>
      </header>
      <Suspense fallback={<LoaderIcon className="mx-auto my-5 animate-spin" />}>
        <div className="sw-settings-card">{children}</div>
      </Suspense>
    </div>
  );
}
