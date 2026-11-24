import type { Release } from "@/content/releases";
import { Sticker } from "./sticker";

const TILE_PAPER = ["#fbf3ea", "#f1f7ea", "#f4f0ff", "#eaf8f9"];

/** The release's headline features as a grid of sticker tiles, like Cal.com's release collage. */
export function ReleaseCollage({ release, compact = false }: { release: Release; compact?: boolean }) {
  const tiles = release.highlights;
  return (
    <div className={`grid gap-3 ${tiles.length > 2 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2"}`}>
      {tiles.map((tile, i) => (
        <div
          key={tile.label}
          className="flex flex-col items-center justify-end rounded-xl border border-line p-3 pb-4"
          style={{ backgroundColor: TILE_PAPER[i % TILE_PAPER.length], backgroundImage: "radial-gradient(#e6dccb 1.3px, transparent 1.4px)", backgroundSize: "14px 14px" }}>
          <div className={compact ? "w-[70%]" : "w-[78%]"}>
            <Sticker name={tile.sticker} offset={i * 30} />
          </div>
          <span className="mt-1 rounded-full border-2 border-black bg-white px-2.5 py-0.5 font-mono text-[11px] font-semibold text-black sm:text-[12px]">
            {tile.label}
          </span>
        </div>
      ))}
    </div>
  );
}
