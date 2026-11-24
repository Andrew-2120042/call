import { type NextRequest, NextResponse } from "next/server";
import { allPagesMd } from "@/lib/markdown";

// AI crawlers read Markdown more reliably than HTML (Ramp's test), so they get each page's Markdown copy: the same
// content, just without layout. Search engines and people still get the normal page. Every AI bot visit is logged
// so we can see which assistants read the site.
const AI_BOTS =
  /GPTBot|OAI-SearchBot|ChatGPT-User|ClaudeBot|Claude-User|Claude-SearchBot|anthropic-ai|PerplexityBot|Perplexity-User|Google-Extended|Applebot-Extended|Meta-ExternalAgent|meta-externalfetcher|CCBot|cohere-ai|DuckAssistBot|MistralAI-User|YouBot|Amazonbot|Bytespider|DeepSeek/i;

const MARKDOWN_PATHS = new Set(allPagesMd().map(([path]) => path));

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const agent = request.headers.get("user-agent") ?? "";
  const bot = agent.match(AI_BOTS)?.[0];
  const asksForMarkdown = (request.headers.get("accept") ?? "").includes("text/markdown");

  if (bot) console.log(JSON.stringify({ event: "ai_bot_visit", bot, path: pathname }));

  if ((bot || asksForMarkdown) && MARKDOWN_PATHS.has(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/md" : `/md${pathname}`;
    const response = NextResponse.rewrite(url);
    response.headers.set("Vary", "User-Agent, Accept");
    return response;
  }
  return NextResponse.next();
}

export const config = {
  // Pages only: skip Next's own files, images and the machine files that are already plain text.
  matcher: ["/((?!_next/|md/|api/|.*\\.(?:png|jpg|jpeg|svg|webp|ico|txt|xml|md|json|js|css)$).*)"],
};
