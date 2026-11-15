"use client";

import type { ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";

// A real phone screen in CSS points (iPhone 14/15 class), so previews show the true mobile layout.
const SCREEN_W = 390;
const SCREEN_H = 844;
const BEZEL = 12;
const BAND = 3;
const DEVICE_W = SCREEN_W + 2 * (BEZEL + BAND);
const DEVICE_H = SCREEN_H + 2 * (BEZEL + BAND);
const BOTTOM_GAP = 24;

type Props = {
  /** Screen background, so the status bar and the home bar sit on the page colour. */
  screenBg: string;
  /** Colour of the status bar icons and home indicator (the page's text colour). */
  inkColor: string;
  children: ReactNode;
  /** Children fill the screen below the status bar without our scroll container (e.g. an iframe). */
  fill?: boolean;
  /** Largest width the phone may take on screen. */
  maxWidth?: number;
  /** "device": metal band, bezel and status bar. "bare": just the rounded screen, like the Linktree editor. */
  variant?: "device" | "bare";
};

/**
 * A modern phone drawn in CSS around a true-size mobile screen, scaled down as a whole so the full
 * device always fits in the window without scrolling.
 */
export function PhoneFrame({
  screenBg,
  inkColor,
  children,
  fill,
  maxWidth = 340,
  variant = "device",
}: Props) {
  const slotRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.7);

  const bare = variant === "bare";
  const outerW = bare ? SCREEN_W : DEVICE_W;
  const outerH = bare ? SCREEN_H : DEVICE_H;

  useLayoutEffect(() => {
    const measure = () => {
      const top = slotRef.current?.getBoundingClientRect().top ?? 120;
      const available = window.innerHeight - Math.max(top, 0) - BOTTOM_GAP;
      setScale(Math.max(0.45, Math.min(available / outerH, maxWidth / outerW, 1)));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [maxWidth, outerH, outerW]);

  if (bare) {
    return (
      <div
        ref={slotRef}
        className="relative mx-auto select-none"
        style={{ width: SCREEN_W * scale, height: SCREEN_H * scale }}
        data-testid="phone-frame">
        <div
          className="absolute left-0 top-0 origin-top-left overflow-hidden rounded-[44px] shadow-[0_0_0_1px_rgba(0,0,0,.06),0_24px_60px_-30px_rgba(0,0,0,.35)]"
          style={{ width: SCREEN_W, height: SCREEN_H, transform: `scale(${scale})`, background: screenBg }}>
          {fill ? (
            <div className="absolute inset-0">{children}</div>
          ) : (
            <div className="no-scrollbar absolute inset-0 overflow-y-auto">{children}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={slotRef}
      className="relative mx-auto select-none"
      style={{ width: DEVICE_W * scale, height: DEVICE_H * scale }}
      data-testid="phone-frame">
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: DEVICE_W, height: DEVICE_H, transform: `scale(${scale})` }}>
        {/* Side buttons */}
        <span className="absolute -left-[4px] top-[150px] h-[34px] w-[5px] rounded-l-sm bg-[#3a3a3c]" />
        <span className="absolute -left-[4px] top-[214px] h-[66px] w-[5px] rounded-l-sm bg-[#3a3a3c]" />
        <span className="absolute -left-[4px] top-[292px] h-[66px] w-[5px] rounded-l-sm bg-[#3a3a3c]" />
        <span className="absolute -right-[4px] top-[236px] h-[104px] w-[5px] rounded-r-sm bg-[#3a3a3c]" />

        {/* Metal band */}
        <div
          className="absolute inset-0 rounded-[64px] bg-[linear-gradient(145deg,#5b5b5f_0%,#2c2c2e_35%,#1c1c1e_65%,#4a4a4d_100%)] shadow-[0_50px_100px_-50px_rgba(0,0,0,.55),0_0_0_1px_rgba(0,0,0,.25)]"
          style={{ padding: BAND }}>
          {/* Bezel */}
          <div className="h-full w-full rounded-[61px] bg-black" style={{ padding: BEZEL }}>
            {/* Screen: exactly SCREEN_W x SCREEN_H */}
            <div
              className="relative overflow-hidden rounded-[50px]"
              style={{ width: SCREEN_W, height: SCREEN_H, background: screenBg }}>
              <StatusBar color={inkColor} />
              <div className="absolute left-1/2 top-[12px] z-20 h-[35px] w-[124px] -translate-x-1/2 rounded-full bg-black">
                <span className="absolute right-[14px] top-1/2 h-[11px] w-[11px] -translate-y-1/2 rounded-full bg-[#141428] shadow-[inset_0_0_0_2px_#0b0b0b]" />
              </div>
              {fill ? (
                <div className="absolute inset-x-0 bottom-0 top-[54px]">{children}</div>
              ) : (
                <div className="no-scrollbar absolute inset-0 overflow-y-auto pb-10 pt-[54px]">
                  {children}
                </div>
              )}
              <span
                className="absolute bottom-[8px] left-1/2 z-20 h-[5px] w-[134px] -translate-x-1/2 rounded-full opacity-90"
                style={{ background: inkColor }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBar({ color }: { color: string }) {
  return (
    <div
      className="absolute inset-x-0 top-0 z-10 flex h-[54px] items-center justify-between pl-[42px] pr-[30px] pt-[4px]"
      style={{ color }}
      aria-hidden>
      <span className="text-[15.5px] font-semibold tracking-[-0.01em]">9:41</span>
      <span className="flex items-center gap-[6px]">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <path d="M8 2.6c2.3 0 4.4.9 6 2.4l1.3-1.4A10.6 10.6 0 0 0 8 .7 10.6 10.6 0 0 0 .7 3.6L2 5c1.6-1.5 3.7-2.4 6-2.4Z" />
          <path d="M8 6.3c1.3 0 2.5.5 3.4 1.3l1.3-1.4A6.8 6.8 0 0 0 8 4.4 6.8 6.8 0 0 0 3.3 6.2l1.3 1.4C5.5 6.8 6.7 6.3 8 6.3Z" />
          <path d="M8 9.9 10 7.8A2.9 2.9 0 0 0 8 7a2.9 2.9 0 0 0-2 .8L8 9.9Z" />
        </svg>
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke="currentColor" opacity="0.4" />
          <rect x="2" y="2" width="20" height="9" rx="2.2" fill="currentColor" />
          <path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" fill="currentColor" opacity="0.45" />
        </svg>
      </span>
    </div>
  );
}
