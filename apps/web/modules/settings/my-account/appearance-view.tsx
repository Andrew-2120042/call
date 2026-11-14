"use client";

import SettingsHeader from "@calcom/features/settings/appDir/SettingsHeader";
import SectionBottomActions from "@calcom/features/settings/SectionBottomActions";
import ThemeLabel from "@calcom/features/settings/ThemeLabel";
import { APP_NAME, DEFAULT_DARK_BRAND_COLOR, DEFAULT_LIGHT_BRAND_COLOR } from "@calcom/lib/constants";
import useGetBrandingColours, { checkWCAGContrastColor } from "@calcom/lib/getBrandColours";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import useTheme from "@calcom/lib/hooks/useTheme";
import { validateBookerLayouts } from "@calcom/lib/validateBookerLayouts";
import type { userMetadata } from "@calcom/prisma/zod-utils";
import type { RouterOutputs } from "@calcom/trpc/react";
import { trpc } from "@calcom/trpc/react";
import { Alert } from "@calcom/ui/components/alert";
import { Button } from "@calcom/ui/components/button";
import { ColorPicker, Form, SettingsToggle } from "@calcom/ui/components/form";
import { showToast } from "@calcom/ui/components/toast";
import { useCalcomTheme } from "@calcom/ui/styles";
import { revalidateSettingsAppearance } from "app/(use-page-wrapper)/settings/(settings-layout)/my-account/appearance/actions";
import { revalidateHasTeamPlan } from "app/cache/membership";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";
import { BookerLayoutSelector } from "~/settings/components/BookerLayoutSelector";

const useBrandColors = (
  currentTheme: string | null,
  {
    brandColor,
    darkBrandColor,
  }: {
    brandColor?: string | null;
    darkBrandColor?: string | null;
  }
): void => {
  const brandTheme = useGetBrandingColours({
    lightVal: brandColor,
    darkVal: darkBrandColor,
  });
  const selectedTheme = currentTheme ? brandTheme[currentTheme as "light" | "dark"] : {};
  useCalcomTheme({
    root: selectedTheme,
  });
};

