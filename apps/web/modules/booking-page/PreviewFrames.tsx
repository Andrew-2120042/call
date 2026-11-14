"use client";

import type { ReactNode } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { StudioLook } from "./useStudioPreviewLook";
import { STUDIO_LOOK_MESSAGE, STUDIO_PREVIEW_PARAM, STUDIO_READY_MESSAGE } from "./useStudioPreviewLook";

// A common laptop viewport, so the desktop preview shows the real desktop layout, just scaled down.
const DESKTOP_W = 1280;
const DESKTOP_H = 800;
const CHROME_H = 40;
const SIDE_RESERVE = 96;

/** A desktop browser window around a true-size 1280x800 page, scaled to fit the space it's given. */
export function BrowserFrame(props: { url: string; children: ReactNode; maxWidth?: number }) {
  const slotRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const maxWidth = props.maxWidth ?? 760;

  useLayoutEffect(() => {
    const measure = () => {
      const width = slotRef.current?.parentElement?.clientWidth ?? maxWidth;
      const top = slotRef.current?.getBoundingClientRect().top ?? 120;
      // Leaves room for the link/open buttons that sit beside the preview.
      const byWidth = Math.min(width - SIDE_RESERVE, maxWidth) / DESKTOP_W;
      const byHeight = (window.innerHeight - Math.max(top, 0) - 32) / (DESKTOP_H + CHROME_H);
      setScale(Math.max(0.25, Math.min(byWidth, byHeight, 1)));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [maxWidth]);

  return (
    <div
      ref={slotRef}
      className="relative mx-auto"
      style={{ width: DESKTOP_W * scale, height: (DESKTOP_H + CHROME_H) * scale }}
      data-testid="browser-frame">
      <div
        className="absolute left-0 top-0 origin-top-left overflow-hidden bg-white"
        style={{
          width: DESKTOP_W,
          height: DESKTOP_H + CHROME_H,
          transform: `scale(${scale})`,
          borderRadius: 14,
          boxShadow: "0 0 0 1px rgba(0,0,0,.08), 0 40px 80px -40px rgba(0,0,0,.45)",
        }}>
        <div
          className="flex items-center gap-3 px-4"
          style={{ height: CHROME_H, background: "#ecebe8", borderBottom: "1px solid #dddcd8" }}
          aria-hidden>
          <span className="flex gap-1.5">
            {["#ff5f57", "#febc2e", "#28c840"].map((colour) => (
              <span
                key={colour}
                className="block rounded-full"
                style={{ width: 12, height: 12, background: colour }}
              />
            ))}
          </span>
          <span
            className="mx-auto truncate rounded-md bg-white px-4 text-center text-[13px] text-[#6b6a66]"
            style={{ width: 420, lineHeight: "24px" }}>
            {props.url}
          </span>
          <span style={{ width: 48 }} />
        </div>
        <div className="no-scrollbar overflow-y-auto" style={{ width: DESKTOP_W, height: DESKTOP_H }}>
          {props.children}
        </div>
      </div>
    </div>
  );
}

/**
 * The real public page in an iframe, fed the editor's unsaved look, so the preview is exactly what visitors
 * get (including the phone vs desktop calendar layouts, which follow the frame's width).
 */
export function LivePageFrame(props: { path: string; look: StudioLook; title: string }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const lookRef = useRef(props.look);
  lookRef.current = props.look;

  const send = () => {
    frameRef.current?.contentWindow?.postMessage(
      { type: STUDIO_LOOK_MESSAGE, ...lookRef.current },
      window.location.origin
    );
  };

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      if ((event.data as { type?: string } | null)?.type === STUDIO_READY_MESSAGE) send();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(send, [props.look]);

  const separator = props.path.includes("?") ? "&" : "?";
  return (
    <iframe
      ref={frameRef}
      src={`${props.path}${separator}${STUDIO_PREVIEW_PARAM}=1`}
      title={props.title}
      onLoad={send}
      className="block h-full w-full border-0"
      data-testid="live-page-frame"
    />
  );
}
