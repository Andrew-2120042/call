"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Fades sections in as they scroll into view. Elements opt in with data-reveal. */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    for (const el of document.querySelectorAll("[data-reveal]:not(.is-visible)")) observer.observe(el);
    return () => observer.disconnect();
  }, [pathname]);
  return null;
}
