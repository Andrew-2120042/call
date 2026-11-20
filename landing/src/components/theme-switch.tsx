"use client";

import { useEffect, useState } from "react";

const KEY = "nodslot-theme-preview-v2";

/** Dev-only switch to compare the light palette against the dark one the site ships with. */
export function ThemeSwitch() {
  // null until mounted, so the first render never overwrites the theme the head script already applied.
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);

  useEffect(() => {
    if (dark === null) return;
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    try {
      localStorage.setItem(KEY, dark ? "dark" : "light");
    } catch {}
  }, [dark]);

  return (
    <button
      type="button"
      onClick={() => setDark((d) => !d)}
      className="fixed right-4 bottom-4 z-[60] flex items-center gap-2 rounded-full border border-line-strong bg-card px-3.5 py-2 text-[12px] text-fg shadow-lg shadow-black/10 transition hover:bg-surface">
      <span className={`h-2.5 w-2.5 rounded-full ${dark ? "bg-fg" : "border border-fg"}`} />
      {dark ? "Dark" : "Light"} · test
    </button>
  );
}

export const themePreviewScript = `try{if(localStorage.getItem("${KEY}")==="light")document.documentElement.dataset.theme="light"}catch(e){}`;
