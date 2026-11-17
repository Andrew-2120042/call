# Nodslot landing site

The marketing site (nodslot.site), kept separate from the app in `apps/web`:
its own `package.json`, its own `node_modules`, its own deploy. Editing anything here never touches or rebuilds the app.

## Run it
```
cd landing
npm install
npm run dev      # http://localhost:3100
npm run build    # static pages; fails on type errors
```

## Where to edit
| What | File |
|---|---|
| Domain, app URL, support email | `src/site.config.ts` (or set `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPPORT_EMAIL`) |
| All copy: features, comparisons, "for" pages, pricing, FAQ | `src/content/site-content.ts` |
| Home page layout | `src/app/page.tsx` |
| Product screenshots | `public/shots/*.png` (2x, taken from the running app) |
| Privacy / terms | `src/app/privacy/page.tsx`, `src/app/terms/page.tsx` (drafts: have them reviewed) |

Adding an entry to `features`, `comparisons` or `audiences` in `site-content.ts` creates a new page
(`/features/<slug>`, `/compare/<slug>`, `/for/<slug>`) and adds it to `sitemap.xml` automatically.
Each new page needs genuinely different content; near-duplicate pages are treated as spam by Google.

## SEO built in
- Unique title, description and canonical URL per page; one `<h1>` per page.
- `sitemap.xml` and `robots.txt` generated from the content file.
- Open Graph image (`/opengraph-image`) for link previews.
- Structured data: Organization, WebSite, SoftwareApplication (with prices) and FAQPage.
- Every page is pre-rendered to static HTML.

## Deploy (Vercel)
1. New Vercel project from this repo, **Root Directory: `landing`**, framework Next.js.
2. Set `NEXT_PUBLIC_SITE_URL=https://<domain>` and `NEXT_PUBLIC_APP_URL=https://app.<domain>`.
3. Point the root domain (and `www`) at this project; point `app.<domain>` at the app project.
4. Submit `https://<domain>/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
