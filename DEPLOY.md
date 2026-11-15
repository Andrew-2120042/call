# Deploying Slotwise to production

Slotwise is a Next.js monorepo (the Cal.diy engine plus Slotwise features) backed by Postgres.

## 0. Two sites, one repo
- **Landing site** (`landing/`): the marketing site on the root domain. Separate Vercel project with Root Directory `landing`. See `landing/README.md`.
- **App** (`apps/web`): on `app.<domain>`. Set `NEXT_PUBLIC_WEBAPP_URL` and `NEXTAUTH_URL` to `https://app.<domain>`, and `NEXT_PUBLIC_WEBSITE_URL` to `https://<domain>`.
- The app's `robots.txt` only lets search engines index public booking pages; account pages and email-link pages are `noindex`.

## Launch checklist (things only the owner can set up)
- Real domain: replace `slotwise.example` (landing `src/site.config.ts` or its env vars) and the app URLs above.
- Google and Microsoft OAuth apps for calendar sync (`GOOGLE_API_CREDENTIALS`, `MS_GRAPH_CLIENT_ID` / `MS_GRAPH_CLIENT_SECRET`), plus `ZOOM_CLIENT_ID` / `ZOOM_CLIENT_SECRET` and `DAILY_API_KEY` for video. After setting them, run `corepack yarn workspace @calcom/prisma seed-app-store` once (safe to re-run; it upserts). That stores the keys and turns the apps on, so Google Calendar, Outlook, Google Meet, Zoom and built-in video appear in onboarding and settings. Without it onboarding only offers Apple and CalDAV.
- CRM and Teams developer apps (all free to register):
  - Microsoft Teams video: uses the same `MS_GRAPH_CLIENT_ID` / `MS_GRAPH_CLIENT_SECRET` as Outlook.
  - HubSpot: `HUBSPOT_CLIENT_ID` / `HUBSPOT_CLIENT_SECRET` (developers.hubspot.com → create app).
  - Salesforce: `SALESFORCE_CONSUMER_KEY` / `SALESFORCE_CONSUMER_SECRET` (a Connected App in any Salesforce org).
  - Pipedrive: client id and secret from developers.pipedrive.com, entered in Settings → Admin → Apps.
  - Then run `seed-app-store` again. Google Analytics, Tag Manager, Meta Pixel and Make need no keys.
- Zapier and Make: the restored apps point people at Cal.com's Zapier/Make listings, which talk to Cal's
  servers. Slotwise needs its own Zapier and Make apps (free on their developer platforms) before these work
  end to end. Webhooks work today.
- Email sending domain (SPF, DKIM, DMARC) and `EMAIL_SERVER_*`.
- Polar products and webhook (section 5), `DAILY_API_KEY` for built-in video, `ANTHROPIC_API_KEY` for AI summaries.
- Cron jobs (section 4) running against production.
- Legal review of `landing/src/app/privacy` and `landing/src/app/terms`.

