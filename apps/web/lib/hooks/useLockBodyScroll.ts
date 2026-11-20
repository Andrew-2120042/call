import { useEffect } from "react";

/** Stops the page behind an overlay (panel, dialog) from scrolling while the overlay is open. */
export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const root = document.documentElement;
    const previous = { root: root.style.overflow, body: document.body.style.overflow };
    root.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous.root;
      document.body.style.overflow = previous.body;
    };
  }, [locked]);
}
