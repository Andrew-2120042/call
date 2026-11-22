import { allPagesMd } from "@/lib/markdown";
import { site } from "@/site.config";

export const dynamic = "force-static";

// The whole site in one file, for assistants that read a product's docs before answering about it.
export function GET() {
  const pages = allPagesMd().map(([path, md]) => `<!-- ${site.url}${path === "/" ? "" : path} -->\n\n${md}`);
  return new Response(`${pages.join("\n\n---\n\n")}\n`, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
