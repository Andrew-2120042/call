"use client";

import { useState } from "react";

export function CopyTextButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() =>
        navigator.clipboard?.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        })
      }
      className="rounded-md border border-line px-3 py-1.5 text-[13px] transition hover:border-line-strong">
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
