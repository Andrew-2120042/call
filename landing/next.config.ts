import path from "node:path";
import type { NextConfig } from "next";

const config: NextConfig = {
  // This site lives inside the app's repo but is its own project; keep Next from treating the repo root as its workspace.
  outputFileTracingRoot: path.join(__dirname),
  turbopack: { root: path.join(__dirname) },
  poweredByHeader: false,
  // Every page has a Markdown copy at the same address plus .md, for AI assistants (see src/lib/markdown.ts).
  async redirects() {
    return [
      { source: "/changelog/v2-0", destination: "/changelog/june-2026-first-release", permanent: true },
      { source: "/changelog/v2-1", destination: "/changelog/august-2026-teams", permanent: true },
      { source: "/changelog/v2-2", destination: "/changelog/august-2026-rebooking", permanent: true },
      { source: "/changelog/v2-3", destination: "/changelog/v3-0", permanent: true },
      { source: "/changelog/v1-:n", destination: "/changelog", permanent: true },
    ];
  },
  async rewrites() {
    return [
      { source: "/index.md", destination: "/md" },
      { source: "/:path((?!md/).+)\\.md", destination: "/md/:path" },
    ];
  },
};

export default config;
