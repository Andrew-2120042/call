import path from "node:path";
import type { NextConfig } from "next";

const config: NextConfig = {
  // This site lives inside the app's repo but is its own project; keep Next from treating the repo root as its workspace.
  outputFileTracingRoot: path.join(__dirname),
  turbopack: { root: path.join(__dirname) },
  poweredByHeader: false,
};

export default config;
