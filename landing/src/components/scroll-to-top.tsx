"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Next scrolls to the top of the page segment that changed, which sits below the announcement bar and nav,
 * so arriving on a page left the top of the site just off screen. And a link to the page you're already on
 * (the logo on the home page) does nothing at all. Both now go to the very top, unless the link has a #hash.
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank") return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.hash || url.pathname !== window.location.pathname) return;
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    };
    // Capture phase: Next's Link marks the click as handled before it would bubble up to the document.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
