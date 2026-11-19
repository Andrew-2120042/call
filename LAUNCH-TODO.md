# Launch to-do

Everything still needed before Nodslot goes live. Tick items off as they're done. How to set each one up is in `DEPLOY.md`.

## Accounts and keys (the owner signs up; Claude wires them in)
- [ ] **Domain**: buy it, then replace the `nodslot.site` placeholders (landing `src/site.config.ts` env vars, app URLs).
- [ ] **Hosted database**: Supabase or Neon Postgres. Turn on backups (Supabase Free has none, Pro $25/mo has daily backups). Run `db-deploy`.
- [~] **Email provider (Resend)**: account and a sending-only API key are done (2026-11-16, in `.env.launch-keys`, verified against Resend's API). Still needed: verify the sending domain (SPF, DKIM, DMARC) once the domain is bought. Until then Resend can only send to the account owner. The Resend team is named "wordofwealth21"; rename it or make a Nodslot team if you want them separate.
- [x] **Video key (Daily.co)**: done 2026-11-16. Subdomain `nodslot.daily.co`, key in `.env` and `.env.launch-keys`, app switched on. Tested: a booking gets a Daily room, the link is in the client's email, no more "[Action Required]" host emails.
- [~] **Google**: done for local use 2026-11-16. Project `nodslot-514917`, Calendar API on, consent screen "Nodslot" (External, testing mode, owner's Gmail is the only test user), web client with localhost redirect URIs, keys in both files, Google sign-in turned on. Tested up to Google's consent screen. Still needed after the domain: add the production URLs as redirect URIs, add the domain plus privacy and terms links to the consent screen, and submit for verification (takes weeks; until then only up to 100 listed test users can connect).
- [ ] **Microsoft (Outlook, Teams video)**: blocked. A personal Microsoft account can't register apps without a directory. The owner needs to sign up for a free Azure account (asks for a card to verify identity), then Claude registers the app with redirect `/api/integrations/office365calendar/callback` and `/api/integrations/office365video/callback`.
- [ ] **Billing: launch on Polar** (owner's decision 2026-11-17; Dodo comes later, under the "usuals" business at first). Needed: `POLAR_ACCESS_TOKEN` (empty today, so billing is off and everyone is on Free), Pro ($12) and Team ($69) products, the webhook. **Checkout has never been tested end to end**: do a sandbox purchase before launch.
- [x] **Rate limiting (Unkey)**: done 2026-11-16. Workspace `nodslot`, a root key limited to rate limiting, and all 8 namespaces the app uses (core, common, api, ai, forcedSlowMode, instantMeeting, sms, smsMonth) created. Key in both files, tested. Free tier: 150k checks/month.
- [ ] **Hosting (Vercel)**: two projects, app (`apps/web`) and landing (`landing`).
- [ ] **Scheduler for background jobs**: the cron endpoints in `DEPLOY.md` §4 (reminders, waitlist offers, confirmations, AI summaries, task runner).
- [ ] **Legal review** of the privacy and terms pages.
- [ ] **Anthropic key** for production (`ANTHROPIC_API_KEY`), with a spend limit.

## Product work Claude can do when asked
- [ ] Weekly view on the booking page opens at the start of working hours, not the current time.
- [ ] Optionally hide the "Experimental" Recurring tab and "Overlay my calendar" for a cleaner booking page.
- [ ] Error monitoring (Sentry) so crashes after launch are visible.
- [ ] Publish the Zapier and Make apps (built in `integrations/`, not listed yet). Webhooks already work.
- [ ] Turn on "Sign in with Google".
- [ ] Independent review of the Teams code (commits b6f814b..616d896), then the full test suite and a production build as a final check.
- [x] Waitlist improvements: first-come-first-served option, shorter windows for soon slots, "any time that day" and "earlier than my booking" (done 2026-11-16, tested end to end).
- [ ] Remove the demo Team plan `demo-team-sub` on the `teampro` test account before production (it only exists in the local database).
- [ ] Extra seats on the Team plan (price decided 2026-11-19): $69 covers 10 people; each person after that is $10/month per seat (needs a Dodo seat add-on and lifting the hard 10-seat stop in `TeamService`). Not started.
- [ ] From the launch sweep (see `LAUNCH-SWEEP.md`): "Who's free" on the team page should only list hosts of the service it offers to book.
- [ ] From the launch sweep: re-test a round-robin time that another visitor is holding (it showed as bookable, then failed).
- [ ] The task runner cron (`/api/tasks/cron`) must be scheduled as **GET**, not POST.
- [ ] After each key is added, run the matching "Not tested" item in `LAUNCH-SWEEP.md` (real email, calendar sync, video, Dodo checkout, rate limits, custom domains).
- [ ] **Where production keys live:** `.env.launch-keys` at the repo root (git-ignored). Copy its values into Vercel's environment variables at deploy time; never commit it.
- [ ] `packages/prisma/.env` points at a different database than the root `.env`, so `seed-app-store` fails with P1003 unless run with `DATABASE_URL` set. Fix the file or always pass the URL.
- [ ] **Dodo:** the existing Dodo account is the business "usuals". Decide whether Nodslot sells under it or gets its own business (its own verification) before products are created.
- [ ] **Zapier and Make:** accounts are logged in, but the apps can only be connected and published once the app has a public URL (after the domain and hosting).
- [x] **Help & feedback** in the sidebar (done 2026-11-17): saves to the `Feedback` table and emails `NEXT_PUBLIC_SUPPORT_MAIL_ADDRESS` with reply-to the sender. **Set that address to a real inbox before launch** (it defaults to `support@nodslot.site`).
- [x] **Real email delivery, first pass** (2026-11-17): 6 emails sent through Resend (API and SMTP) to the Resend account's own address, all "Delivered". **Still to do by a person:** open them in that inbox and check they didn't land in spam, and how they look in light and dark mode on phone and desktop. Repeat from the real domain once it's verified.
- [x] **Google, real test** (2026-11-17): calendar connected on the `teampro` test account, booking created an event, Google busy time blocked the slot, cancelling removed the event; "Sign in with Google" created a verified account. Scripts: `scripts/launch-sweep/gcal.cjs`, `google.cjs`.
- [ ] **All connections need one more pass on the live domain** (owner's note): Google with production redirect URLs, Microsoft once Azure exists, Resend from the real domain, Dodo checkout, Zapier and Make.
- [x] Google sign-in asks for calendar access as well as name and email: owner confirmed this is intended (2026-11-17).
- [x] **Security review** done 2026-11-17 (see "Security review" in `LAUNCH-SWEEP.md`): no leaks, no SQL injection, 44 live security checks passed (26 of them cross-account attacks, all refused); one gap fixed (rate limits on "Send reply" and invites).
- [ ] Security follow-ups: make sure `UNKEY_ROOT_KEY` is set in production (limits fail open without it); turn on a Content-Security-Policy; add a daily cap on outgoing reply/invite emails; confirm `/api/email` returns 403 on the live site.
