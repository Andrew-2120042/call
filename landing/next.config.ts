import path from "node:path";
import type { NextConfig } from "next";

const config: NextConfig = {
  // This site lives inside the app's repo but is its own project; keep Next from treating the repo root as its workspace.
  outputFileTracingRoot: path.join(__dirname),
  turbopack: { root: path.join(__dirname) },
  poweredByHeader: false,
  // Every page has a Markdown copy at the same address plus .md, for AI assistants (see src/lib/markdown.ts).
  async rewrites() {
    return [
      { source: "/index.md", destination: "/md" },
      { source: "/:path((?!md/).+)\\.md", destination: "/md/:path" },
    ];
  },
};

export default config;
