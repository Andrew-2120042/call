# Slotwise: project notes (read first)

"Slotwise" is a **placeholder name**. Rename by changing `NEXT_PUBLIC_APP_NAME` in `.env` plus the brand assets.

## The product
**A booking tool where you decide who gets on your calendar.** It is built for solo service businesses: consultants, coaches, freelancers, creators, therapists, beauty and wellness pros.

The product is NOT "a cheaper Cal.com". Cal.diy is only the scheduling engine underneath: calendar sync, availability, slots and the booking pages.

**The four core features. No competitor combines all four in one cheap, good-looking solo product:**
1. **Booking requests you approve.** The client requests a slot, and the owner approves or declines. Calendly users have asked for this for years, and Calendly's staff say there is no native option.
2. **Screening questions / intake forms** before booking, with conditional questions and file uploads. Calendly only offers this on its Teams plan ($16–20/seat).
3. **Waitlist that auto-fills cancellations.** When a slot opens, waitlisted clients are notified and the first to claim it gets it.
4. **Confirm-or-release.** The client must confirm before a deadline. If they don't, the owner is alerted and the slot can go back to the waitlist.

Plus:
- An **AI helper on each request**: a summary, a spam/low-fit flag and a drafted reply. It is a quiet helper, not the headline.
- **Good-looking, customizable pages:** basic customization is free; custom domain and no badge are Pro.

### Competitors (as of 2026-11-13)
- **Acuity:** intake forms and waitlist, but no approval.
- **Cal.com:** "requires confirmation", but screening forms are a team feature.
- **Orbit AI, Zeeg:** forms, AI qualification and booking.
- **HoneyBook:** inquiry → proposal → booking, $16+/mo.
- **Calendly:** no approval at all. Its routing forms are Teams-only.

### Demand evidence
- Google autocomplete returns: "calendly approval required", "calendly manual approval", "calendly approve booking", "calendly intake form", "calendly screening/qualifying questions", "calendly waitlist", "acuity waitlist", "calendly confirm appointment".
- Calendly community threads request approval and were never built.
- Freelancers glue together form + AI + Calendly for $20–30/mo.
- Weak or no demand: "inquiry" wording, rebook reminders, review requests. These are later or never.
- Not yet proven: willingness to pay. That needs about 20 user conversations or a waitlist landing page.

## Pricing
- **Free:** 1 person, unlimited event types, basic customization, 1 screening form, email reminders, badge.
- **Pro, $12/mo:** approval requests, screening forms (unlimited, conditional), waitlist auto-fill, confirm-or-release, AI request helper, SMS/WhatsApp reminders, custom domain, no badge, Calendly import.
- **Team, $49/mo flat for up to 10 people:** later.
- **Deposits, card-on-file and no-show fees:** built and tested in Stripe test mode, but switched on only after a US entity exists.
  - That needs a US LLC (~$100–250 DIY or Atlas ~$500), funded from revenue.
  - Remember the yearly Form 5472 for a foreign-owned LLC.
- **HIPAA tier:** built but parked.

## Decisions the user has made
- **No "open source" marketing.** Keep the MIT notice in `LICENSE` and remove all Cal.com / Cal.diy branding.
- **Not an MVP:** everything ships production-ready, with tests, types, error handling and polish.
- **Solo businesses first, US audience.** No enterprise sales.
- **Our billing:** Polar (merchant of record, same as WhoIsCooking).
- **Owners' payments:** owners connect their own Stripe through **Stripe Connect** (the upstream OAuth flow).
  - **Never** ask owners to paste API keys. The user rejected that.
  - The user's Stripe is an Indian individual account, which can't be a Connect platform for US accounts. So develop with a Stripe test-mode account set to the US, and use a US entity for launch.
- **SMS:** Twilio, after toll-free verification. Before that, email and WhatsApp.

## What the engine (Cal.diy) already gives us
- Booking pages, availability and slots.
- Google, Apple, Outlook and CalDAV calendars.
- Embeds, webhooks and integrations.
- Stripe HOLD (card on file), `chargeCard`, `handleNoShowFee`, the no-show email and no-show marking.
- PayPal.
- Likely "requires confirmation" (to verify), which is the base for feature #1.

What it removed: Teams, Organizations, Workflows (and with them SMS), SSO and Insights.

## Phases
1. **Run the engine locally:** a booking flow end to end. (in progress)
2. **Rebrand + design system:** our name, logo and look, plus free customization (themes, fonts, logo, layout presets, badge).
3. **The core four:** approval requests → screening forms → waitlist auto-fill → confirm-or-release. Includes email/WhatsApp reminders and the AI request helper.
4. **Pro billing with Polar**, custom domain, Calendly import, sync health check.
5. **Production launch:** hosting, hardening, monitoring, backups, landing page.
6. **Later:** deposits / no-show fees (US entity), SMS, Team plan, HIPAA tier (parked).