## 1. Infrastructure
- **App:** Vercel (or any Node 20+ host). Build `apps/web`.
- **Database:** managed Postgres (for example Neon in us-east-1). Turn on point-in-time recovery and daily backups.
- **Email:** an SMTP provider (Postmark, Resend SMTP, SES). Set `EMAIL_SERVER_*` and `EMAIL_FROM` on a domain with SPF, DKIM and DMARC configured.
- **Rate limiting:** the public endpoints call `checkRateLimitAndThrowError` (Cal's Unkey integration). Set `UNKEY_ROOT_KEY`, or rate limits are not enforced.
- **Video:** the default location is `<APP_NAME> Video` (Daily.co), which needs `DAILY_API_KEY`. Otherwise owners connect Google Meet or Zoom.

## 2. Required environment variables
| Variable | Purpose |
|---|---|
| `DATABASE_URL`, `DATABASE_DIRECT_URL` | Postgres (pooled / direct) |
| `NEXTAUTH_SECRET`, `NEXTAUTH_URL` | Auth (`openssl rand -base64 32`) |
| `CALENDSO_ENCRYPTION_KEY` | Encrypts stored credentials (`openssl rand -base64 24`) |
| `NEXT_PUBLIC_WEBAPP_URL`, `NEXT_PUBLIC_WEBSITE_URL` | Public URL of the app |
| `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_COMPANY_NAME`, `NEXT_PUBLIC_SUPPORT_MAIL_ADDRESS` | Brand |
| `CRON_API_KEY` | Shared secret for every cron endpoint below |
| `EMAIL_FROM`, `EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT`, `EMAIL_SERVER_USER`, `EMAIL_SERVER_PASSWORD` | Outgoing email |
| `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`, `POLAR_ENVIRONMENT=production`, `POLAR_PRO_PRODUCT_ID`, `POLAR_TEAM_PRODUCT_ID` | Billing |
| `ANTHROPIC_API_KEY` (optional), `REQUEST_INSIGHTS_MODEL` (optional) | AI request summaries |
| `WAITLIST_OFFER_WINDOW_MINUTES` (optional, default 120) | How long a waitlist offer stays open |
| Google / Microsoft OAuth client ids | Calendar sync (see `.env.appStore.example`) |

Any new variable must also be listed in `turbo.json` → `globalEnv`, or Turbo strips it.

## 3. Database migrations
Run on every deploy, before the new code serves traffic:
```
corepack yarn workspace @calcom/prisma db-deploy
```

## 4. Cron jobs (all `POST`, header `authorization: <CRON_API_KEY>`)
| Endpoint | Schedule | Does |
|---|---|---|
| `/api/cron/waitlist` | every 5 min | Expires unclaimed offers, offers the slot to the next person, drops past slots |
| `/api/cron/attendee-confirmations` | every 5 min | Sends "are you still coming?" emails, handles missed deadlines (alert or release) |
| `/api/cron/attendee-reminders` | every 5 min | Sends reminder emails, exactly once each |
| `/api/cron/request-insights` | every 1 min | AI summaries for new booking requests (no-op without `ANTHROPIC_API_KEY`) |
| `/api/cron/calendar-health` | every 10 min | Checks connected calendars (each at most hourly), emails the owner once per outage, powers the reconnect banner |
| `/api/cron/bookingReminder` | hourly | Upstream: reminds hosts about requests still waiting for approval |

On Vercel, use Vercel Cron with a small proxy or an external scheduler (for example GitHub Actions or cron-job.org) that sends the header. Every job is idempotent, so overlapping runs are safe.

## 5. Polar billing setup
1. Create products **Pro ($12/month)** and **Team ($49/month)** and copy their ids into `POLAR_PRO_PRODUCT_ID` and `POLAR_TEAM_PRODUCT_ID`.
2. Create an organization access token with `checkouts:write` and `customer_sessions:write` and set it as `POLAR_ACCESS_TOKEN`.
3. Add a webhook to `https://<app>/api/billing/polar/webhook` with the `subscription.*` events, then copy its secret into `POLAR_WEBHOOK_SECRET`.
4. Test in sandbox first (`POLAR_ENVIRONMENT=sandbox`) with a test card, and confirm `/settings/billing` shows Pro.

## 5b. Custom domains (Pro)
- Owners connect a domain in **Settings → Custom domain**. They add:
  - a TXT record `_slotwise-verify.<domain>` with their token (proves ownership)
  - a CNAME to `CUSTOM_DOMAIN_CNAME_TARGET` (on Vercel: `cname.vercel-dns.com`)
- **On Vercel:** set `VERCEL_DOMAINS_API_TOKEN` and `VERCEL_DOMAINS_PROJECT_ID` (plus `VERCEL_DOMAINS_TEAM_ID` for a team). The domain is then added to the project automatically and Vercel issues its TLS certificate. Without them, add domains to the project by hand.
- **Elsewhere:** put a reverse proxy in front that issues certificates on demand (for example Caddy with `on_demand_tls`) and forwards the `Host` header.
- **Routing:** `apps/web/proxy.ts` sends requests on unknown hosts to `/api/custom-domains/resolve` (cached for 60 s).
  - `/` → `/<username>`, and `/<slug>` → `/<username>/<slug>`.
  - Booking, waitlist and confirm pages work as-is on the domain.
  - Owner pages (settings, login and so on) redirect to the app.
  - If the owner's plan lapses, visitors are redirected to the regular app URL.
- If the app is served on other hostnames, list them in `APP_EXTRA_HOSTS`.

## 6. Security notes for the Slotwise endpoints
- **Public endpoints are rate-limited and validated with zod:**
  - `/api/waitlist/join`, `/api/waitlist/options`, `/api/waitlist/claim`, `/api/attendance/confirm`.
  - Claim and confirm links carry 256-bit random tokens. Only their sha256 hash is stored.
  - GET never changes state, so email link scanners can't claim or confirm.
- **Waitlist answers** are validated with the booking flow's own schema.
- **Waitlist options** expose only taken times, never who booked them.
- **Cron endpoints** compare `CRON_API_KEY` in constant time and fail closed when it's unset.
- **The Polar webhook:**
  - Is signature-verified with both Polar key schemes (cross-tested against the official SDK).
  - Rejects timestamps more than 5 minutes off, caps the body at 1 MB, and is idempotent and safe with out-of-order deliveries.
- **Plans are enforced server-side:**
  - Settings saves return 403 when a paid setting is being turned on.
  - The waitlist, confirmations and AI check the host's plan at runtime.
  - With no billing configured, everyone is on Free.
- **Owner tRPC endpoints** (`waitlist.*`, `requestInsights.get`, `bookingRules.get`) are authenticated and scoped to the host's own data.
- **Custom domains** count only after DNS TXT verification. A domain can't be claimed twice, and the app's own hosts and `*.vercel.app` are reserved. Removing the TXT record un-verifies the domain on the next check.
- **AI prompts** fence requester text as data. Output is structured (a zod schema) and advisory only.

## 7. Before launch checklist
- [ ] Final name and logo (see NOTES.md → "Brand system"), and the regenerated icons
- [ ] Production env vars set, `db-deploy` run, cron jobs scheduled
- [ ] Email domain verified, test emails received (booking, request, waitlist, confirm, reminder)
- [ ] Polar sandbox purchase → Pro, then switch to production
- [ ] Google OAuth app verified for calendar scopes
- [ ] Privacy policy and terms pages
