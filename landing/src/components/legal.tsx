import type { ReactNode } from "react";
import { Container } from "./ui";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <Container className="max-w-3xl pt-20">
      <h1 className="text-4xl font-normal tracking-[-0.02em]">{title}</h1>
      <p className="text-faint mt-3 text-sm">Last updated {updated}</p>
      <div className="text-muted mt-10 space-y-6 text-[15px] leading-relaxed [&_h2]:text-fg [&_h2]:mt-10 [&_h2]:text-lg [&_h2]:font-medium [&_li]:ms-5 [&_li]:list-disc">
        {children}
      </div>
    </Container>
  );
}