## Brand system (how to rename)
The name is placeholder until the user picks the real one, which happens before the Instagram page and launch.

To rename:
1. Set `NEXT_PUBLIC_APP_NAME` in `.env` (and in production env vars).
2. Optionally set `NEXT_PUBLIC_COMPANY_NAME`, `NEXT_PUBLIC_SUPPORT_MAIL_ADDRESS` and `EMAIL_FROM_NAME`. Their code defaults in `packages/lib/constants.ts` also say Slotwise.
3. Replace `apps/web/public/brand/mark.svg` (logo mark, #292929 on transparent) and `brand/app-icon.svg` (512px app icon) if the mark changes.
4. Run `node scripts/brand/generate-brand-assets.mjs`. It regenerates the wordmarks, every favicon/app icon/mstile, `favicon.ico`, `safari-pinned-tab.svg` and the `site.webmanifest` name.
5. Restart the app.

How it works:
- Translations use `{{appName}}` everywhere; all 37 locales were converted from Cal.diy/Cal.com.
- The value is injected through i18next `defaultVariables`, from `packages/i18n/brand.js`, in both `next-i18next.config.js` and `server.ts`.
- The wordmark uses SVG `<text>` with a pinned `textLength`. Replace it with outlined paths once there is a final logotype.

## Waitlist (built 2026-11-13)
- Service setting: `EventType.waitlistEnabled`.
- Table: `WaitlistEntry`. Statuses: WAITING → OFFERED → CLAIMED, or EXPIRED / REMOVED. Only the sha256 of the claim token is stored.
- Code lives in `packages/features/waitlist`, with `WaitlistService` holding all the rules.
- Public API:
  - `POST /api/waitlist/join`
  - `GET|POST /api/waitlist/claim` (GET only reads the offer, so email link scanners can't claim).
  - Claim page: `/waitlist/claim/<token>`.
- A slot is offered to the next person automatically after a cancel (`handleCancelBooking`), a reject (`confirm.handler`) or a reschedule (`RegularBookingService`).
- **Cron (production must schedule this every 5 minutes):** `POST /api/cron/waitlist` with header `authorization: $CRON_API_KEY`. It expires unclaimed offers, offers the slot to the next person, and drops past slots.
- Env: `WAITLIST_OFFER_WINDOW_MINUTES` (default 120). An offer never outlives the slot start.
- Owner tRPC: `waitlist.list`, `waitlist.remove`. No UI yet (item 8).

## Confirm-or-release (built 2026-11-13)
- Service settings:
  - `EventType.attendeeConfirmationHours`: 1–168, null = off. This is the deadline before the start.
  - `releaseUnconfirmedBookings`: cancel the booking and free the slot, or only alert the host.
- Table: `BookingAttendeeConfirmation`. Statuses: REQUESTED → CONFIRMED, MISSED or CANCELLED. Only the token hash is stored.
- The request email goes out 24h before the deadline. Bookings made after the deadline are never asked.
- A release cancels through `BookingCancelService` as the host, so emails, calendars and the **waitlist offer** all fire.
- Client page: `/attendance/confirm/<token>`. API: `GET|POST /api/attendance/confirm` (GET only reads).
- **Cron (production must schedule this every 5 minutes):** `POST /api/cron/attendee-confirmations` with header `authorization: $CRON_API_KEY`.
- Shared email layout: `packages/emails/src/templates/ActionEmail.tsx`.

## Attendee reminders (built 2026-11-13)
- Setting: `EventType.attendeeReminderMinutes` (Int[]; default `{1440}`, meaning 24h before; max 5 values, each 1–20160).
- `BookingReminderSent` (unique bookingId + minutesBefore) guarantees each reminder is sent exactly once.
- Rules:
  - Never sent if the booking was made after the reminder time.
  - If several reminders are due, only the nearest goes out and the stale ones are retired.
- **Cron (every 5 minutes):** `POST /api/cron/attendee-reminders` (CRON_API_KEY).
- All cron routes share `apps/web/lib/cron/isCronRequestAuthorized.ts` (constant-time compare).
- Upstream's `/api/cron/bookingReminder` (host reminders for pending requests) still exists. Schedule it too.

## AI request helper (built 2026-11-13)
- `BookingRequestInsight`: summary, fit (GOOD/UNCLEAR/POOR), spamLikely, concerns, suggestedReply. It's advisory only and never acted on automatically.
- Code: `packages/features/booking-request-insights`.
  - Calls the Anthropic TS SDK with `client.beta.messages.parse`, a zod (v4) schema, effort `low`, and server-side `fallbacks: "default"`.
  - Model: `claude-opus-5-5`, overridable with `REQUEST_INSIGHTS_MODEL`.
- Prompt injection: the requester's answers are fenced in `<request>`, with `<` and `>` neutralised, and the system prompt says to treat them as data.
- Off unless `ANTHROPIC_API_KEY` is set. **No key on the dev machine yet.** Verified with mocks and with a deliberately invalid key, which gave a real 401 that was logged gracefully.
- **Cron (every minute):** `POST /api/cron/request-insights`. Owner read: tRPC `requestInsights.get({ bookingUid })`, scoped to the host.
- Gotcha: new env vars must be added to `turbo.json` `globalEnv`, or Turbo strips them.

## Plans and billing (built 2026-11-13)
- `PlanSubscription` (one per user) is written **only** by verified Polar webhooks (`POST /api/billing/polar/webhook`).
  - Stale and out-of-order deliveries are ignored, using `polarModifiedAt`.
  - A late event about an old subscription never replaces a current paid one.
- Effective plan (`packages/features/plans/lib/entitlements.ts`):
  - active or trialing → that plan.
  - canceled or past_due → still paid until `currentPeriodEnd`.
  - Otherwise FREE.
- **Enforced even when billing isn't configured** (everyone is Free), so a production misconfiguration can't hand out Pro.
- Feature matrix:
  - FREE: no approval, waitlist, confirm-or-release or AI; 2 screening questions per service; 1 reminder.
  - PRO: all of those, plus branding removal and custom domain (both still to build).
  - TEAM: PRO plus team scheduling.
- Enforcement:
  1. Event type update (tRPC FORBIDDEN, only when *turning on* or growing past a limit, so downgraded users can still save).
  2. Runtime: waitlist join/offer, confirmation requests and AI insights check the host's plan.
- Polar:
  - REST via `polarGateway.ts` (checkout `/v1/checkouts/`, portal `/v1/customer-sessions/`).
  - Webhook verifier `polarWebhook.ts` (Standard Webhooks, both key schemes, 5 min window), cross-tested against the official `@polar-sh/sdk`, which is a devDependency only. Its versioned subpaths don't resolve under this repo's `moduleResolution: node`.
- API: `GET /api/billing/plan`, `POST /api/billing/checkout {plan}`, `POST /api/billing/portal`.
- Env: `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`, `POLAR_ENVIRONMENT` (sandbox by default), `POLAR_PRO_PRODUCT_ID`, `POLAR_TEAM_PRODUCT_ID`.
- Dev: put the local user on Pro with `node scripts/dev/send-polar-webhook.mts subscription.active active <ISO>`.
- **To go live:** create the Pro ($12) and Team ($49) products in Polar, set the env vars, and register the webhook URL.

## Owner screens (built 2026-11-13; functional, the UI redesign comes later)
- **Service → Advanced tab → "Booking rules" card** (`BookingRulesCard.tsx`): waitlist toggle plus a shareable join link, confirm-or-release, and reminder chips.
  - Saves through the guarded update. Data: tRPC `bookingRules.get` (host-scoped).
- `/settings/billing` (plan, upgrade, manage) and `/waitlist` (list and remove) are in the sidebar.
- Public join page: `/waitlist/join/<eventTypeId>?date=YYYY-MM-DD`.
  - Data: `GET /api/waitlist/options` (questions plus taken times only).
  - Join answers are validated with the booking flow's own responses schema (`validateWaitlistResponses`).
- The AI summary panel on `/booking/<uid>` shows for the host only.
- TODO (UI pass): link to the join page from inside the booker; Linktree-style dashboard per the design prototypes.

## Local dev
- Postgres: Homebrew `postgresql@17`, database `slotwise_dev`, user `andrewwilson`, port 5432.
- `.env` is gitignored and holds generated secrets.
- Yarn is not installed globally, so always run `corepack yarn …`.
- The Mac must stay cool: run heavy jobs one at a time with `nice -n 15`. Never run builds in parallel.
- The repo path contains a space ("my projects"). Because of that, the app-store CLI's Biome step logs "internalError/io" and leaves `*.generated.ts` unformatted. That is harmless and matches upstream, which commits those files unformatted.
  - Do NOT "fix" it: formatting them causes ~700 lines of diff against upstream and merge conflicts.
- **Biome auto-fix danger:** `biome check --write` adds `import process from "node:process"` to files that use `process.env`.
  - That breaks the production build for anything loaded in the browser or at the edge (it failed on `/api/social/og/image`), and it stops `NEXT_PUBLIC_*` inlining.
  - Guarded by `packages/lib/clientSafeImports.test.ts`. Add new client or edge files there.
- Repo conventions: see `CLAUDE.md` / `AGENTS.md`. Use `select` not `include`, never `as any`, put UI strings in `packages/i18n/locales/en/common.json`, and run Biome and type-checks.
