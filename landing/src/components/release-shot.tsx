import Image from "next/image";
import type { ReleaseImage } from "@/content/releases";

/** A real app screenshot in a rounded frame, the way release notes show the product. */
export function ReleaseShot({ image, priority = false }: { image: ReleaseImage; priority?: boolean }) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_24px_60px_-30px_rgba(0,0,0,0.8)]">
      <Image src={image.src} alt={image.alt} width={image.width} height={image.height} priority={priority} sizes="(min-width: 1024px) 820px, 100vw" className="block h-auto w-full" />
    </figure>
  );
}
