import type { ReactNode } from "react";

type Props = {
  /** Screen background, so the status bar and the home bar sit on the page colour. */
  screenBg: string;
  /** Colour of the status bar icons and home indicator (the page's text colour). */
  inkColor: string;
  children: ReactNode;
  /** Children fill the screen below the status bar without our scroll container (e.g. an iframe). */
  fill?: boolean;
};

/**
 * A modern phone (metal band, side buttons, pill camera cutout, status bar, home indicator) drawn in
 * CSS so the editor preview reads as a real device at any resolution.
 */
export function PhoneFrame({ screenBg, inkColor, children, fill }: Props) {
  return (
    <div className="relative mx-auto h-[652px] w-[320px] select-none" data-testid="phone-frame">
      {/* Side buttons sit behind the band so only their edges show. */}
      <span className="absolute -left-[3px] top-[118px] h-[30px] w-[4px] rounded-l-sm bg-[#3a3a3c]" />
      <span className="absolute -left-[3px] top-[168px] h-[56px] w-[4px] rounded-l-sm bg-[#3a3a3c]" />
      <span className="absolute -left-[3px] top-[234px] h-[56px] w-[4px] rounded-l-sm bg-[#3a3a3c]" />
      <span className="absolute -right-[3px] top-[190px] h-[86px] w-[4px] rounded-r-sm bg-[#3a3a3c]" />

      {/* Metal band */}
      <div className="absolute inset-0 rounded-[56px] bg-[linear-gradient(145deg,#5b5b5f_0%,#2c2c2e_35%,#1c1c1e_65%,#4a4a4d_100%)] p-[3px] shadow-[0_40px_80px_-40px_rgba(0,0,0,.55),0_0_0_1px_rgba(0,0,0,.25)]">
        {/* Glass and bezel */}
        <div className="h-full w-full rounded-[53px] bg-black p-[10px]">
          {/* Screen */}
          <div
            className="relative h-full w-full overflow-hidden rounded-[44px]"
            style={{ background: screenBg }}>
            <StatusBar color={inkColor} />
            {/* Camera cutout */}
            <div className="absolute left-1/2 top-[11px] z-20 h-[28px] w-[86px] -translate-x-1/2 rounded-full bg-black">
              <span className="absolute right-[10px] top-1/2 h-[9px] w-[9px] -translate-y-1/2 rounded-full bg-[#141428] shadow-[inset_0_0_0_2px_#0b0b0b]" />
            </div>
            {fill ? (
              <div className="absolute inset-x-0 bottom-0 top-[50px]">{children}</div>
            ) : (
              <div className="no-scrollbar absolute inset-0 overflow-y-auto pb-8 pt-[50px]">{children}</div>
            )}
            {/* Home indicator */}
            <span
              className="absolute bottom-[8px] left-1/2 z-20 h-[5px] w-[118px] -translate-x-1/2 rounded-full opacity-90"
              style={{ background: inkColor }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBar({ color }: { color: string }) {
  return (
    <div
      className="absolute inset-x-0 top-0 z-10 flex h-[50px] items-center justify-between pl-[34px] pr-[26px] pt-[2px]"
      style={{ color }}
      aria-hidden>
      <span className="text-[15px] font-semibold tracking-[-0.01em]">9:41</span>
      <span className="flex items-center gap-[4px]">
        <svg width="16" height="11" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg width="15" height="11" viewBox="0 0 16 12" fill="currentColor">
          <path d="M8 2.6c2.3 0 4.4.9 6 2.4l1.3-1.4A10.6 10.6 0 0 0 8 .7 10.6 10.6 0 0 0 .7 3.6L2 5c1.6-1.5 3.7-2.4 6-2.4Z" />
          <path d="M8 6.3c1.3 0 2.5.5 3.4 1.3l1.3-1.4A6.8 6.8 0 0 0 8 4.4 6.8 6.8 0 0 0 3.3 6.2l1.3 1.4C5.5 6.8 6.7 6.3 8 6.3Z" />
          <path d="M8 9.9 10 7.8A2.9 2.9 0 0 0 8 7a2.9 2.9 0 0 0-2 .8L8 9.9Z" />
        </svg>
        <svg width="24" height="12" viewBox="0 0 27 13" fill="none">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke="currentColor" opacity="0.4" />
          <rect x="2" y="2" width="20" height="9" rx="2.2" fill="currentColor" />
          <path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" fill="currentColor" opacity="0.45" />
        </svg>
      </span>
    </div>
  );
}
