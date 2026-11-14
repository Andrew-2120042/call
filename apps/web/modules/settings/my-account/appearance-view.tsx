"use client";

import SettingsHeader from "@calcom/features/settings/appDir/SettingsHeader";
import SectionBottomActions from "@calcom/features/settings/SectionBottomActions";
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

type ThemeChoice = "system" | "light" | "dark";

const THEME_SWATCH: Record<ThemeChoice, string> = {
  system: "linear-gradient(90deg,#f4f4f5 50%,#0b0b0c 50%)",
  light: "#f4f4f5",
  dark: "#0b0b0c",
};

function ThemeTiles(props: {
  value: ThemeChoice;
  label: string;
  testIdPrefix: string;
  labels: Record<ThemeChoice, string>;
  options?: readonly ThemeChoice[];
  onPick: (value: ThemeChoice) => void;
}) {
  const options = props.options ?? (["system", "light", "dark"] as const);
  return (
    <div className="mt-5 grid max-w-[520px] grid-cols-3 gap-3" role="radiogroup" aria-label={props.label}>
      {options.map((id) => {
        const active = props.value === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            data-testid={`${props.testIdPrefix}-${id}`}
            onClick={() => props.onPick(id)}
            className={
              active
                ? "border-emphasis rounded-2xl border-2 p-2 text-left"
                : "border-subtle hover:border-emphasis rounded-2xl border-2 p-2 text-left transition"
            }>
            <span
              className="border-subtle block h-20 rounded-xl border"
              style={{ background: THEME_SWATCH[id] }}
              aria-hidden
            />
            <span className="text-emphasis mt-2 block px-1 text-sm font-medium">{props.labels[id]}</span>
          </button>
        );
      })}
    </div>
  );
}

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
  useTheme(user?.appTheme ?? "dark");
  useBrandColors(user?.appTheme ?? "dark", {
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

  // Booking pages are dark until the owner chooses; "system" is stored explicitly.
  const currentBookingTheme = (userThemeFormMethods.watch("theme") || "dark") as ThemeChoice;
  const pickBookingTheme = (value: ThemeChoice) => {
    userThemeFormMethods.setValue("theme", value);
    mutation.mutate({ theme: value });
  };

  // The dashboard is dark unless the owner picks light; an unset value means dark.
  const currentAppTheme: ThemeChoice =
    userAppThemeFormMethods.watch("appTheme") === "light" ? "light" : "dark";
  const pickAppTheme = (value: ThemeChoice) => {
    userAppThemeFormMethods.setValue("appTheme", value);
    mutation.mutate({ appTheme: value });
  };

  return (
    <SettingsHeader title={t("appearance")} description={t("appearance_description")}>
      <section className="bg-default border-subtle rounded-[22px] border p-6" data-testid="app-theme-picker">
        <p className="text-emphasis font-semibold">{t("app_theme")}</p>
        <p className="text-subtle mt-1 text-sm">{t("sw_app_theme_hint")}</p>
        <ThemeTiles
          value={currentAppTheme}
          label={t("app_theme")}
          testIdPrefix="app-theme"
          options={["dark", "light"]}
          onPick={pickAppTheme}
          labels={{ system: t("theme_system"), light: t("light"), dark: t("dark") }}
        />
      </section>

      {isApartOfOrganization ? null : (
        <>
          <section
            className="bg-default border-subtle mt-4 rounded-[22px] border p-6"
            data-testid="booking-theme-picker">
            <p className="text-emphasis font-semibold">{t("theme")}</p>
            <p className="text-subtle mt-1 text-sm">{t("theme_applies_note")}</p>
            <ThemeTiles
              value={currentBookingTheme}
              label={t("theme")}
              testIdPrefix="booking-theme"
              options={["dark", "light", "system"]}
              onPick={pickBookingTheme}
              labels={{ system: t("theme_system"), light: t("light"), dark: t("dark") }}
            />
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

          <Form form={brandColorsFormMethods} handleSubmit={(values) => mutation.mutate(values)}>
            <SettingsToggle
              toggleSwitchAtTheEnd={true}
              title={t("custom_brand_colors")}
              description={t("customize_your_brand_colors")}
              checked={isCustomBrandColorChecked}
              onCheckedChange={(checked) => {
                setIsCustomBranColorChecked(checked);
                if (!checked) {
                  mutation.mutate({
                    brandColor: DEFAULT_LIGHT_BRAND_COLOR,
                    darkBrandColor: DEFAULT_DARK_BRAND_COLOR,
                  });
                }
              }}
              switchContainerClassName="mt-4"
              childrenClassName="lg:ml-0">
              <div className="border-subtle flex flex-col gap-6 border-x p-6 sm:flex-row">
                <Controller
                  name="brandColor"
                  control={brandColorsFormMethods.control}
                  defaultValue={DEFAULT_BRAND_COLOURS.light}
                  render={() => (
                    <div className="flex-1">
                      <p className="text-default mb-2 block text-sm font-medium">{t("light_brand_color")}</p>
                      <ColorPicker
                        defaultValue={DEFAULT_BRAND_COLOURS.light}
                        resetDefaultValue={DEFAULT_LIGHT_BRAND_COLOR}
                        onChange={(value) => {
                          setLightModeError(!checkWCAGContrastColor("#ffffff", value));
                          brandColorsFormMethods.setValue("brandColor", value, { shouldDirty: true });
                        }}
                      />
                      {lightModeError && (
                        <div className="mt-4">
                          <Alert severity="warning" message={t("light_theme_contrast_error")} />
                        </div>
                      )}
                    </div>
                  )}
                />
                <Controller
                  name="darkBrandColor"
                  control={brandColorsFormMethods.control}
                  defaultValue={DEFAULT_BRAND_COLOURS.dark}
                  render={() => (
                    <div className="flex-1">
                      <p className="text-default mb-2 block text-sm font-medium">{t("dark_brand_color")}</p>
                      <ColorPicker
                        defaultValue={DEFAULT_BRAND_COLOURS.dark}
                        resetDefaultValue={DEFAULT_DARK_BRAND_COLOR}
                        onChange={(value) => {
                          setDarkModeError(!checkWCAGContrastColor("#101010", value));
                          brandColorsFormMethods.setValue("darkBrandColor", value, { shouldDirty: true });
                        }}
                      />
                      {darkModeError && (
                        <div className="mt-4">
                          <Alert severity="warning" message={t("dark_theme_contrast_error")} />
                        </div>
                      )}
                    </div>
                  )}
                />
              </div>
              <SectionBottomActions align="end">
                <Button
                  loading={mutation.isPending}
                  disabled={isBrandColorsFormSubmitting || !isBrandColorsFormDirty}
                  color="primary"
                  type="submit">
                  {t("update")}
                </Button>
              </SectionBottomActions>
            </SettingsToggle>
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
