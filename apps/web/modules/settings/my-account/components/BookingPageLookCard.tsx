"use client";

import {
  BUTTON_RADII,
  BUTTON_SHAPES,
  PAGE_THEME_IDS,
  PAGE_THEMES,
  pageThemeStyle,
} from "@calcom/features/booking-page-theme/themes";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { showToast } from "@calcom/ui/components/toast";
import classNames from "classnames";

/** Free customization: page colour and button shape of the public booking pages, with a live preview. */
export function BookingPageLookCard() {
  const { t } = useLocale();
  const utils = trpc.useUtils();
  const query = trpc.viewer.pageLook.get.useQuery();
  const mutation = trpc.viewer.pageLook.update.useMutation({
    onMutate: async (input) => {
      await utils.viewer.pageLook.get.cancel();
      const previous = utils.viewer.pageLook.get.getData();
      if (previous) utils.viewer.pageLook.get.setData(undefined, { ...previous, ...input });
      return { previous };
    },
    onError: (error, _input, context) => {
      if (context?.previous) utils.viewer.pageLook.get.setData(undefined, context.previous);
      showToast(error.message, "error");
    },
    onSuccess: () => showToast(t("page_look_saved"), "success"),
  });

  if (!query.data) return null;
  const { pageTheme, pageButtonShape } = query.data;

  return (
    <section className="border-subtle mt-6 rounded-lg border p-6" data-testid="booking-page-look">
      <h3 className="text-emphasis text-base font-semibold">{t("page_look_title")}</h3>
      <p className="text-subtle mt-1 text-sm">{t("page_look_description")}</p>

      <div className="mt-5 flex flex-col gap-6 md:flex-row">
        <div className="flex-1">
          <p className="text-emphasis text-sm font-medium">{t("page_look_colour")}</p>
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={t("page_look_colour")}>
            {PAGE_THEME_IDS.map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={pageTheme === id}
                aria-label={PAGE_THEMES[id].label}
                title={PAGE_THEMES[id].label}
                onClick={() => mutation.mutate({ pageTheme: id })}
                className="text-emphasis h-9 w-9 rounded-full"
                style={{
                  background: PAGE_THEMES[id].bg,
                  // currentColor follows the dashboard's light/dark text colour, so the ring is always visible.
                  boxShadow:
                    pageTheme === id
                      ? "0 0 0 2px var(--cal-bg, #fff), 0 0 0 4px currentColor"
                      : "inset 0 0 0 1px rgba(0,0,0,.12)",
                }}
              />
            ))}
          </div>

          <p className="text-emphasis mt-5 text-sm font-medium">{t("page_look_buttons")}</p>
          <div className="mt-2 flex gap-2" role="group" aria-label={t("page_look_buttons")}>
            {BUTTON_SHAPES.map((shape) => (
              <button
                key={shape}
                type="button"
                aria-pressed={pageButtonShape === shape}
                onClick={() => mutation.mutate({ pageButtonShape: shape })}
                className={classNames(
                  "px-4 py-2 text-sm",
                  pageButtonShape === shape
                    ? "text-emphasis font-semibold"
                    : "border-default text-default border"
                )}
                style={{
                  borderRadius: BUTTON_RADII[shape],
                  // currentColor follows the dashboard's light/dark text colour, so the selection is always visible.
                  boxShadow: pageButtonShape === shape ? "inset 0 0 0 2px currentColor" : undefined,
                }}>
                {t(`page_look_shape_${shape}`)}
              </button>
            ))}
          </div>
        </div>

        <div
          className="w-full max-w-[240px] rounded-3xl p-4 text-center"
          style={{
            ...pageThemeStyle(pageTheme, pageButtonShape),
            background: "var(--sw-bg)",
            color: "var(--sw-fg)",
          }}
          aria-hidden>
          <div className="mx-auto h-10 w-10 rounded-full bg-white/80" />
          <p className="mt-2 text-sm font-black">{query.data.username ?? t("page_look_preview_name")}</p>
          <div className="mt-3 grid gap-2">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="bg-white px-3 py-2 text-left text-xs font-semibold text-[#121212]"
                style={{ borderRadius: "var(--sw-radius)" }}>
                {t("page_look_preview_service")}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
