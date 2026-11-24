import { allPagesMd, markdownResponse, pageMd } from "@/lib/markdown";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return allPagesMd().map(([path]) => ({ path: path === "/" ? [] : path.slice(1).split("/") }));
}

// Reached through the `<page>.md` rewrite in next.config.ts.
export async function GET(_request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params;
  const pagePath = path?.length ? `/${path.join("/")}` : "/";
  const body = pageMd(pagePath);
  return body ? markdownResponse(body, pagePath) : new Response("Not found", { status: 404 });
}
