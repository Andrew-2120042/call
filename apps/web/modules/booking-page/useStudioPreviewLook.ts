"use client";

import type { PageStyle } from "@calcom/features/booking-page-theme/themes";
import { parsePageStyle } from "@calcom/features/booking-page-theme/themes";
import { useEffect, useState } from "react";

export const STUDIO_PREVIEW_PARAM = "studioPreview";
export const STUDIO_LOOK_MESSAGE = "sw-studio-look";
export const STUDIO_READY_MESSAGE = "sw-studio-ready";
/** On <html> while a page is shown inside the editor preview (styles in booking-theme.css). */
export const STUDIO_PREVIEW_CLASS = "sw-studio-preview";

export type StudioLook = {
  pageTheme: string;
  pageButtonShape: string;
  pageStyle: PageStyle;
};

export type StudioLookMessage = StudioLook & { type: typeof STUDIO_LOOK_MESSAGE };

/**
 * On a public page opened inside the editor's preview, follows the editor's unsaved look so the owner
 * sees changes before saving. Only same-origin messages from the parent window are accepted, and a
 * normal visit (not framed, no preview param) always shows the saved look.
 */
export function useStudioPreviewLook(saved: StudioLook): StudioLook {
  const [preview, setPreview] = useState<StudioLook | null>(null);

  useEffect(() => {
    if (window.parent === window) return;
    if (!new URLSearchParams(window.location.search).has(STUDIO_PREVIEW_PARAM)) return;

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      const data = event.data as Partial<StudioLookMessage> | null;
      if (!data || data.type !== STUDIO_LOOK_MESSAGE) return;
      setPreview({
        pageTheme: typeof data.pageTheme === "string" ? data.pageTheme : saved.pageTheme,
        pageButtonShape:
          typeof data.pageButtonShape === "string" ? data.pageButtonShape : saved.pageButtonShape,
        pageStyle: parsePageStyle(data.pageStyle),
      });
    };
    window.addEventListener("message", onMessage);
    document.documentElement.classList.add(STUDIO_PREVIEW_CLASS);
    window.parent.postMessage({ type: STUDIO_READY_MESSAGE }, window.location.origin);
    return () => {
      window.removeEventListener("message", onMessage);
      document.documentElement.classList.remove(STUDIO_PREVIEW_CLASS);
    };
  }, [saved.pageTheme, saved.pageButtonShape]);

  return preview ?? saved;
}