const AppearanceView = ({
  user,
  hasPaidPlan,
}: {
  user: RouterOutputs["viewer"]["me"]["get"];
  hasPaidPlan: boolean;
}) => {
  const { t } = useLocale();
  const utils = trpc.useUtils();
  const session = useSession();
  const isApartOfOrganization = session.data?.user.org?.id;
  const [darkModeError, setDarkModeError] = useState(false);
  const [lightModeError, setLightModeError] = useState(false);
  const [isCustomBrandColorChecked, setIsCustomBranColorChecked] = useState(
    user?.brandColor !== DEFAULT_LIGHT_BRAND_COLOR || user?.darkBrandColor !== DEFAULT_DARK_BRAND_COLOR
  );
  const [hideBrandingValue, setHideBrandingValue] = useState(user?.hideBranding ?? false);
  useTheme(user?.appTheme);
  useBrandColors(user?.appTheme ?? null, {
    brandColor: user?.brandColor,
    darkBrandColor: user?.darkBrandColor,
  });

  const userAppThemeFormMethods = useForm({
    defaultValues: {
      appTheme: user.appTheme,
    },
  });

  const {
    formState: { isSubmitting: isUserAppThemeSubmitting, isDirty: isUserAppThemeDirty },
    reset: resetUserAppThemeReset,
  } = userAppThemeFormMethods;

  const userThemeFormMethods = useForm({
    defaultValues: {
      theme: user.theme,
    },
  });

  const {
    formState: { isSubmitting: isUserThemeSubmitting, isDirty: isUserThemeDirty },
    reset: resetUserThemeReset,
  } = userThemeFormMethods;

  const bookerLayoutFormMethods = useForm({
    defaultValues: {
      metadata: user.metadata as z.infer<typeof userMetadata>,
    },
  });

  const {
    formState: { isSubmitting: isBookerLayoutFormSubmitting, isDirty: isBookerLayoutFormDirty },
    reset: resetBookerLayoutThemeReset,
  } = bookerLayoutFormMethods;

  const DEFAULT_BRAND_COLOURS = {
    light: user.brandColor ?? DEFAULT_LIGHT_BRAND_COLOR,
    dark: user.darkBrandColor ?? DEFAULT_DARK_BRAND_COLOR,
  };

  const brandColorsFormMethods = useForm({
    defaultValues: {
      brandColor: DEFAULT_BRAND_COLOURS.light,
      darkBrandColor: DEFAULT_BRAND_COLOURS.dark,
    },
  });

  const {
    formState: { isSubmitting: isBrandColorsFormSubmitting, isDirty: isBrandColorsFormDirty },
    reset: resetBrandColorsThemeReset,
  } = brandColorsFormMethods;

  const selectedTheme = userThemeFormMethods.watch("theme");
  const selectedThemeIsDark =
    selectedTheme === "dark" ||
    (selectedTheme === "" &&
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark"));

  const mutation = trpc.viewer.me.updateProfile.useMutation({
    onSuccess: async (data) => {
      await utils.viewer.me.invalidate();
      revalidateSettingsAppearance();
      revalidateHasTeamPlan();
      showToast(t("settings_updated_successfully"), "success");
      resetBrandColorsThemeReset({ brandColor: data.brandColor, darkBrandColor: data.darkBrandColor });
      resetBookerLayoutThemeReset({ metadata: data.metadata });
      resetUserThemeReset({ theme: data.theme });
      resetUserAppThemeReset({ appTheme: data.appTheme });
    },
    onError: (error) => {
      if (error.message) {
        showToast(error.message, "error");
      } else {
        showToast(t("error_updating_settings"), "error");
      }
    },
    onSettled: async () => {
      await utils.viewer.me.invalidate();
      revalidateSettingsAppearance();
      revalidateHasTeamPlan();
    },
  });

  const currentAppTheme = (userAppThemeFormMethods.watch("appTheme") ?? "system") as string;
  const pickAppTheme = (value: "system" | "light" | "dark") => {
    userAppThemeFormMethods.setValue("appTheme", value);
    mutation.mutate({ appTheme: value === "system" ? null : value });
  };

  return (
    <SettingsHeader title={t("appearance")} description={t("appearance_description")}>
      <section className="bg-default border-subtle rounded-[22px] border p-6" data-testid="app-theme-picker">
        <p className="text-emphasis font-semibold">{t("app_theme")}</p>
        <p className="text-subtle mt-1 text-sm">{t("sw_app_theme_hint")}</p>
        <div className="mt-5 grid grid-cols-3 gap-3" role="radiogroup" aria-label={t("app_theme")}>
          {(
            [
              {
                id: "system",
                label: t("theme_system"),
                bg: "linear-gradient(90deg,#f6f5f3 50%,#161616 50%)",
              },
              { id: "light", label: t("light"), bg: "#f6f5f3" },
              { id: "dark", label: t("dark"), bg: "#161616" },
            ] as const
          ).map((option) => {
            const active = currentAppTheme === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={active}
                data-testid={`app-theme-${option.id}`}
                onClick={() => pickAppTheme(option.id)}
                className={
                  active
                    ? "border-emphasis rounded-2xl border-2 p-2 text-left"
                    : "border-subtle hover:border-emphasis rounded-2xl border-2 p-2 text-left transition"
                }>
                <span
                  className="border-subtle block h-20 rounded-xl border"
                  style={{ background: option.bg }}
                  aria-hidden
                />
                <span className="text-emphasis mt-2 block px-1 text-sm font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {isApartOfOrganization ? null : (
        <>
          <section className="bg-default border-subtle mt-4 flex flex-wrap items-center justify-between gap-4 rounded-[22px] border p-6">
            <div>
              <p className="text-emphasis font-semibold">{t("sw_booking_page_look")}</p>
              <p className="text-subtle mt-1 text-sm">{t("sw_booking_page_look_hint")}</p>
            </div>
            <a href="/page-editor?tab=design">
              <Button color="secondary">{t("sw_open_design")}</Button>
            </a>
          </section>

          <Form
            form={bookerLayoutFormMethods}
            handleSubmit={(values) => {
              const layoutError = validateBookerLayouts(values?.metadata?.defaultBookerLayouts || null);
              if (layoutError) {
                showToast(t(layoutError), "error");
                return;
              }
              mutation.mutate(values);
            }}>
            <BookerLayoutSelector
              isDark={selectedThemeIsDark}
              name="metadata.defaultBookerLayouts"
              title={t("bookerlayout_user_settings_title")}
              description={t("bookerlayout_user_settings_description")}
              isDisabled={isBookerLayoutFormSubmitting || !isBookerLayoutFormDirty}
              isLoading={mutation.isPending}
              user={user}
            />
          </Form>

          <SettingsToggle
            toggleSwitchAtTheEnd={true}
            title={t("disable_cal_branding", { appName: APP_NAME })}
            disabled={!hasPaidPlan || mutation?.isPending}
            description={t("removes_cal_branding", { appName: APP_NAME })}
            checked={hasPaidPlan ? hideBrandingValue : false}
            Badge={undefined}
            onCheckedChange={(checked) => {
              setHideBrandingValue(checked);
              mutation.mutate({ hideBranding: checked });
            }}
            switchContainerClassName="mt-4"
          />
        </>
      )}
    </SettingsHeader>
  );
};

export default AppearanceView;
