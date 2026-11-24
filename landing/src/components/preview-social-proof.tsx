"use client";

import { useEffect, useState } from "react";

// Design preview only: the number isn't real, so it shows only for whoever opens the page with ?preview=1.
export function PreviewSocialProof() {
  const [show, setShow] = useState(false);
  useEffect(() => setShow(new URLSearchParams(location.search).has("preview")), []);
  if (!show) return null;
  return (
    <div className="mt-8 flex items-center justify-center gap-3">
      <div className="flex -space-x-2">
        {["#ff58a8", "#ffe14a", "#15b9a6", "#2b50e0", "#ff7a1a"].map((c) => (
          <span key={c} className="h-8 w-8 rounded-full border-2 border-bg" style={{ background: c }} />
        ))}
      </div>
      <p className="text-fg/80 text-[14px]">
        Used by <span className="text-fg font-semibold">50,000+</span> coaches, therapists and consultants
      </p>
    </div>
  );
}
