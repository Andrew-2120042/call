import type { ReactNode } from "react";

/** A desktop-app style window used to frame product screenshots and mock UI. */
export function Window({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-line-strong bg-white shadow-2xl shadow-black/10 ${className}`}>
      <div className="flex h-8 items-center gap-1.5 border-b border-line px-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
        {title && <span className="text-faint ms-3 truncate text-[11px]">{title}</span>}
      </div>
      {children}
    </div>
  );
}

/** Small floating card used to annotate a product shot (an email, a notification, a status). */
export function FloatCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-line-strong bg-white/95 p-3.5 text-xs shadow-xl shadow-black/10 backdrop-blur ${className}`}>
      {children}
    </div>
  );
}
