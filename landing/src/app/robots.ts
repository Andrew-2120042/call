import type { MetadataRoute } from "next";
import { site } from "@/site.config";

export default function robots(): MetadataRoute.Robots {
  // AI search and answer engines are named explicitly so they can cite the site (GEO/AEO).
  const aiCrawlers = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "Claude-SearchBot",
    "Claude-User",
    "PerplexityBot",
    "Perplexity-User",
    "Google-Extended",
    "Googlebot",
    "Applebot",
    "Applebot-Extended",
    "Bingbot",
    "DuckAssistBot",
    "MistralAI-User",
    "Meta-ExternalAgent",
    "Amazonbot",
    "cohere-ai",
    "YouBot",
  ];
  return {
    rules: [{ userAgent: "*", allow: "/" }, ...aiCrawlers.map((userAgent) => ({ userAgent, allow: "/" }))],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
