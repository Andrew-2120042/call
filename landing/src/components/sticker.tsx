"use client";

import { useEffect, useRef } from "react";
import { PALETTES, type PaletteName, play } from "@/stickers/fun";
import { STICKERS, type StickerName } from "@/stickers/calbee-stickers";

/** One animated fun-isometric sticker. Off-screen stickers don't paint, and reduced motion shows a still frame. */
export function Sticker({
  name,
  palette = "riso",
  offset = 0,
  className = "",
}: {
  name: StickerName;
  palette?: PaletteName;
  offset?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const player = play(ref.current, STICKERS[name], { palette: PALETTES[palette], offset, enter: 0.1 });
    return () => player.stop();
  }, [name, palette, offset]);
  return <canvas ref={ref} aria-hidden className={`block aspect-square w-full ${className}`} />;
}
