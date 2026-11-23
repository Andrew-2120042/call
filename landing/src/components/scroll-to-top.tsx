"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Next scrolls to the top of the page segment that changed, which sits below the announcement bar and nav,
 * so arriving on a page (or clicking the logo) left the top of the site just off screen. Always start at the
 * very top instead, except when the link points at a section with a #hash.
 */
export function ScrollToTop() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}
