import type { PaletteName } from "@/stickers/fun";
import type { StickerName } from "@/stickers/calbee-stickers";
import { Sticker } from "./sticker";

const PAPER: Record<PaletteName, string> = { riso: "#fbf3ea", candy: "#f4f0ff", matcha: "#f1f7ea", sunset: "#fff1e8", clay: "#fbefe7", aqua: "#eaf8f9" };

/** One illustration on dotted paper with a label chip, placed inside an article next to the text it illustrates. */
export function SectionFigure({ sticker, caption, palette = "riso", offset = 0 }: { sticker: StickerName; caption: string; palette?: PaletteName; offset?: number }) {
  return (
    <figure
      className="mt-7 flex aspect-[16/7] flex-col items-center justify-center rounded-2xl border border-line [container-type:size]"
      style={{ backgroundColor: PAPER[palette], backgroundImage: "radial-gradient(#e6dccb 1.5px, transparent 1.6px)", backgroundSize: "20px 20px" }}>
      <div style={{ width: "min(30%, 74cqh)" }}>
        <Sticker name={sticker} palette={palette} offset={offset} />
      </div>
      <figcaption className="mt-1 max-w-[90%] truncate rounded-full border-2 border-black bg-white px-3 py-1 font-mono text-[12px] font-semibold text-black shadow-[2px_3px_0_#000]">
        {caption}
      </figcaption>
    </figure>
  );
}
