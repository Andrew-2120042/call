import type { PaletteName } from "@/stickers/fun";
import type { StickerName } from "@/stickers/calbee-stickers";
import { Sticker } from "./sticker";

export type BlogArtSpec = { stickers: [StickerName, StickerName, StickerName]; labels?: [string, string, string]; palette?: PaletteName };

const PAPER: Record<PaletteName, string> = {
  riso: "#fbf3ea",
  candy: "#f4f0ff",
  matcha: "#f1f7ea",
  sunset: "#fff1e8",
  clay: "#fbefe7",
  aqua: "#eaf8f9",
};

/**
 * Three stickers on a dotted paper panel, the middle one larger, with optional label chips: the blog's hero and
 * card art. Light paper on purpose: the stickers' black outlines need a light ground to read.
 */
export function BlogArt({ art, compact = false }: { art: BlogArtSpec; compact?: boolean }) {
  const palette = art.palette ?? "riso";
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-line [container-type:size] ${compact ? "aspect-[16/9]" : "aspect-[16/8]"}`}
      style={{
        backgroundColor: PAPER[palette],
        backgroundImage: "radial-gradient(#e6dccb 1.5px, transparent 1.6px)",
        backgroundSize: compact ? "16px 16px" : "22px 22px",
      }}>
      {/* Each sticker is sized by the panel's height as well as its width, so none can outgrow the panel and get clipped. */}
      <div className="absolute inset-0 flex items-center justify-center gap-[3%] px-[5%]">
        {art.stickers.map((name, i) => (
          <div
            key={`${name}-${i}`}
            className="flex flex-col items-center"
            style={{ width: i === 1 ? "min(31%, 78cqh)" : "min(25%, 64cqh)" }}>
            <Sticker name={name} palette={palette} offset={i * 40} />
            {!compact && art.labels?.[i] && (
              <span className="mt-1 whitespace-nowrap rounded-full border-2 border-black bg-white px-3 py-1 font-mono text-[12px] font-semibold text-black shadow-[2px_3px_0_#000]">
                {art.labels[i]}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
