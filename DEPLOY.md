# Deploying Slotwise to production

Slotwise is a Next.js monorepo (the Cal.diy engine plus Slotwise features) backed by Postgres.

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
| `/api/cron/bookingReminder` | hourly | Upstream: reminds hosts about requests still waiting for approval |

On Vercel, use Vercel Cron with a small proxy or an external scheduler (for example GitHub Actions or cron-job.org) that sends the header. Every job is idempotent, so overlapping runs are safe.

## 5. Polar billing setup
1. Create products **Pro ($12/month)** and **Team ($49/month)** and copy their ids into `POLAR_PRO_PRODUCT_ID` and `POLAR_TEAM_PRODUCT_ID`.
2. Create an organization access token with `checkouts:write` and `customer_sessions:write` and set it as `POLAR_ACCESS_TOKEN`.
3. Add a webhook to `https://<app>/api/billing/polar/webhook` with the `subscription.*` events, then copy its secret into `POLAR_WEBHOOK_SECRET`.
4. Test in sandbox first (`POLAR_ENVIRONMENT=sandbox`) with a test card, and confirm `/settings/billing` shows Pro.

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
- **AI prompts** fence requester text as data. Output is structured (a zod schema) and advisory only.

## 7. Before launch checklist
- [ ] Final name and logo (see NOTES.md → "Brand system"), and the regenerated icons
- [ ] Production env vars set, `db-deploy` run, cron jobs scheduled
- [ ] Email domain verified, test emails received (booking, request, waitlist, confirm, reminder)
- [ ] Polar sandbox purchase → Pro, then switch to production
- [ ] Google OAuth app verified for calendar scopes
- [ ] Privacy policy and terms pages
