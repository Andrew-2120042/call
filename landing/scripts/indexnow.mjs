// Tells Bing, Yandex, Seznam and Naver (via IndexNow) that every page in the live sitemap changed, so they
// re-crawl now instead of in days. Bing's index feeds ChatGPT search and Copilot. Run after each site deploy:
//   node scripts/indexnow.mjs            (uses https://<brand domain>)
//   node scripts/indexnow.mjs https://example.com
import { readFileSync } from "node:fs";

// The key is public on purpose: it proves we own the site by being served at /<key>.txt.
const KEY = "7e1f5902c0c9c036610440ef0061487c";
const brand = JSON.parse(readFileSync(new URL("../../brand.json", import.meta.url), "utf8"));
const siteUrl = (process.argv[2] ?? `https://${brand.domain}`).replace(/\/$/, "");

const sitemap = await (await fetch(`${siteUrl}/sitemap.xml`)).text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const keyCheck = await fetch(`${siteUrl}/${KEY}.txt`);
if (!keyCheck.ok) throw new Error(`${siteUrl}/${KEY}.txt isn't live yet (HTTP ${keyCheck.status}); deploy the site first.`);

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(siteUrl).host, key: KEY, keyLocation: `${siteUrl}/${KEY}.txt`, urlList: urls }),
});
console.log(`IndexNow: sent ${urls.length} pages, HTTP ${res.status}`);
