"use client";

import { useState } from "react";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(url).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="rounded-full border border-line px-3 py-1 hover:border-line-strong">
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}
